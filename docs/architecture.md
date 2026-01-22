# Architecture Overview

Thmanyah Platform is a NestJS modular monolith with two primary modules: Studio (internal CMS) and Explore (public discovery). Everything runs as a single service with shared database, cache, and search infrastructure.

## Modular Monolith

We keep each module as a bounded context with its own controllers and services. Shared concerns (database, cache, search, config, health, observability) live in `src/shared` to avoid duplication.

## Modules

- Studio: authenticated write APIs for programs, episodes, and categories.
- Explore: public read APIs for browse and search.
- Shared: Prisma database access, Meilisearch client + outbox worker, Redis cache, config validation, health, observability.

## Data Flow

### Write Path (Studio)

```
Editor → Studio API → PostgreSQL → SearchOutboxEvent → SearchOutboxWorker → Meilisearch
```

PostgreSQL is the source of truth. Program create/update/delete and category changes enqueue outbox events. A background worker polls the outbox every 5 seconds (batch size 20) and syncs the `programs` index. Only `published` programs are indexed; unpublished ones are removed.

### Read Path (Explore)

```
User → Explore API → Redis cache → Meilisearch / PostgreSQL
```

Browse endpoints read from PostgreSQL (published programs/episodes, categories). Search endpoints query Meilisearch. Redis caching is optional and disabled when `REDIS_URL` is not set.

## Search Indexing Strategy

Outbox events are stored in `SearchOutboxEvent` with status (`pending`, `processed`, `failed`). The worker retries failed events and logs outcomes. Meilisearch settings are configured on startup (searchable: title/description; filterable: language/categories/publishedAt; sortable: publishedAt/createdAt).

## Caching Strategy

Explore responses are cached with a TTL (60 seconds). The cache is deliberately simple: keys are based on the route and normalized query params, and there is no explicit invalidation. This keeps the implementation small but means data can be stale until the TTL expires.

## Security Model

Studio endpoints are protected by JWT auth and role-based access (admin/editor). Explore endpoints are public.

## Observability

Each request gets an `x-request-id` header, which is returned in the response. HTTP access logs are emitted as JSON with method/path/status/duration and requestId. Errors are normalized via a global exception filter (`statusCode`, `error`, `message`, `path`, `timestamp`, `requestId`).
