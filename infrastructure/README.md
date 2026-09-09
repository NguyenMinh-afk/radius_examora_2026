# ============================================
# EXAMORA - Infrastructure README
# ============================================

# Development Environment Setup

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) >= 24.0
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.20

## Quick Start

### 1. Start Infrastructure

```bash
cd infrastructure
docker compose up -d
```

### 2. Verify Services

```bash
docker compose ps
```

### 3. Check Logs

```bash
docker compose logs -f postgres-db
docker compose logs -f rabbitmq
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Primary database |
| RabbitMQ | 5672, 15672 | Message broker + Management UI |
| Prometheus | 9090 | Metrics collection |
| Grafana | 3006 | Dashboards |

## Access URLs

- **PostgreSQL:** `localhost:5432` (user: `postgres`, pass: `123456`)
- **RabbitMQ:** `http://localhost:15672` (user: `admin`, pass: `StrongPassword123`)
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3006 (user: `admin`, pass: `admin123`)

## Database Initialization

On first run, the database is initialized with:
- All service schemas (user_db, course_db, question_db, exam_db, ai_db, notification_db, infra_eventing, infra_observability)
- Seed data (roles, users, courses, questions, exams, classes)

## Reset Database

```bash
# Stop and remove volumes
docker compose down -v

# Start fresh
docker compose up -d
```

## Common Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes (clean reset)
docker compose down -v

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f postgres-db
docker compose logs -f rabbitmq

# Restart a service
docker compose restart prometheus
```

## Troubleshooting

### PostgreSQL connection refused
```bash
# Check if postgres is ready
docker compose exec postgres-db pg_isready -U postgres
```

### RabbitMQ not starting
```bash
# Check RabbitMQ status
docker compose exec rabbitmq rabbitmqctl status
```

### Database not initialized
```bash
# Manually run init scripts
docker compose exec -T postgres-db psql -U postgres -d Exam_Bank < ../database/migrations/00-init-schemas.sql
```

## Project Structure

```
infrastructure/
├── docker-compose.yml       # Main compose file
├── README.md               # This file
├── prometheus/             # Prometheus config
│   └── prometheus.yml
├── grafana/                # Grafana config
│   ├── grafana.ini
│   └── provisioning/
│       ├── datasources/
│       └── dashboards/
├── postgres/               # PostgreSQL init scripts
│   └── init/
├── init-scripts/           # Database migrations
│   └── *.sql
└── monitoring/             # Monitoring configs
    ├── prometheus/
    └── grafana/
```
