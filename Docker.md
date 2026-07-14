# Docker Documentation

This document explains how to run the EXMORA project with Docker Compose, what each service does, how to manage containers, view logs, rebuild images, and reset data.

## 1. Prerequisites

- Docker Desktop or Docker Engine installed
- Docker Compose plugin installed
- Enough RAM/CPU for multiple services
- Project code cloned locally

## 2. Project Compose Files

- `docker-compose.yml` — main compose file for the full system
- `backend/AI_Worker_Service/docker-compose.yml` — standalone compose file for the AI worker only

The AI worker service in the root compose reuses:
- `backend/AI_Worker_Service/Dockerfile`
- `backend/AI_Worker_Service/.env.docker`

## 3. Services Overview

| Service | Container Name | Image / Build | Ports | Description |
| --- | --- | --- | --- | --- |
| Postgres | exmora-postgres | postgres:15 | 5432:5432 | Main database |
| RabbitMQ | exmora-rabbitmq | rabbitmq:3-management | 5672, 15672 | Message broker and UI |
| User Service | exmora-user-service | node:20-alpine | 5000:5000 | Auth and user management |
| Exam Service | exmora-exam-service | node:20-alpine | 3001:3001 | Exam, class, assignment APIs |
| Question Service | exmora-question-service | node:20-alpine | 3002:3002 | Question bank APIs |
| AI Generation Service | exmora-ai-generation-service | node:20-alpine | 3003:3003 | AI orchestration APIs |
| AI Worker API | exmora-ai-worker-api | Build from Dockerfile | 8000:8000 | AI worker REST API |
| AI Worker Service | exmora-ai-worker-service | Build from Dockerfile | none | Background AI worker |
| Notification Service | exmora-notification-service | node:20-alpine | 3004:3004 | Notifications |
| Infrastructure Service | exmora-infrastructure-service | node:20-alpine | 5005:5005 | Infra/monitoring APIs |
| API Gateway | exmora-api-gateway | node:20-alpine | 3100:3000 | Main gateway |
| Frontend | exmora-frontend | node:20-alpine | 5173:5173 | React frontend |
| Prometheus | exmora-prometheus | prom/prometheus:latest | 9090:9090 | Metrics scraper |
| Grafana | exmora-grafana | grafana/grafana:latest | 3006:3000 | Dashboards |

## 4. Important Environment Files

Each service has its own `.env.docker` file. These are loaded into containers via `env_file`.

- `backend/User_Service/.env.docker`
- `backend/Exam_Service/.env.docker`
- `backend/Question_Service/.env.docker`
- `backend/AI_Generation_Service/.env.docker`
- `backend/AI_Worker_Service/.env.docker`
- `backend/Notification_Service/.env.docker`
- `backend/Infrastructure_Service/.env.docker`
- `backend/API_Gateway_Service/.env.docker`

The frontend uses environment variables directly in compose:

```yaml
environment:
  VITE_API_BASE_URL: http://localhost:3100
```

## 5. Database Initialization

The root compose mounts two SQL files into Postgres:

```yaml
volumes:
  - ./database/schema_optimized.sql:/docker-entrypoint-initdb.d/01-schema.sql
  - ./database/seed_data.sql:/docker-entrypoint-initdb.d/02-seed.sql
  - postgres-data:/var/lib/postgresql/data
```

These files run only when the `postgres-data` volume is created for the first time. If you already have data, they will not rerun automatically.

## 6. Start the Full System

From the project root:

```bash
docker compose up -d
```

Or rebuild first if you changed code or dependencies:

```bash
docker compose up -d --build
```

To start only infrastructure first:

```bash
docker compose up -d postgres-db rabbitmq prometheus grafana
docker compose up --build user-service api-gateway exam-service question-service ai-generation-service notification-service infrastructure-service ai-worker-api ai-worker-service frontend
```

To attach logs to the terminal instead of backgrounding:

```bash
docker compose up
```

## 7. Rebuild and Refresh

Rebuild a single service after code changes:

```bash
docker compose up -d --build frontend
docker compose up -d --build ai-worker-api
```

If you changed `.env.docker`, recreate containers so new env vars are applied:

```bash
docker compose down
docker compose up -d --force-recreate
```

## 8. View Logs

View logs for all services:

```bash
docker compose logs -f
```

View logs for one service:

```bash
docker compose logs -f frontend
docker compose logs -f api-gateway
docker compose logs -f ai-worker-api
```

View logs for a specific container:

```bash
docker logs -f exmora-frontend
```

## 9. Inspect Containers

List running containers and ports:

```bash
docker compose ps
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Check environment variables inside a container:

```bash
docker exec -it exmora-ai-worker-api sh
env | grep DATABASE_URL
env | grep RABBITMQ_URL
```

Open a shell inside a container:

```bash
docker exec -it exmora-frontend sh
docker exec -it exmora-postgres psql -U postgres -d Exam_Bank
```

## 10. Health and Quick Checks

- Frontend: http://localhost:5173
- API Gateway: http://localhost:3100
- AI Worker API docs: http://localhost:8000/api/docs
- AI Worker API health: http://localhost:8000/api/v1/health
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3006
- RabbitMQ UI: http://localhost:15672

## 11. Reset Data

Stop and remove containers, networks, and volumes:

```bash
docker compose down
docker compose down --volumes
```

Remove only the Postgres data volume to re-run init/seed:

```bash
docker volume rm <project_name>_postgres-data
```

Example if your project folder is `Project_Exmora`:

```bash
docker volume rm Project_Exmora_postgres-data
docker compose up -d
```

Manually apply schema and seed from host:

```bash
psql -U postgres -d Exam_Bank -f "c:\Users\Admin\Project_Exmora\database\schema_optimized.sql"
psql -U postgres -d Exam_Bank -f "c:\Users\Admin\Project_Exmora\database\seed_data.sql"
```

## 12. AI Worker Standalone

To run only the AI worker stack:

```bash
cd backend/AI_Worker_Service
docker compose up -d --build
```

To stop it:

```bash
cd backend/AI_Worker_Service
docker compose down
```

## 13. Common Troubleshooting

- Port conflicts: change host ports in `docker-compose.yml`
- Env not updating: containers do not auto-reload `.env.docker` after creation; recreate containers
- Database not seeded: only runs on fresh volume creation
- Frontend not reachable: verify host port `5173` and container command uses `--host 0.0.0.0`
- AI worker fails to start: ensure `backend/AI_Worker_Service/.env.docker` exists and contains required variables
- RabbitMQ queue issues: check the management UI at http://localhost:15672
