# Sidago CRM Backend Boilerplate

NestJS 11 boilerplate for a production-oriented backend with PostgreSQL, Redis, BullMQ, Swagger, structured logging, request context, rate limiting, storage abstraction, and health monitoring.

This repository is currently a backend foundation, not a complete CRM implementation yet. The core platform modules are in place and verified, while most business-domain modules still need to be built on top of this scaffold.

## Current Status

- Build passes
- Lint passes
- Unit tests pass
- E2E tests pass
- Compiled app boots successfully
- Health endpoint confirms app, PostgreSQL, and Redis connectivity

Verified on May 9, 2026 with:

```bash
npm run build
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Live runtime check:

```bash
GET http://127.0.0.1:4000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "app": "ok",
    "database": "ok",
    "redis": "ok"
  }
}
```

## Tech Stack

- NestJS 11
- TypeScript 5
- PostgreSQL with TypeORM
- Redis with `ioredis`
- BullMQ for queues
- Socket.IO with Redis adapter support
- Joi config validation
- Pino logging
- Jest and Supertest
- Swagger / OpenAPI

## Implemented Platform Modules

- `src/common`
  Shared decorators, DTOs, interceptors, filters, and utility types
- `src/config`
  Centralized config loaders and environment validation
- `src/core/database`
  TypeORM bootstrap, health check, and database auto-create helper
- `src/core/redis`
  Shared Redis client
- `src/core/cache`
  Simple cache helper built on Redis
- `src/core/logger`
  Pino-based application logger with file output
- `src/core/queue`
  BullMQ root config and queue service
- `src/core/scheduler`
  Redis-backed cron locking support
- `src/core/storage`
  Local and S3 storage abstraction
- `src/core/mailer`
  Nodemailer wrapper
- `src/core/request-context`
  Async local request context storage
- `src/core/websocket`
  Socket service and Redis adapter scaffold
- `src/modules/health`
  Health endpoint
- `src/jobs`
  Sample queue processor and maintenance cron job

## Global Runtime Behavior

The application currently enables:

- Helmet
- Compression
- Cookie parsing
- Global validation pipe with transformation and whitelist enforcement
- Global exception filter
- Global request-context interceptor
- Global response-transform interceptor
- Global throttling guard
- Swagger setup

## Project Structure

```text
src/
  common/
  config/
  core/
    cache/
    database/
    logger/
    mailer/
    queue/
    redis/
    request-context/
    scheduler/
    storage/
    websocket/
  database/
    entities/
    migrations/
    seeders/
    subscribers/
  jobs/
    cron/
    processors/
  modules/
    health/
  scripts/
test/
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

### 3. Start PostgreSQL and Redis

If you want local containers:

```bash
docker compose up -d postgres redis
```

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Start the app

```bash
npm run start:dev
```

Default base URL:

```text
http://localhost:4000/api
```

Swagger, when enabled:

```text
http://localhost:4000
```

## Available Scripts

- `npm run build`
  Build the production bundle
- `npm run start`
  Run the compiled server
- `npm run start:dev`
  Run in watch mode
- `npm run start:prod`
  Run compiled production build
- `npm run lint`
  Run ESLint with auto-fix
- `npm run format`
  Run Prettier
- `npm test`
  Run unit tests
- `npm run test:e2e`
  Run e2e tests
- `npm run migration:generate`
  Generate a TypeORM migration
- `npm run migration:run`
  Run pending migrations
- `npm run migration:revert`
  Revert the latest migration
- `npm run seed:run`
  Run seeders

## Environment Variables

### App

- `NODE_ENV`
- `PORT`
- `APP_NAME`
- `APP_VERSION`
- `GLOBAL_PREFIX`
- `ALLOWED_ORIGINS`
- `COOKIE_DOMAIN`
- `SWAGGER_ENABLED`
- `SWAGGER_PATH`
- `FRONTEND_URL`

### Database

- `DATABASE_URL`
- `DATABASE_ADMIN_URL`
- `DATABASE_SSL`
- `DATABASE_LOGGING`
- `DATABASE_POOL_MIN`
- `DATABASE_POOL_MAX`

### Redis

- `REDIS_URL`
- `REDIS_KEY_PREFIX`

### JWT

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

### Mail

- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_SECURE`
- `MAIL_USER`
- `MAIL_PASS`
- `MAIL_FROM`

### Throttling

- `THROTTLE_TTL`
- `THROTTLE_LIMIT`
- `THROTTLE_AUTH_LIMIT`

### Queues

- `QUEUE_PREFIX`
- `QUEUE_DEFAULT_ATTEMPTS`
- `QUEUE_DEFAULT_BACKOFF`
- `QUEUE_CONCURRENCY`

### Storage

- `STORAGE_DRIVER`
- `STORAGE_LOCAL_ROOT`
- `STORAGE_LOCAL_BASE_URL`
- `STORAGE_S3_BUCKET`
- `STORAGE_S3_REGION`
- `STORAGE_S3_ENDPOINT`
- `STORAGE_S3_PUBLIC_BASE_URL`
- `STORAGE_S3_FORCE_PATH_STYLE`
- `STORAGE_S3_PREFIX`
- `STORAGE_S3_ACCESS_KEY_ID`
- `STORAGE_S3_SECRET_ACCESS_KEY`

### WebSocket / Logging

- `WS_CORS_ORIGIN`
- `LOG_FILE_MODE`

Use [.env.example](./.env.example) as the source of truth for defaults.

## Docker

The repository includes:

- [Dockerfile](./Dockerfile)
- [docker-compose.yml](./docker-compose.yml)

Bring up the full stack:

```bash
docker compose up --build
```

## Testing

Current automated coverage includes:

- utility test for pagination normalization
- unit test for health service behavior
- unit test for local storage safety and file handling
- e2e test for the `/health` endpoint contract

Run everything:

```bash
npm run build
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

## What This Boilerplate Solves Well

- centralized config validation
- app bootstrap hardening
- production-friendly logging
- reusable infrastructure modules
- queue and scheduler foundation
- storage abstraction for local or S3-backed files
- consistent API response wrapping
- baseline error handling

## Current Gaps

This repo is stable as a boilerplate, but it is not yet a complete enterprise CRM. Important gaps still include:

- no real auth module implementation
- no RBAC guards wired to business routes
- no domain modules such as users, leads, reports, notifications, or organizations
- no real websocket gateway usage yet
- no queue consumers beyond sample processor scaffolding
- no concrete migrations or seeders beyond the scaffold
- limited automated test coverage outside the platform baseline

## Recommended Next Steps

- implement the actual CRM business modules
- add DTO validation and contract tests for each API module
- add integration tests against a disposable PostgreSQL and Redis stack
- add CI to run build, lint, unit, and e2e checks automatically
- add real queue jobs, websocket gateways, and mail templates
- add auth, authorization, audit logging, and permission enforcement

## Boilerplate Verification Report

Latest verification result:

- `build`: passed
- `lint`: passed
- `unit tests`: passed
- `e2e tests`: passed
- `runtime health probe`: passed

Notes:

- App boot confirmed against the local `.env` values.
- Health endpoint returned successful database and Redis connectivity.
- The scaffolded infrastructure is wired and operational.
- Business-domain completeness is still pending.
