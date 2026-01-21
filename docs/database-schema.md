# Database Schema Design

This document describes the database schema used for the Content Management and Discovery platform.

The schema is designed to:
- Support strong consistency for CMS write operations
- Optimize read-heavy discovery traffic
- Remain simple and extensible

---

## Overview

The system is built around three core entities:
- Programs
- Episodes
- Categories

Relationships are designed to reflect real-world content structure while remaining efficient for querying.

---

## Tables

### programs

Represents a podcast or show (e.g., "فنجان").

```sql
programs
--------
id              UUID (PK)
title           VARCHAR
description     TEXT
language        VARCHAR
status          VARCHAR   -- draft | published | archived
published_at    TIMESTAMP
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**Notes:**
- `status` is modeled as a string for extensibility.
- `published_at` is separated from creation time.
- `language` is stored at the program level for simplicity.

---

### episodes

Represents individual episodes belonging to a program.

```sql
episodes
--------
id                UUID (PK)
program_id        UUID (FK → programs.id)
title             VARCHAR
description       TEXT
duration_seconds  INTEGER
audio_url         TEXT
published_at      TIMESTAMP
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

**Notes:**
- Each episode belongs to exactly one program.
- `duration_seconds` enables numeric filtering in discovery.
- Episodes inherit visibility from their program.

---

### categories

Represents content categories (e.g., Business, Technology).

```sql
categories
----------
id          UUID (PK)
name        VARCHAR
slug        VARCHAR (UNIQUE)
created_at  TIMESTAMP
```

**Notes:**
- `slug` is used for URL-safe identifiers.
- Categories are normalized to avoid duplication.

---

### program_categories

Join table to support many-to-many relationships between programs and categories.

```sql
program_categories
------------------
program_id   UUID (FK → programs.id)
category_id  UUID (FK → categories.id)
```

**Notes:**
- A program can belong to multiple categories.
- Composite primary key can be applied if needed.

---

## Relationships

```
Program 1 ────< Episodes
Program >────< Categories
```

---

## Indexing Strategy

Indexes are added to support high read throughput and filtering.

```sql
-- Programs
INDEX ON programs (status);
INDEX ON programs (language);
INDEX ON programs (published_at);

-- Episodes
INDEX ON episodes (program_id);
INDEX ON episodes (published_at);

-- Categories
UNIQUE INDEX ON categories (slug);
```

---

## Discovery Optimization

- PostgreSQL serves as the source of truth.
- Discovery queries rely primarily on a search engine.
- The database schema is optimized for writes and integrity.
- Heavy joins are avoided in public APIs.

---

## Consistency Model

- Write operations use strong consistency via PostgreSQL transactions.
- Read operations tolerate eventual consistency.
- Search indexes are updated asynchronously after writes.

---

## Summary

This schema provides a clean and scalable foundation for both content management and discovery use cases. It balances relational integrity with performance and is designed to evolve alongside the system architecture.
