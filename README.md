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
- Docker (local development only)

## Local Development
Requirements: Node.js and Docker

1) `docker compose up -d`
2) `npm install`
3) `npm run prisma:migrate`
4) `npm run start:dev`

## Documentation
- `docs/architecture.md`
- `docs/database-schema.md`
