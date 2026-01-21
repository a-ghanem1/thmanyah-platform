# Architecture Overview

Thmanyah Platform is a NestJS modular monolith with two primary modules:

- **Thmanyah Studio**: internal CMS APIs for writing programs, episodes, and categories.
- **Thmanyah Explore**: public discovery APIs for browsing and searching content.

The service runs as a single NestJS application with shared database, cache, and search infrastructure.

## Modular Monolith

Each module is a bounded context with its own controllers/services, while shared concerns (database, cache, search, config, observability) live in the shared layer.

## Modules

- **Thmanyah Studio**: authenticated write APIs (programs, episodes, categories).
- **Thmanyah Explore**: public read APIs (browse, search).
- **Shared**: Prisma database access, Meilisearch client + outbox worker, Redis cache, config validation, health, observability.

## Data Flow

### Write Path (Thmanyah Studio)

```
Editor → Studio API → PostgreSQL → SearchOutboxEvent → SearchOutboxWorker → Meilisearch
```

- PostgreSQL is the source of truth.
- Program create/update/delete and category changes enqueue outbox events.
- The background worker polls the outbox (every 5s, batch size 20) and syncs the `programs` index.
- Only `published` programs are indexed; unpublished programs are removed from search.

### Read Path (Thmanyah Explore)

```
User → Explore API → Redis cache (if configured) → Meilisearch / PostgreSQL
```

- Browse endpoints read from PostgreSQL (published programs/episodes, categories).
- Search endpoints query Meilisearch.
- Program list/details, program episodes, and search responses are cached via a read-through cache; Redis is optional and disabled when `REDIS_URL` is not set.

## Search Indexing Strategy

- Outbox events are stored in `SearchOutboxEvent` with status (`pending`, `processed`, `failed`).
- The worker retries failed events and logs outcomes.
- Meilisearch settings are configured on startup (searchable: title/description; filterable: language/categories/publishedAt; sortable: publishedAt/createdAt).

## Caching Strategy

- Read-through cache keyed by route + normalized query params.
- Cached endpoints: program list/details, program episodes, and search results.
- Default TTL is 60 seconds with no explicit invalidation; entries expire by TTL.

## Security Model

- Studio endpoints are protected by JWT auth and role-based access (admin/editor).
- Explore endpoints are public.

## Observability

- `x-request-id` is injected per request and returned in responses.
- HTTP access logs are emitted as JSON with request metadata.
- Errors are normalized via a global exception filter (`statusCode`, `error`, `message`, `path`, `timestamp`, `requestId`).
