# Project_EXMORA

EXMORA is a microservice-based exam management system with separate backend services and a React frontend. This README gives you the big picture and links to the detailed docs for each part of the system.

## Documentation

- `README.md` — project overview and quick start
- `backend/Backend.md` — backend setup, run commands, ports, and debugging tips
- `frontend/Fronend.md` — frontend setup, env vars, Docker, and API clients
- `database/Data.md` — database schema, seed data, and reset procedures

## Tech Stack

- Frontend: React 19, TypeScript, Vite 8, React Router v7, Tailwind CSS
- Backend: Node.js microservices with axios-based API clients
- Database: PostgreSQL with service-scoped schemas
- Messaging: RabbitMQ with outbox/dead-letter queue support
- Observability: Prometheus, Grafana
- AI pipeline: document upload, async job processing, question generation

## Prerequisites

- Node.js and npm
- PostgreSQL
- RabbitMQ
- Docker and Docker Compose

## Quick Start

1. Clone the repository and open it in your editor.
2. Start infrastructure services: Postgres, RabbitMQ, Prometheus, Grafana.
3. Apply database schema and seed data.
4. Start backend services.
5. Start the frontend.

For exact commands, port mappings, and environment variables, see:
- `database/Data.md`
- `backend/Backend.md`
- `frontend/Fronend.md`

## Project Structure

- `backend/` — Node.js microservices
- `frontend/` — React frontend app
- `database/` — SQL schema and seed data
- `infra/` — monitoring and observability configs

## Environment Variables

Each service uses its own `.env` file. Common variables include database connection strings, RabbitMQ URLs, and JWT secrets. Docker Compose uses `.env.docker` for some services; check `backend/Backend.md` and `frontend/Fronend.md` for details.

## Useful Scripts

- Install frontend dependencies: `cd frontend && npm install`
- Run frontend dev server: `npm run dev`
- Build backend services and frontend before deploying
- Manually apply database schema or seed data with `psql`

## Troubleshooting

- If Docker containers do not pick up `.env` changes, recreate them.
- If the frontend cannot reach backend APIs in Docker, update API base URLs.
- For login issues, verify OAuth callback URLs and auth service URLs.

## Contribution

- Fork, branch, and submit pull requests.
- Update docs in `README.md`, `backend/Backend.md`, `frontend/Fronend.md`, and `database/Data.md` when adding services or changing ports/env vars.
