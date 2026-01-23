# Database Schema

This document mirrors `prisma/schema.prisma`. Table names follow Prisma defaults (PascalCase).

## Core Content

### Program

```
Program
-------
id           TEXT (PK)
title        TEXT
description  TEXT NULL
language     TEXT
status       TEXT
publishedAt  TIMESTAMP NULL
createdAt    TIMESTAMP (default now)
updatedAt    TIMESTAMP (updatedAt)
```

Indexes: `status`, `language`, `publishedAt`.

### Episode

```
Episode
-------
id               TEXT (PK)
programId        TEXT (FK → Program.id)
title            TEXT
description      TEXT NULL
durationSeconds  INTEGER
audioUrl         TEXT NULL
publishedAt      TIMESTAMP NULL
createdAt        TIMESTAMP (default now)
updatedAt        TIMESTAMP (updatedAt)
```

Indexes: `programId`, `publishedAt`.

### Category

```
Category
--------
id        TEXT (PK)
name      TEXT
slug      TEXT (UNIQUE)
createdAt TIMESTAMP (default now)
```

### ProgramCategory

```
ProgramCategory
---------------
programId  TEXT (FK → Program.id)
categoryId TEXT (FK → Category.id)
```

Composite primary key: `(programId, categoryId)`.

## Authentication

### User

```
User
----
id           TEXT (PK)
email        TEXT (UNIQUE)
passwordHash TEXT
isActive     BOOLEAN (default true)
createdAt    TIMESTAMP (default now)
updatedAt    TIMESTAMP (updatedAt)
```

### Role

```
Role
----
id   TEXT (PK)
name TEXT (UNIQUE)
```

### UserRole

```
UserRole
--------
userId TEXT (FK → User.id)
roleId TEXT (FK → Role.id)
```

Composite primary key: `(userId, roleId)`.

## Search Outbox

### SearchOutboxEvent

```
SearchOutboxEvent
-----------------
id          TEXT (PK)
type        TEXT
entityId    TEXT
payload     JSONB
status      SearchOutboxStatus (default PENDING)
attempts    INTEGER (default 0)
nextAttemptAt TIMESTAMP (default now)
lastError   TEXT NULL
createdAt   TIMESTAMP (default now)
processedAt TIMESTAMP NULL
```

Indexes: `(status, createdAt)`, `type`.

### SearchOutboxStatus

Enum values: `PENDING`, `PUBLISHED`, `FAILED`.

## Relationships Summary

```
Program 1 ────< Episode
Program >────< Category (via ProgramCategory)
User >────< Role (via UserRole)
```
