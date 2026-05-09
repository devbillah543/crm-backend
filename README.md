# Sidago CRM Backend

Production-oriented NestJS backend foundation with PostgreSQL, Redis, BullMQ, JWT auth, Swagger, structured logging, storage abstraction, scheduler support, and a tested authentication/account module.

This repository is production-ready for its current implemented scope: platform infrastructure plus auth/account/session management. It is not yet a complete CRM product, because most business-domain modules still need to be built on top of this foundation.

## What This Project Includes

- NestJS 11 with modular architecture
- PostgreSQL with TypeORM migrations
- Redis-backed cache, queue, and session support
- BullMQ for background jobs
- JWT access and rotating refresh token auth
- Multi-device session tracking
- Email verification, forgot password, reset password
- Local and S3-ready storage abstraction
- Structured logging with file output
- Swagger/OpenAPI docs
- Liveness and readiness health endpoints
- CI workflow for lint, build, unit tests, and e2e tests

## Current Feature Scope

Implemented and verified today:

- authentication and account management
- role and permission synchronization
- database migrations and seed flow
- health, liveness, and readiness checks
- queue-backed mail sending
- local test/log mail transport
- Docker and Compose setup

Not fully implemented yet:

- leads, reports, organizations, notifications, dashboards, and broader CRM business workflows
- richer RBAC enforcement across business modules
- real-time gateways with domain events

## Project Structure

```text
src/
  app.module.ts
  main.ts
  common/
  config/
  core/
  database/
  jobs/
  modules/
  scripts/
test/
```

### `src/common`

Shared cross-cutting building blocks:

- decorators like `@Public()` and `@CurrentUser()`
- global exception filter
- global response and request-context interceptors
- shared types and utility helpers

Use this folder for framework-level utilities that should be reusable across many modules.

### `src/config`

Centralized configuration loaders and startup validation.

Important files:

- `app.config.ts`
- `auth.config.ts`
- `database.config.ts`
- `redis.config.ts`
- `mailer.config.ts`
- `production-safety.ts`
- `env.validation.ts`

This is where runtime settings are parsed, normalized, and protected. If you add a new env variable, add it here and also add validation in `env.validation.ts`.

### `src/core`

Infrastructure modules that support the whole app.

#### `src/core/cache`

Redis-backed cache helper for simple `remember(...)` patterns.

#### `src/core/database`

TypeORM setup, health check, datasource bootstrap, and auto-create helper.

#### `src/core/logger`

Application logger built on Pino with file output under `storage/logs`.

#### `src/core/mailer`

Mailer abstraction.

Supported modes:

- SMTP via `MAIL_HOST=<real host>`
- log transport via `MAIL_HOST=log`

When `MAIL_HOST=log`, outgoing emails are written to `storage/logs/mail.log`.

#### `src/core/queue`

BullMQ configuration and queue service.

Use this for background work like:

- email sending
- notifications
- analytics aggregation

#### `src/core/redis`

Shared Redis client for cache, throttling helpers, and other infra features.

#### `src/core/request-context`

Async request context storage for request-scoped metadata.

#### `src/core/scheduler`

Scheduler support and cron infrastructure.

#### `src/core/storage`

Storage abstraction with local and S3-ready drivers.

Current use case:

- avatar upload handling

#### `src/core/websocket`

Shared websocket service scaffold for user/role-targeted event emission.

### `src/database`

Database layer.

#### `src/database/entities`

TypeORM entity definitions for platform and auth data.

Examples:

- `user.entity.ts`
- `user-session.entity.ts`
- `role.entity.ts`
- `permission.entity.ts`
- `auth-action-token.entity.ts`

#### `src/database/migrations`

Schema migrations. Each migration is kept as an explicit file and applied through the CLI commands.

#### `src/database/seeders`

Database seeding logic.

Current seeders include:

- permission seeder
- super admin user seeder
- admin user seeder
- manager user seeder
- agent user seeder
- database seeder runner

### `src/jobs`

Background job processors.

Current processors include:

- mail processor
- notification processor

Add queue-driven workloads here instead of putting long-running tasks directly in controllers or services.

### `src/modules`

Feature modules.

#### `src/modules/auth`

The main business-ready module in this repo today.

Contains:

- controller
- DTOs
- guards
- repositories
- strategies
- cron cleanup
- services
- email templates

Implemented capabilities:

- login with email and password
- short-lived access token
- rotating refresh token
- multi-device sessions
- current-session logout
- logout all sessions
- revoke specific session
- list active sessions
- email verification
- resend verification email
- forgot password
- reset password
- profile update
- avatar upload
- audit logging for auth-related events

#### `src/modules/health`

Health endpoints used by runtime checks and deployment platforms.

Routes:

- `GET /api/health/live`
- `GET /api/health/ready`
- `GET /api/health`

### `src/scripts`

Standalone CLI entry files for operational tasks.

Current scripts:

- migration run
- migration revert
- sync permissions

### `test`

Automated tests.

Includes:

- unit tests
- auth e2e tests
- health e2e tests
- test env bootstrap

Both unit and e2e tests load `.env.test` automatically.

## Runtime Architecture

At a high level:

1. `main.ts` boots the Nest app
2. config is loaded and validated
3. production safety rules are checked
4. global middleware, pipes, filters, interceptors, versioning, and Swagger are registered
5. modules from `AppModule` wire infrastructure and feature modules together

This gives you a clear split:

- `core` handles infrastructure
- `modules` handle product features
- `database` handles persistence
- `scripts` handle operational CLI tasks

## Authentication Flow

The auth module is the strongest implemented feature in the repo.

### Login

`POST /api/v1/auth/login`

Request:

```json
{
  "email": "superadmin@example.com",
  "password": "SuperAdmin123!"
}
```

Response:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### Refresh Token

`POST /api/v1/auth/refresh`

Request:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Response:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-jwt-refresh-token"
  }
}
```

### Current User

`GET /api/v1/auth/me`

Returns the current account profile, roles, and permissions.

### Session Management

Routes:

- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `GET /api/v1/auth/sessions`
- `DELETE /api/v1/auth/sessions/:sessionId`

The system tracks:

- device name
- browser
- OS
- IP address
- location when headers are available
- user agent
- last activity

### Email and Password Flows

Routes:

- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/resend-verification-email`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

### Profile Update

`PATCH /api/v1/auth/profile`

Supports:

- first name
- last name
- full name
- email
- password change
- avatar upload

## Health Endpoints

### `GET /api/health/live`

Checks if the process is alive.

### `GET /api/health/ready`

Checks if the app is ready to serve traffic by verifying:

- PostgreSQL
- Redis

### `GET /api/health`

Backward-compatible readiness endpoint.

## Environment Files

### `.env`

Use for local development or runtime deployment values.

### `.env.test`

Used automatically by Jest and e2e tests.

Default test database:

- `sidago_test`

Default test mail transport:

- `MAIL_HOST=log`

### `.env.example`

Template and reference for required settings.

## CLI and Commands

These are the main operational commands in this project.

### App Commands

```bash
npm run start:dev
npm run start
npm run start:prod
npm run build
npm run lint
npm run format
```

### Test Commands

```bash
npm test
npm test -- --runInBand
npm run test:e2e
npm run test:e2e -- --runInBand
```

### Migration Commands

Generate a migration from entity changes:

```bash
npm run migration:generate
```

Run pending migrations:

```bash
npm run migration:run
```

Revert the last migration:

```bash
npm run migration:revert
```

Raw TypeORM CLI access:

```bash
npm run typeorm -- migration:show
```

### Permission Sync Command

Sync roles and permissions from `src/config/permission.config.ts`:

```bash
npm run sync:permission
```

Use this when:

- permission definitions change
- role mappings change
- a fresh environment needs RBAC data

### Seeder Commands

Run all configured seeders in sequence:

```bash
npm run db:seed
```

Run one specific seeder:

```bash
npm run db:seed -- --fileName=super-admin-user
```

Available seeder names today:

- `permission`
- `super-admin-user`
- `admin-user`
- `manager-user`
- `agent-user`

### Typical First-Time Setup

```bash
npm install
cp .env.example .env
npm run migration:run
npm run sync:permission
npm run db:seed
npm run start:dev
```

## Docker

Files:

- [Dockerfile](./Dockerfile)
- [docker-compose.yml](./docker-compose.yml)
- [.dockerignore](./.dockerignore)

### Start Local Services

```bash
docker compose up -d postgres redis
```

### Start Full Stack

```bash
docker compose up --build
```

The Docker setup includes:

- non-root runtime container
- multi-stage build
- API healthcheck
- PostgreSQL healthcheck
- Redis healthcheck

## CI

GitHub Actions workflow:

- [ci.yml](./.github/workflows/ci.yml)

It currently runs:

- lint
- build
- unit tests
- e2e tests

## How To Extend This Project

### Add a New Feature Module

Recommended structure:

```text
src/modules/your-feature/
  your-feature.module.ts
  your-feature.controller.ts
  dto/
  services/
  repositories/
  guards/
```

Then:

1. create entities in `src/database/entities`
2. generate a migration
3. import the module in `AppModule`
4. add DTO validation and Swagger docs
5. add unit and e2e tests

### Add New Permissions

Edit:

- [src/config/permission.config.ts](./src/config/permission.config.ts)

Then run:

```bash
npm run sync:permission
```

### Add New Seeders

1. create a seeder under `src/database/seeders`
2. make it return the shared seeder result shape
3. register it in `src/database/seeders/db.seeder.ts`

Then run:

```bash
npm run db:seed
```

### Add New Queue Jobs

1. enqueue from services using `QueueService`
2. implement processors in `src/jobs/processors`
3. keep heavy work out of request handlers

### Add New Storage Use Cases

Use `StorageService` instead of directly writing files.

That lets you switch between:

- local storage
- S3-compatible storage

without rewriting feature code.

## Testing Strategy

Current automated coverage includes:

- health service unit tests
- local storage unit tests
- auth device metadata unit tests
- pagination utility unit tests
- auth end-to-end flows
- health end-to-end flows

This repo uses `.env.test` automatically for tests so the suite stays isolated from development settings.

## Production Notes

The implemented foundation is production-ready, but only for the scope that exists in this repository today.

Before real deployment, you still need:

- real production secrets
- real production database and Redis
- real SMTP or third-party mail provider
- real storage configuration
- deployment platform env management

Production startup safety already blocks several dangerous states, including:

- placeholder JWT secrets
- identical access and refresh secrets
- empty production CORS configuration
- `MAIL_HOST=log` in production

## Verification Status

Latest verified checks:

```bash
npm run lint
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Current verified results:

- unit tests: passed
- e2e tests: passed
- build: passed
- lint: passed

## License

This project is currently marked `UNLICENSED`.
