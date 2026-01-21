# Thmanyah Platform

## Project Overview
Thmanyah Platform is a NestJS backend built as a modular monolith. It powers two primary areas:
- Thmanyah Studio: internal CMS for editorial and content operations.
- Thmanyah Explore: public discovery and search experiences.

## Architecture Summary
This codebase follows a modular monolith architecture. For details, see `docs/architecture.md`.

## Tech Stack
- Node.js / NestJS
- Prisma + PostgreSQL
- Meilisearch
- Docker (local development only)

## Local Development
Requirements: Node.js and Docker

1) `docker compose up -d`
2) `npm install`
3) `npm run prisma:generate`
4) `npm run prisma:migrate`
5) `npm run start:dev`

If you run the full stack with `docker compose up --build`, run migrations from your host:
`npm run prisma:migrate`

If you prefer running Prisma inside the app container:
`docker exec -it thmanyah-app npx prisma migrate dev`

## Environment Variables
Core:
- `DATABASE_URL`
- `MEILI_HOST`
- `MEILI_API_KEY`

Studio:
- `STUDIO_API_KEY` (used by `X-Studio-Api-Key` header)

## Documentation
- `docs/architecture.md`
- `docs/database-schema.md`

## Postman
No Postman collection is checked in yet.
