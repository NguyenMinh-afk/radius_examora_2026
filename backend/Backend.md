# Backend Learning & Run Notes

Short guide for running the backend locally, key ports, `.env` synchronization, and common debugging tips.

## 1. Prerequisites

- From the `backend` directory, create or update `.env` for each service as needed:
  - copy from `.env.example` and set:
    - `DB_HOST=postgres-db` for Docker Compose, or `DB_HOST=localhost` for local-only
    - `RABBITMQ_HOST=rabbitmq` for Docker Compose, or `RABBITMQ_HOST=localhost` for local-only
    - `DB_NAME=Exam_Bank`
- Important: Docker containers do not auto-reload `.env` after creation. If you change `.env` while containers are running, services may still use old environment variables.
- Note for `backend/AI_Worker_Service`: this service requires `.env.docker` for Docker Compose. If missing, the `ai-worker-api` container on port `8000` will fail to start because env vars are not loaded.

## 2. Root Cause of Google Login Failures

- When running `npm run dev` locally, the service reads `.env` directly, so it may work.
- When running with Docker Compose, environment variables are loaded at container creation time. If you change `.env` afterward, the container does not update automatically.
- This can cause a mismatch such as:

```bash
Local .env
DB_HOST=localhost
RABBITMQ_HOST=localhost

Docker container
DB_HOST=postgres-db
RABBITMQ_HOST=rabbitmq
```

- If the backend Google callback cannot reach the DB or OAuth user store, the frontend may show only `Google login failed`.

## 3. Build vs Up

- Build images only, without starting containers:

```bash
docker compose build
```

- Create containers without starting them:

```bash
docker compose up --no-start
```

- Start and attach logs:

```bash
docker compose up --build
# or start in the background
docker compose up -d
```

## 4. Start Infrastructure Services First for Debugging

```bash
docker compose up -d postgres-db rabbitmq prometheus grafana
docker compose up --build user-service api-gateway exam-service question-service ai-generation-service notification-service infrastructure-service ai-worker-api ai-worker-service frontend
```

## 5. Important Ports (host:container)

- Postgres: `5432:5432`
- RabbitMQ: `5672:5672` (client), `15672:15672` (management)
- User Service: `5000:5000`
- API Gateway: `3100:3000` (host `3100` → container `3000`)
- Exam Service: `3001:3001`
- Question Service: `3002:3002`
- AI Generation Service: `3003:3003`
- AI Worker API: `8000:8000`
- AI Worker Service: internal worker, no exposed host port
- Notification Service: `3004:3004`
- Infrastructure Service: `5005:5005`
- Prometheus: `9090:9090`
- Grafana: `3006:3000`
- Frontend: `5173:5173`

## 6. Database Init and Seeding

- Init scripts `../database/schema_optimized.sql` and `../database/seed_data.sql` are mounted into `/docker-entrypoint-initdb.d/`.
- They run only when the Postgres data volume is new (first-time DB creation).
- If you need to re-run init or seeding, remove the `postgres-data` volume and start Compose again.
- To manually apply schema and seed on local without recreating the container:

```bash
psql -U postgres -d Exam_Bank -f "c:\Users\Admin\Project_Exmora\database\schema_optimized.sql"
psql -U postgres -d Exam_Bank -f "c:\Users\Admin\Project_Exmora\database\seed_data.sql"
```

## 7. Observability

- Prometheus config: `backend/infra/prometheus/prometheus.yml` (scrapes `/metrics`).
- Verify each service exposes metrics, for example: `http://localhost:5005/metrics`.
- AI Worker API health/docs: `http://localhost:8000/api/v1/health` and `http://localhost:8000/api/docs`.
- Grafana UI: `http://localhost:3006`.

## 8. Quick Debug

- View live logs: `docker compose logs -f <service>`
- List containers and ports: `docker compose ps` or `docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`
- Inspect actual environment variables inside a container:

```bash
docker exec -it exmora-ai-worker-api sh
env | grep DATABASE_URL
env | grep RABBITMQ_URL
```

- If you just changed `.env`, sync containers by recreating them:

```bash
docker compose down
docker compose up -d --force-recreate
```

- Stop/clean: `docker compose down` removes networks and containers; `docker compose rm` removes stopped containers.

## 9. Recommended Configuration Additions

- Add `healthcheck` and `restart: unless-stopped` for critical services if you want automatic restart on failure.

## 10. Environment Convention

- Run locally outside Docker: `DB_HOST=localhost`, `RABBITMQ_HOST=localhost`.
- Run with Docker Compose: `DB_HOST=postgres-db`, `RABBITMQ_HOST=rabbitmq`.
- Prefer splitting env files by environment, for example `.env.local` and `.env.docker`, instead of editing one file back and forth.
