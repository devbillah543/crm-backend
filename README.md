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
- `src/modules/auth`
  Enterprise-style authentication, account management, session tracking, and email flows
- `src/modules/health`
  Health endpoint
- `src/jobs`
  Queue processors for mail, notifications, and maintenance jobs

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
- URI versioning
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
    auth/
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

Versioned API example:

```text
http://localhost:4000/api/v1/auth/login
```

Swagger, when enabled:

```text
http://localhost:4000/docs
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

### Auth

- `AUTH_BCRYPT_ROUNDS`
- `AUTH_MAX_FAILED_LOGINS`
- `AUTH_LOCK_MINUTES`
- `AUTH_VERIFICATION_EXPIRES_HOURS`
- `AUTH_RESET_PASSWORD_EXPIRES_MINUTES`
- `AUTH_SECURITY_ALERT_COOLDOWN_MINUTES`
- `AUTH_AVATAR_MAX_SIZE_BYTES`
- `AUTH_SESSION_TOUCH_THROTTLE_SECONDS`

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
- unit test for auth device metadata extraction
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
- enterprise-style auth and session tracking foundation
- production-friendly logging
- reusable infrastructure modules
- queue and scheduler foundation
- storage abstraction for local or S3-backed files
- consistent API response wrapping
- baseline error handling

## Authentication Module

The backend now includes a production-oriented auth/account management module under `src/modules/auth`.

Implemented capabilities:

- email and password login
- short-lived access token plus rotating refresh token
- multi-session and multi-device tracking
- current-session logout
- logout from all sessions
- active sessions listing with pagination
- revoke a specific session
- email verification flow
- forgot password and reset password flow
- profile update including avatar upload
- account lock after repeated failed login attempts
- refresh token reuse detection with session revocation
- queued email delivery for verification, reset, and security alerts

Session/device metadata is derived from the request, not from client-provided body fields. The system records:

- inferred device name
- browser
- operating system
- IP address
- location when proxy/CDN headers are available
- user agent
- last activity timestamp

## Auth API Examples

Base path:

```text
/api/v1/auth
```

### `POST /api/v1/auth/login`

Request:

```json
{
  "email": "jane.doe@sidago.com",
  "password": "StrongPassword!123"
}
```

Response:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### `POST /api/v1/auth/refresh`

Request:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### `GET /api/v1/auth/me`

Response shape:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "id": "0f1fcbf8-c02f-4ddf-9d8c-5379f8316183",
    "email": "jane.doe@sidago.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "fullName": "Jane Doe",
    "emailVerifiedAt": "2026-05-09T10:00:00.000Z",
    "avatarUrl": "/storage/local/avatars/users/123/avatar.webp",
    "roles": ["admin"],
    "permissions": ["users.read"]
  }
}
```

### `GET /api/v1/auth/sessions`

Response shape:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "items": [
      {
        "id": "79ed9f8c-f1e6-4793-9d8b-3e0adbe4cbda",
        "deviceName": "Desktop Device",
        "browser": "Chrome",
        "os": "Windows",
        "ipAddress": "203.0.113.10",
        "location": "Dhaka, BD",
        "userAgent": "Mozilla/5.0 ...",
        "issuedAt": "2026-05-09T10:00:00.000Z",
        "lastActiveAt": "2026-05-09T10:15:00.000Z",
        "expiresAt": "2026-05-16T10:00:00.000Z",
        "isCurrent": true
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 1
    }
  }
}
```

## Email Templates

Auth emails are no longer built inline in service code. They are stored as file-based templates under:

```text
src/modules/auth/templates/
  verification-email.subject.txt
  verification-email.html
  password-reset.subject.txt
  password-reset.html
  security-alert.subject.txt
  security-alert.html
```

These templates are rendered by `AuthMailTemplateService` and queued through the mail job processor.

## Current Gaps

This repo is stable as a boilerplate, but it is not yet a complete enterprise CRM. Important gaps still include:

- RBAC exists as a foundation, but business-role enforcement is still minimal
- no domain modules such as users, leads, reports, notifications, or organizations
- no real websocket gateway usage yet
- queue usage is still light outside auth/mail and sample jobs
- no concrete seeders for real business data
- limited automated integration coverage across the new auth flows

## Recommended Next Steps

- implement the actual CRM business modules
- add DTO validation and contract tests for each API module
- add integration tests against a disposable PostgreSQL and Redis stack
- add CI to run build, lint, unit, and e2e checks automatically
- expand auth e2e coverage with seeded test accounts
- add real websocket gateways and richer business queue jobs
- expand authorization and permission enforcement across future domain modules

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
- The auth/account module is now implemented and build-verified.
- Business-domain completeness beyond auth is still pending.
