# Backend Learning & Run Notes

Short guide for running the backend locally, key ports, `.env` synchronization, and common debugging tips.

## 1. Architecture Overview

```
Frontend (5173)
     ↓
API Gateway (3000) - routes requests to services
     ↓
├── User Service (5000) - authentication, user management
├── Exam Service (3001) - exam management
├── Question Service (3002) - question bank
├── AI Generation Service (3003) - request creation & RabbitMQ publisher
│        ↓
│   RabbitMQ Queue (5672)
│        ↓
├── AI Worker Service (8000) - consumer, processes AI tasks, calls Gemini API
├── Notification Service (3004) - notifications
└── Infrastructure Service (5005) - metrics, health checks
```

### AI Flow (How it works)
1. User requests question generation via frontend
2. API Gateway routes to AI Generation Service (3003)
3. AI Generation Service creates DB records (request + task) and publishes message to RabbitMQ
4. AI Worker Service (8000) consumes message from RabbitMQ
5. AI Worker processes task (Gemini API), saves questions to database
6. Frontend polls for status using request_id

## 2. Prerequisites

- From the `backend` directory, create or update `.env` for each service as needed:
  - copy from `.env.example` and set:
    - `DB_HOST=postgres-db` for Docker Compose, or `DB_HOST=localhost` for local-only
    - `RABBITMQ_HOST=rabbitmq` for Docker Compose, or `RABBITMQ_HOST=localhost` for local-only
    - `DB_NAME=Exam_Bank`
- Important: Docker containers do not auto-reload `.env` after creation. If you change `.env` while containers are running, services may still use old environment variables.
- Note for `backend/AI_Worker_Service`: this service requires `.env.docker` for Docker Compose. If missing, the `ai-worker-api` container on port `8000` will fail to start because env vars are not loaded.

## 3. Root Cause of Google Login Failures

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

## 4. Build vs Up

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

## 5. Start Infrastructure Services First for Debugging

```bash
docker compose up -d postgres-db rabbitmq prometheus grafana
docker compose up --build user-service api-gateway exam-service question-service ai-generation-service notification-service infrastructure-service ai-worker-api ai-worker-service frontend
```

## 6. Important Ports (host:container)

| Service | Port | Description |
|---------|------|-------------|
| Postgres | 5432 | Database |
| RabbitMQ | 5672 | AMQP client |
| RabbitMQ | 15672 | Management UI |
| User Service | 5000 | Auth & users |
| API Gateway | 3100 | Main entry (3100→3000) |
| Exam Service | 3001 | Exams |
| Question Service | 3002 | Question bank |
| AI Generation Service | 3003 | Request creation, RabbitMQ publisher |
| AI Worker API | 8000 | Consumer, AI processing, docs at /api/v1/docs |
| Notification Service | 3004 | Notifications |
| Infrastructure Service | 5005 | Metrics |
| Prometheus | 9090 | Monitoring |
| Grafana | 3006 | Dashboards |
| Frontend | 5173 | React app |

## 7. Running AI Services Locally

### AI Generation Service
```bash
cd backend/AI_Generation_Service
npm run dev
```

### AI Worker Service
```bash
cd backend/AI_Worker_Service
py run_worker.py
# Or with FastAPI server for API access:
uvicorn app.main:app --reload --port 8000
```

### Check AI Worker API Docs
- Swagger UI: http://localhost:8000/api/v1/docs
- Health: http://localhost:8000/api/v1/health

## 8. Database Init and Seeding

- Init scripts `../database/schema_optimized.sql` and `../database/seed_data.sql` are mounted into `/docker-entrypoint-initdb.d/`.
- They run only when the Postgres data volume is new (first-time DB creation).
- If you need to re-run init or seeding, remove the `postgres-data` volume and start Compose again.
- To manually apply schema and seed on local without recreating the container:

```bash
psql -U postgres -d Exam_Bank -f "c:\Users\Admin\Project_Exmora\database\schema_optimized.sql"
psql -U postgres -d Exam_Bank -f "c:\Users\Admin\Project_Exmora\database\seed_data.sql"
```

## 9. Observability

- Prometheus config: `backend/infra/prometheus/prometheus.yml` (scrapes `/metrics`).
- Verify each service exposes metrics, for example: `http://localhost:5005/metrics`.
- AI Worker API health/docs: `http://localhost:8000/api/v1/health` and `http://localhost:8000/api/v1/docs`.
- Grafana UI: `http://localhost:3006`.

## 10. Quick Debug

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

## 11. Recommended Configuration Additions

- Add `healthcheck` and `restart: unless-stopped` for critical services if you want automatic restart on failure.

## 12. Environment Convention

- Run locally outside Docker: `DB_HOST=localhost`, `RABBITMQ_HOST=localhost`.
- Run with Docker Compose: `DB_HOST=postgres-db`, `RABBITMQ_HOST=rabbitmq`.
- Prefer splitting env files by environment, for example `.env.local` and `.env.docker`, instead of editing one file back and forth.
