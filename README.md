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

### Run with Docker Compose
1) `docker compose up -d --build`
2) `npm install`
3) `npm run prisma:generate`
4) `npm run prisma:migrate`
5) `npm run db:seed`

Docker Compose uses `.env.docker` by default. Update it to match your local setup.

If you prefer running Prisma inside the app container:
`docker exec -it thmanyah-app npx prisma migrate dev`

### Run API locally (without Docker)
1) `npm install`
2) `npm run prisma:generate`
3) `npm run prisma:migrate`
4) `npm run db:seed`
5) `npm run start:dev`

## Environment Variables
Core:
- `DATABASE_URL`
- `MEILI_HOST`
- `MEILI_API_KEY`
 - `REDIS_URL`

Studio:
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_PASSWORD` (used by `prisma/seed.ts`)

### Studio Login (after seeding)
Default admin:
- Email: `admin@thmanyah.local`
- Password: value of `ADMIN_PASSWORD` (in `.env.docker` it's `password`, defaults to `Admin@12345` when unset)

Example:
```bash
curl -X POST "http://localhost:3000/studio/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thmanyah.local","password":"password"}'
```

### Explore (public) quick checks
```bash
curl "http://localhost:3000/explore/programs?page=1&limit=10"
curl "http://localhost:3000/explore/search?q=podcast&page=1&limit=10"
```

## Documentation
- `docs/architecture.md`
- `docs/database-schema.md`

## Postman
Collection: `postman/Thmanyah-Platform.postman_collection.json`
