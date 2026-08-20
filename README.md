# Transcendence

A full-stack Pong platform: real-time multiplayer Pong, chat, and user profiles with 42 / GitHub OAuth login.

## Stack

- **Frontend**: React (react-scripts), Zustand, Tailwind + daisyUI, Socket.IO client
- **Backend**: NestJS (Bun runtime), Prisma + PostgreSQL, Socket.IO, Passport (42 & GitHub OAuth)
- **Infra**: Docker Compose, Nginx

## Prerequisites

- Docker + Docker Compose

## Setup

1. Copy the env template and fill in real values:

   ```bash
   cp .env.example .env
   ```

   At minimum, set `AT_SECRET`/`RT_SECRET` (e.g. `openssl rand -hex 32` each). OAuth login (42, GitHub) and avatar uploads (Cloudinary) need their own credentials to work.

2. Start the dev stack:

   ```bash
   docker compose -f docker-compose-dev.yaml up --build
   ```

   This starts:
   - **frontend** — `http://localhost:3000` (hot reload)
   - **backend** — `http://localhost:3001` (hot reload), plus Prisma Studio on `http://localhost:5555`
   - **database** — PostgreSQL

3. Open `http://localhost:3000`.

## Production

```bash
docker compose -f docker-compose.yml up --build -d
```

Requires a production `.env` with real domains/secrets (see `.env.example` for the full list of variables).
