# Docker Documentation

Hướng dẫn chạy EXAMORA với Docker Compose — cấu trúc services, quản lý containers, xem logs, rebuild images, reset data.

> Compose file chính: `infrastructure/docker-compose.yml` (KHÔNG nằm ở root).
> Container names: prefix `examora-` (lowercase).
> Project path mặc định trong ví dụ: `C:\Users\Admin\radius_examora_2026` (PowerShell) hoặc `~/radius_examora_2026` (bash).

## 1. Prerequisites

- Docker Desktop hoặc Docker Engine
- Docker Compose plugin (`docker compose`, không phải `docker-compose` cũ)
- Ít nhất 8 GB RAM, 4 CPU (đủ chạy 13+ services)
- Project code đã clone về local

## 2. Compose Files

| File | Vai trò |
| --- | --- |
| `infrastructure/docker-compose.yml` | Main compose — full stack |
| `backend/AI_Worker_Service/docker-compose.yml` | Standalone compose cho AI worker (chạy riêng) |

Compose chính reuses:
- `backend/AI_Worker_Service/Dockerfile`
- `backend/AI_Worker_Service/.env.docker`

## 3. Services Overview

| Service | Container | Image | Host:Container | Description |
| --- | --- | --- | --- | --- |
| Postgres | `examora-postgres` | postgres:15-alpine | 5432:5432 | Database |
| RabbitMQ | `examora-rabbitmq` | rabbitmq:3-management-alpine | 5672:5672, 15672:15672 | Message broker + Management UI |
| Redis | `examora-redis` | redis:7-alpine | 6379:6379 | Cache + session |
| User Service | `examora-user-service` | node:20-alpine | 5000:5000 | Auth + user management |
| Exam Service | `examora-exam-service` | node:20-alpine | 3001:3001 | Exam, class, assignment APIs |
| Question Service | `examora-question-service` | node:20-alpine | 3002:3002 | Question bank APIs |
| AI Generation Service | `examora-ai-generation-service` | node:20-alpine | 3003:3003 | AI orchestration APIs |
| AI Worker API | `examora-ai-worker-api` | python (build) | 8000:8000 | AI worker REST API (FastAPI) |
| AI Worker Service | `examora-ai-worker-service` | python (build) | (none) | Background worker (no API) |
| Notification Service | `examora-notification-service` | node:20-alpine | 3004:3004 | Notifications |
| Infrastructure Service | `examora-infrastructure-service` | node:20-alpine | 5005:5005 | Infra / monitoring APIs |
| API Gateway | `examora-api-gateway` | node:20-alpine | 3100:3000 | Main gateway (public port 3100) |
| Frontend | `examora-frontend` | node (nginx) | 5173:80 | React frontend (nginx port 80 trong container) |
| Prometheus | `examora-prometheus` | prom/prometheus:latest | 9090:9090 | Metrics scraper |
| Grafana | `examora-grafana` | grafana/grafana:latest | 3006:3000 | Dashboards (admin port 3006) |

## 4. Environment Files

Mỗi backend service có `.env.docker`. Compose tự load qua `env_file`:

- `backend/User_Service/.env.docker`
- `backend/Exam_Service/.env.docker`
- `backend/Question_Service/.env.docker`
- `backend/AI_Generation_Service/.env.docker`
- `backend/AI_Worker_Service/.env.docker`
- `backend/Notification_Service/.env.docker`
- `backend/Infrastructure_Service/.env.docker`
- `backend/API_Gateway_Service/.env.docker`
- `frontend/.env.docker`

`.env.docker` được git-ignore. Sau khi clone, copy từ template `.env.docker.example`:

```powershell
# PowerShell
Get-ChildItem backend, frontend -Filter ".env.docker.example" -Recurse | ForEach-Object {
  Copy-Item $_.FullName ($_.FullName -replace "\.example$","") -Force
}
```

```bash
# bash
find backend frontend -name '.env.docker.example' -exec sh -c \
  'cp "$1" "${1%.example}"' _ {} \;
```

**Không commit** `.env.docker` hay secrets thật.

Compose cũng override một số biến trực tiếp:

```yaml
environment:
  DATABASE_URL: postgres://postgres:123456@postgres-db:5432/Exam_Bank
  RABBITMQ_URL: amqp://admin:StrongPassword123@rabbitmq:5672
```

## 5. Database Initialization

Compose mount folder `database/initdb` vào Postgres init dir:

```yaml
volumes:
  - ../database/initdb:/docker-entrypoint-initdb.d:ro
```

**Chỉ chạy khi volume `postgres_data` được tạo lần đầu.** Volume đã có data → init scripts KHÔNG re-run.

Các file init chạy theo alphabet (xem chi tiết schemas tại `database/Data.md`):

- `00-init-schemas.sql` — schemas + enums
- `01-…08-…-service.sql` — tables từng schema
- `51-…57-….sql` — seeds (roles/users, courses, questions, exams/classes, AI jobs, notifications, observability)

## 6. Start the Full System

> Tất cả lệnh `docker compose` phải chạy từ thư mục `infrastructure/`, hoặc truyền `-f infrastructure/docker-compose.yml`.

### PowerShell (Windows)

```powershell
cd C:\Users\Admin\radius_examora_2026\infrastructure
docker compose up -d                    # Start tất cả
docker compose up -d --build           # Rebuild trước khi start
docker compose up -d postgres-db rabbitmq redis prometheus grafana   # Infra first
docker compose up -d --build user-service api-gateway exam-service question-service ai-generation-service notification-service infrastructure-service ai-worker-api ai-worker-service frontend
docker compose up                       # Foreground, attach logs
```

### Bash (Linux/macOS)

```bash
cd ~/radius_examora_2026/infrastructure
docker compose up -d
docker compose up -d --build
docker compose up -d postgres-db rabbitmq redis prometheus grafana
docker compose up -d --build user-service api-gateway exam-service question-service ai-generation-service notification-service infrastructure-service ai-worker-api ai-worker-service frontend
```

## 7. Rebuild and Refresh

```powershell
# Rebuild một service sau khi sửa code
docker compose up -d --build frontend
docker compose up -d --build ai-worker-api
docker compose up -d --build exam-service

# Sửa .env.docker → phải recreate container để apply
docker compose down
docker compose up -d --force-recreate
```

## 8. View Logs

```powershell
# Tất cả services
docker compose logs -f

# Một service
docker compose logs -f frontend
docker compose logs -f api-gateway
docker compose logs -f exam-service
docker compose logs -f ai-worker-api

# Một container cụ thể
docker logs -f examora-frontend
docker logs -f examora-postgres
```

## 9. Inspect Containers

```powershell
# List containers + ports
docker compose ps
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Env vars trong container
docker exec -it examora-ai-worker-api sh
env | grep DATABASE_URL
env | grep RABBITMQ_URL

# Shell vào container
docker exec -it examora-frontend sh
docker exec -it examora-postgres psql -U postgres -d Exam_Bank
```

## 10. Health Checks & URLs

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3100 |
| AI Worker Swagger | http://localhost:8000/api/docs |
| AI Worker Health | http://localhost:8000/api/v1/health |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3006 (admin / admin123) |
| RabbitMQ UI | http://localhost:15672 (admin / StrongPassword123) |
| Postgres | `localhost:5432` (postgres / 123456) |
| Redis | `localhost:6379` |

## 11. Reset Data

```powershell
# Stop + remove containers, networks, volumes
docker compose down
docker compose down -v

# Chỉ remove Postgres data → re-run init scripts
docker compose down
docker volume rm radius_examora_2026_postgres_data
docker compose up -d postgres-db
# Chờ init scripts xong
docker compose logs postgres-db | Select-String "initialization complete"
docker compose up -d

# Apply 1 SQL file thủ công (không mất data)
Get-Content C:\Users\Admin\radius_examora_2026\database\initdb\04-exam-service.sql | `
  docker exec -i examora-postgres psql -U postgres -d Exam_Bank
```

## 12. AI Worker Standalone

Chạy chỉ AI worker + dependencies (postgres, rabbitmq):

```bash
cd backend/AI_Worker_Service
docker compose up -d --build
docker compose down
```

## 13. Common Troubleshooting

| Lỗi | Cách xử lý |
| --- | --- |
| Port conflict | Đổi host port trong `infrastructure/docker-compose.yml` |
| Env không update | `.env.docker` không auto-reload — chạy `down` + `up -d --force-recreate` |
| DB không seed | Chỉ chạy khi volume mới → xóa `postgres_data` volume và `up` lại |
| Frontend không truy cập được | Container dùng nginx port 80; host map ra 5173. Kiểm tra port mapping |
| AI worker fail start | Đảm bảo `backend/AI_Worker_Service/.env.docker` tồn tại + có đủ biến |
| RabbitMQ queue issue | Mở http://localhost:15672 (admin / StrongPassword123) kiểm tra |
| Postgres schema not found | Volume cũ chưa chạy init scripts mới → `docker volume rm <project>_postgres_data` |
| Migrations drift so với model | Chạy lệnh SQL qua `docker exec -i examora-postgres psql … < file.sql` |

## 14. Cleanup toàn bộ

```powershell
# Stop + xóa containers, networks, volumes, images
docker compose down -v --rmi all
docker system prune -a
```
