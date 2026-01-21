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
| Thmanyah Studio | Internal content management (programs, episodes, categories) |
| Thmanyah Explore | Public read-only APIs for discovery (search, browse) |
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
| Search | OpenSearch / Meilisearch | Full-text search, filtering |

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
