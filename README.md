```
 _____ _                                       _
|_   _| |__  _ __ ___   __ _ _ __  _   _  __ _| |__
  | | | '_ \| '_ ` _ \ / _` | '_ \| | | |/ _` | '_ \
  | | | | | | | | | | | (_| | | | | |_| | (_| | | | |
  |_| |_| |_|_| |_| |_|\__,_|_| |_|\__, |\__,_|_| |_|
                                   |___/
 ____  _       _    __
|  _ \| | __ _| |_ / _| ___  _ __ _ __ ___
| |_) | |/ _` | __| |_ / _ \| '__| '_ ` _ \
|  __/| | (_| | |_|  _| (_) | |  | | | | | |
|_|   |_|\__,_|\__|_|  \___/|_|  |_| |_| |_|
```

## Project Overview

Thmanyah Platform is a NestJS modular monolith with two API surfaces: Studio (internal CMS) and Explore (public discovery + search). PostgreSQL (via Prisma) is the source of truth. Program updates enqueue outbox events that a background worker consumes to keep the Meilisearch index in sync.

## Architecture Summary

Studio owns write paths. Explore serves read paths with optional Redis caching. Shared infrastructure lives in `src/shared` (database, cache, search, config, health, observability). For a deeper breakdown, see `docs/architecture.md`.

## Tech Stack

NestJS, Prisma, PostgreSQL, Meilisearch, Redis, Docker / Docker Compose, husky.

## CI

CI runs on pull requests and pushes to `main`. On `main`, a Docker image is published to GHCR as `ghcr.io/a-ghanem1/thmanyah-platform`.

## Local Development (non-docker)

Requirements: Node.js, PostgreSQL, Meilisearch. Redis.

1. `npm install`
2. `npm run prisma:generate`
3. `npm run prisma:migrate`
4. `npm run db:seed`
5. `npm run start:dev`

## Docker Compose (end-to-end)

1. `docker compose up -d --build`
2. `docker exec -it thmanyah-app npm run prisma:generate`
3. `docker exec -it thmanyah-app npm run prisma:migrate`
4. `docker exec -it thmanyah-app npm run db:seed`

Docker Compose uses `.env.docker` by default. The API is available on `http://localhost:3000`.

## Environment Variables

Set these in `.env` (local) or `.env.docker` (compose). They are validated at startup.

Required:

- `DATABASE_URL`
- `MEILI_HOST`
- `JWT_SECRET`
- `PORT`

Optional:

- `MEILI_API_KEY`
- `REDIS_URL`
- `JWT_EXPIRES_IN` (defaults to `1h`)

## Documentation

- `docs/architecture.md`
- `docs/database-schema.md`

## Postman

Collection: `postman/Thmanyah-Platform.postman_collection.json`
