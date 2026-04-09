# Mini Secure User Management System

Initial repository setup for the assignment. This level includes only project structure, local environment configuration, and service bootstrapping for the frontend and backend.

## Proposed Stack

- Frontend: Next.js + TypeScript
- Backend: Express + TypeScript
- Database: PostgreSQL
- Realtime / caching path: Redis + WebSocket support in backend
- Repository layout: single repo with separate `frontend` and `backend` projects
- Local infra: Docker Compose

## Structure

```text
.
├── backend
├── frontend
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Start PostgreSQL and Redis:

```bash
pnpm docker:up
```

3. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

4. Start the frontend and backend:

```bash
pnpm dev
```

## App Ports

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Current Scope

This setup currently includes:

- Single-repo frontend/backend separation
- Frontend and backend app skeletons
- Example environment files
- Docker services for PostgreSQL and Redis
- Base TypeScript configuration and starter entrypoints

The assignment features will be implemented in later levels:

- JWT auth + refresh tokens
- Role-based user CRUD
- WebSocket notifications
- Logging
- Rate limiting
- Bonus items like Swagger, tests, blacklist, audit logs, CI, and frontend integration
