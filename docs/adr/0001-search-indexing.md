# ADR 0001: Search Indexing Strategy

## Status
Accepted

## Context
Thmanyah Platform provides public discovery and search through Explore. PostgreSQL is the source of truth, and search requires a dedicated engine (Meilisearch). We need an indexing approach that is simple to operate while keeping Explore results reasonably fresh.

## Decision
Index programs into Meilisearch synchronously within Studio write operations. After a program create/update/category assignment, the service upserts the program into Meilisearch. On delete or when status is no longer published, the document is removed. This yields eventual consistency from the user perspective while keeping the implementation minimal.

## Options Considered
1) Synchronous indexing in the request path (chosen).
2) Asynchronous indexing via outbox table + background worker.
3) No external search index; rely on PostgreSQL full-text search.

## Consequences
- Simpler implementation and fewer moving parts.
- Write latency increases slightly due to search update.
- Failures in Meilisearch indexing surface as API errors and require retry or manual correction.
- Eventual consistency is acceptable for Explore; writes remain strongly consistent in PostgreSQL.

## How to Validate
- Create or update a published program in Studio and verify it appears in `/explore/search`.
- Update categories for a program and verify the indexed categories reflect the change.
- Unpublish or delete a program and confirm it is removed from search results.
