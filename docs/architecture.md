# Architecture Overview

Thmanyah Platform is a NestJS modular monolith with two primary modules: Studio (internal CMS) and Explore (public discovery). Everything runs as a single service with shared database, cache, and search infrastructure.

## Modular Monolith

We keep each module as a bounded context with its own controllers and services. Shared concerns (database, cache, search, config, health, observability) live in `src/shared` to avoid duplication.

## Modules

- Studio: authenticated write APIs for programs, episodes, and categories.
- Explore: public read APIs for browse and search.
- Ingestion: importer framework (service-only, no HTTP endpoints).
- Shared: Prisma database access, Meilisearch client + outbox relay/consumer, Redis cache, config validation, health, observability.

## Data Flow

### Write Path (Studio)

```
Editor → Studio API → PostgreSQL → SearchOutboxEvent → OutboxRelay → RabbitMQ → IndexerConsumer → Meilisearch
```

PostgreSQL is the source of truth. Program create/update/delete and category changes enqueue outbox events in the same DB transaction. A relay worker publishes pending outbox events to RabbitMQ. Indexer consumers process the queue and sync the `programs` index. Only `published` programs are indexed; unpublished ones are removed.

### Read Path (Explore)

```
User → Explore API → Redis cache → Meilisearch / PostgreSQL (replica)
```

Browse endpoints read from PostgreSQL (published programs/episodes, categories). Search endpoints query Meilisearch. Redis caching is optional and disabled when `REDIS_URL` is not set.

## Search Indexing Strategy

Outbox events are stored in `SearchOutboxEvent` with status (`PENDING`, `PUBLISHED`, `FAILED`). The relay claims pending events in batches, publishes to RabbitMQ, and retries failures with backoff. Indexer consumers can run in multiple instances for scale; handlers are idempotent, so duplicate messages are safe. Meilisearch settings are configured on startup (searchable: title/description; filterable: language/categories/publishedAt; sortable: publishedAt/createdAt).

## Caching Strategy

Explore responses are cached with a TTL (60 seconds). The cache is deliberately simple: keys are based on the route and normalized query params, and there is no explicit invalidation. This keeps the implementation small but means data can be stale until the TTL expires.

## Read Replicas (Prisma Client Extension)

Read traffic is routed through Prisma's read replicas extension. By default, non-transactional reads go to replicas, while writes and `$transaction` remain on the primary. For read-after-write or strict consistency, use `$primary()` to force reads to the primary. `$replica()` can be used to explicitly send a read to a replica. Replica URLs are provided via `DATABASE_REPLICA_URLS` (comma-separated).

Rationale: Prisma's recommended read replicas extension keeps routing consistent with Prisma Client semantics and avoids custom query routing logic.

## Security Model

Studio endpoints are protected by JWT auth and role-based access (admin/editor). Explore endpoints are public.

## Observability

Each request gets an `x-request-id` header, which is returned in the response. HTTP access logs are emitted as JSON with method/path/status/duration and requestId. Errors are normalized via a global exception filter (`statusCode`, `error`, `message`, `path`, `timestamp`, `requestId`). Health endpoints are available at `/health` and `/health/ready`.

## Future Content Import (Ingestion Framework)

The ingestion framework uses a Strategy + Registry pattern with a Template Method base class. Importers implement `fetchRaw()` and `mapToDomain()` while the base importer handles validation, persistence via Studio services, and optional search indexing. This keeps the write path consistent and ensures validation and business rules remain centralized in service layers. Explore read APIs and Meilisearch indexing do not need changes because Explore reads only from PostgreSQL/Meilisearch and indexing is already decoupled via the outbox relay.

To add a new importer:

1. Create a new importer class that extends `BaseImporter` and set a unique `source`.
2. Implement `fetchRaw()` and `mapToDomain()` for the new source.
3. Register the importer in `IngestionModule` using the `CONTENT_IMPORTER` provider token.

External integrations (YouTube, RSS, etc.) are intentionally out of scope for this submission; the framework is designed to support them later without redesigning the core system.

## What We Intentionally Did Not Do

- No cache invalidation strategy beyond TTL.
- No external ingestion connectors in this codebase.
- No dead-letter queue for failed RabbitMQ messages.
