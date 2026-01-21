# Architecture Overview

This document describes the architectural decisions, trade-offs, and system design for **Thmanyah Platform**.

Thmanyah Platform consists of:
- **Thmanyah Studio**: Internal content management system for editors
- **Thmanyah Explore**: Public discovery and search experience for users

The system is designed to:
- Serve internal CMS users (editors)
- Serve public discovery traffic at scale
- Remain simple to operate
- Be ready to scale horizontally

---

## Architectural Style

### Modular Monolith

The backend is implemented as a modular monolith using NestJS.  
Each module represents a clear bounded context with explicit responsibilities.

**Why modular monolith?**
- Clear module boundaries (low coupling, high cohesion)
- Single deployable unit (simple operations)
- Faster development and iteration
- Prepared for future extraction into microservices if needed

---

## Modules

| Module | Responsibility |
|------|----------------|
| Studio | Internal content management (programs, episodes, categories) |
| Explore | Public read-only APIs for discovery (search, browse) |
| Ingestion | Import content from external sources |
| Shared | Database, cache, configuration, logging |

---

## Data Flow

### Write Path (Thmanyah Studio)

```
Editor → Studio API → PostgreSQL → Async indexing → Search Engine
```

- PostgreSQL is the source of truth
- Search index is updated asynchronously
- Eventual consistency is acceptable for discovery use cases

---

### Read Path (Thmanyah Explore)

```
User → Explore API → Redis Cache → Search Engine → (optional DB)
```

- Optimized for high read throughput
- Horizontally scalable
- Highly available

---

## CQRS Considerations

The system follows CQRS principles implicitly:
- Write operations are handled through **Thmanyah Studio**
- Read operations are optimized through **Thmanyah Explore** using cache and search indexes
- A single write database is used to reduce operational complexity

This approach provides most CQRS benefits without introducing unnecessary infrastructure complexity.

---

## CAP Theorem

| Area | Choice |
|----|----|
| Thmanyah Studio (Write) | Consistency + Partition tolerance (CP) |
| Thmanyah Explore (Read) | Availability + Partition tolerance (AP) |

Strong consistency is enforced for writes, while discovery favors availability with eventual consistency.

---

## Data Storage

| Component | Technology | Reason |
|----|----|----|
| Primary DB | PostgreSQL | Relational data, transactions, indexing |
| Cache | Redis | Low latency, hot content |
| Search | Meilisearch | Full-text search, filtering |

PostgreSQL can be deployed on Amazon RDS or Aurora PostgreSQL depending on scale requirements.

---

## Deployment & Scalability

- Stateless API instances
- Horizontal scaling via load balancer
- Docker-based deployment
- No Kubernetes in initial version to reduce complexity

### Future Improvements
- Kubernetes (EKS)
- Read replicas
- Dedicated ingestion workers
- Event-driven architecture

---

## Key Design Principles

- SOLID principles
- Low coupling between modules
- Explicit boundaries
- Simplicity over premature optimization

---

## Summary

This architecture balances scalability, operational simplicity, and engineering quality, making it suitable for high read traffic while remaining easy to maintain and extend.

---

## Search Indexing Strategy

Search is powered by **Meilisearch**. Programs are indexed from Studio writes with eventual consistency. The current implementation performs synchronous indexing immediately after database writes; failure is surfaced as an application error and can be retried manually.

References: `docs/adr/0001-search-indexing.md`

## Caching Strategy

Explore endpoints are intended to cache read-heavy responses. Cache keys are namespaced by endpoint and query parameters, and TTLs are short-lived to reduce staleness. Invalidation is handled by write-side updates when relevant records change.

References: `docs/adr/0002-redis-caching.md`

## Security Model

Studio APIs are protected by an API key, while Explore remains public. Rate limiting may be applied to public endpoints as needed.

References: `docs/adr/0003-studio-auth.md`

## Observability

Requests carry a request id and logs are structured for HTTP tracing. Error responses follow a consistent JSON shape across the API to simplify monitoring and client handling.

References: `docs/adr/0004-observability.md`
