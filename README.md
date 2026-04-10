# Mini Secure User Management System

Production-style assignment project with a secure Express backend and a Next.js admin frontend in a single repository.

## Stack

- Frontend: Next.js 15, TypeScript, Redux Toolkit, Tailwind CSS
- Backend: Express, TypeScript, Sequelize, MySQL
- Realtime: Socket.IO
- Queue + cache + rate limiting: Redis, BullMQ
- Docs: Swagger
- Testing: Vitest, Testing Library, Playwright

## Features

### Mandatory

- JWT authentication with access token and refresh token
- Register, login, refresh, logout, and profile endpoints
- Password hashing
- User CRUD
- Dynamic roles and permissions
- Permission middleware and protected routes
- Real-time notifications for:
  - successful login
  - user created
  - user updated
  - user deleted
- Logging and audit trail
- API rate limiting
- Validation, centralized error handling, and env-based configuration

### Bonus

- MySQL + Sequelize migrations and seeders
- Redis-backed refresh token persistence / blacklist
- Redis-backed cache helpers
- BullMQ queue processing
- Dockerfiles and Docker Compose app services
- Swagger docs
- Unit and route tests for backend
- Backend integration tests with `supertest`
- Frontend unit/integration tests
- Playwright e2e setup
- WebSocket auth with JWT
- Pagination, search, sorting, and filtering
- Audit logs collection/table and admin UI
- CI workflow

## Repository Structure

```text
.
├── backend
├── frontend
├── docker-compose.yml
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop

## Environment Files

Create local env files first:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Main backend env values are already documented in [backend/.env.example](/Applications/MAMP/htdocs/Muhammed-Khalid/test/backend/.env.example).

Main frontend env values are in [frontend/.env.local.example](/Applications/MAMP/htdocs/Muhammed-Khalid/test/frontend/.env.local.example).

## Setup

Install dependencies:

```bash
npm install
```

Start MySQL, Redis, and the optional containerized app services:

```bash
npm run docker:up
```

For local development, `npm run dev` is still the recommended workflow.

Run migrations and seeders:

```bash
npm run db:migrate
npm run db:seed
```

Start frontend and backend:

```bash
npm run dev
```

Run individually if needed:

```bash
npm run dev:backend
npm run dev:frontend
```

## Local URLs

- Frontend: `http://localhost:8001`
- Backend API: `http://localhost:8000/api`
- Swagger: `http://localhost:8000/docs`
- Swagger JSON: `http://localhost:8000/docs.json`
- MySQL: `127.0.0.1:3307` when using Docker Compose
- Redis: `127.0.0.1:6379`

## Seeded Admin

After running seeders, the default admin account is:

- Email: `admin@example.com`
- Password: `Admin123!`

## Root Scripts

- `npm run dev`
- `npm run dev:backend`
- `npm run dev:frontend`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:backend`
- `npm run test:frontend`
- `npm run test:e2e`
- `npm run docker:up`
- `npm run docker:down`
- `npm run db:migrate`
- `npm run db:migrate:undo`
- `npm run db:seed`
- `npm run db:seed:undo`

## Backend Scripts

From root:

```bash
npm run lint --workspace backend
npm run test --workspace backend
npm run build --workspace backend
```

## Frontend Scripts

From root:

```bash
npm run lint --workspace frontend
npm run test --workspace frontend
npm run build --workspace frontend
npm run test:e2e --workspace frontend
```

Playwright note:

```bash
npx playwright install
```

Run that once before `npm run test:e2e --workspace frontend`, otherwise browser binaries will be missing.

## API Surface

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/profile`

### Users

- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Roles

- `POST /api/roles`
- `GET /api/roles`
- `GET /api/roles/:id`
- `PUT /api/roles/:id`
- `DELETE /api/roles/:id`
- `GET /api/roles/permissions/catalog`

### Audit Logs

- `GET /api/audit-logs`

### Dashboard

- `GET /api/dashboard/summary`

### Health / Docs

- `GET /api/health`
- `GET /docs`
- `GET /docs.json`

## Frontend Modules

- Auth pages: login and register
- Protected dashboard shell
- Users management
- Roles management
- Audit logs view
- Profile page with self-update flow
- Realtime notification center with history
- Shared table, filters, pagination, dialogs, skeletons, and toasts

## Testing Status

Verified locally in this repository:

- `npm run lint --workspace backend`
- `npm run test --workspace backend`
- `npm run lint --workspace frontend`
- `npm run test --workspace frontend`
- `npm run build --workspace frontend`

Playwright e2e configuration is added, but browser binaries must be installed locally before execution.

## CI

A GitHub Actions workflow is included in [.github/workflows/ci.yml](/Applications/MAMP/htdocs/Muhammed-Khalid/test/.github/workflows/ci.yml).

It runs:

- install
- backend lint + tests
- frontend lint + tests + build
- Playwright browser install
- frontend e2e tests

## Submission Notes

This repository is structured to demonstrate:

- secure backend design
- modular architecture
- permission-driven UI and API behavior
- realtime event handling
- production-style validation, logging, and testing setup
