# ADR 0003: Studio API Key Authentication

## Status
Accepted

## Context
Studio endpoints are internal and require a lightweight access control mechanism. We need a simple approach that secures Studio APIs without introducing a full identity system.

## Decision
Protect Studio endpoints with a static API key passed via the `X-Studio-Api-Key` header. Explore endpoints remain public. The API key is managed via environment configuration and is intended for trusted internal clients.

## Options Considered
1) Static API key header (chosen).
2) JWT-based auth with user accounts.
3) OAuth2/OIDC with an external identity provider.

## Consequences
- Minimal implementation and operational overhead.
- Suited for internal use and early-stage development.
- Limited auditability and user-level permissions.
- Key rotation and distribution must be handled carefully.

## How to Validate
```bash
curl -H "X-Studio-Api-Key: <key>" http://localhost:3000/studio/programs
```
