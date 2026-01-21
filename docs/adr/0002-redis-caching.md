# ADR 0002: Redis Caching Strategy

## Status
Accepted

## Context
Explore endpoints are read-heavy and benefit from caching to reduce latency and database/search load. We need a simple caching strategy that balances freshness with performance while keeping operational complexity low.

## Decision
Cache Explore browse and search responses in Redis. Cache keys are derived from the route and a normalized query string, prefixed with a version (e.g., `explore:v1:programs?page=1&limit=20`). Cache entries use a short TTL to limit staleness. Invalidation relies primarily on TTL expiration; version prefixes can be bumped if a breaking response shape change occurs.

## Options Considered
1) TTL-only caching with stable key design (chosen).
2) Event-driven invalidation on every write.
3) No caching; rely on database and search performance.

## Consequences
- Reduced latency and load for hot Explore queries.
- Stale data is possible within the TTL window.
- Simpler implementation with minimal invalidation logic.
- Versioned keys provide a safety valve for response shape changes.

## How to Validate
- Hit the same Explore browse or search endpoint twice and observe the second response is served from cache (lower latency).
- Update content in Studio and verify cached Explore responses expire after the TTL.
