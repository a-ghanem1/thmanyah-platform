# Thmanyah Platform

## Project Overview

Thmanyah Platform is a NestJS modular monolith that serves two modules:

- Thmanyah Studio: internal CMS for managing programs, episodes, and categories.
- Thmanyah Explore: public discovery and search APIs with Redis-backed caching.

PostgreSQL (via Prisma) is the source of truth. Program changes enqueue outbox events that a background worker consumes to sync the Meilisearch index.

## Architecture Summary

The system is a modular monolith with shared database, cache, and search infrastructure. For details, see `docs/architecture.md`.

## Tech Stack

- NestJS
- Prisma
- PostgreSQL
- Meilisearch
- Redis (optional cache)
- Docker / Docker Compose

## Local Development (non-docker)

Requirements: Node.js, PostgreSQL, Meilisearch. Redis is optional.

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

Docker Compose uses `.env.docker` by default. The API will be available on `http://localhost:3000`.

## Environment Variables

Set these in `.env` for local runs or in `.env.docker` for Docker Compose. These are validated at startup:

Required:

- `DATABASE_URL`
- `MEILI_HOST`
- `JWT_SECRET`
- `PORT`

Optional:

- `MEILI_API_KEY`
- `REDIS_URL`
- `JWT_EXPIRES_IN` (defaults to `1h`)

## Authentication

Studio uses JWT authentication with role-based access (admin/editor). Explore endpoints are public.

Login:

- `POST /studio/auth/login`

Bearer token example:

```bash
curl "http://localhost:3000/studio/programs" \
  -H "Authorization: Bearer <token>"
```

The seed user email is `admin@thmanyah.local`. Set `ADMIN_PASSWORD` before running `npm run db:seed` (defaults to `Admin@12345`).

## Key Endpoints

Studio:

- `POST /studio/auth/login`
- `GET /studio/programs`
- `GET /studio/categories`
- `POST /studio/programs/:programId/episodes`
- `GET /studio/episodes/:id`

Explore (public):

- `GET /explore/programs`
- `GET /explore/programs/:id`
- `GET /explore/programs/:id/episodes`
- `GET /explore/categories`
- `GET /explore/search`

Other:

- `GET /health`
- `GET /docs`

## Documentation

- `docs/architecture.md`
- `docs/database-schema.md`

## Postman

Collection: `postman/Thmanyah-Platform.postman_collection.json`
