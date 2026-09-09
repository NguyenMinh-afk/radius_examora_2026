# 🎓 EXAMORA — Hệ thống thi trắc nghiệm trực tuyến

> **Hệ thống thi trắc nghiệm trực tuyến với AI-powered question generation và Event-Driven Architecture**

Nền tảng thi trực tuyến microservices cho các tổ chức giáo dục, gồm 3 backend services (Node.js + Python), 1 frontend SPA (React), và RabbitMQ cho message-driven architecture.

---

## 📑 Mục lục

1. [Cách chạy services](#1-cách-chạy-services) — chạy local, dev, production
2. [Cách triển khai logic](#2-cách-triển-khai-logic) — API Gateway, AI Generation flow
3. [Kết nối & giao tiếp giữa services](#3-kết-nối--giao-tiếp-giữa-services) — RabbitMQ, REST
4. [Phụ lục](#4-phụ-lục) — ports, topics, stack, tham chiếu

---

## 1. Cách chạy services

### 1.1 Yêu cầu hệ thống

| Tool | Phiên bản | Cài đặt |
|---|---|---|
| Node.js | ≥ 20.x | [nodejs.org](https://nodejs.org) |
| Python | 3.11.x | [python.org](https://python.org) |
| Docker | ≥ 24.x + Compose v2 | [docker.com](https://docker.com) |
| npm | ≥ 10.x | `npm install -g npm` |

### 1.2 Chạy lần đầu

```bash
# 1. Clone & copy env
git clone <repo-url>
cd Project_Examora
cp .env.example .env

# 2. Khởi động infrastructure (Postgres, RabbitMQ)
docker compose up -d postgres rabbitmq

# 3. Apply database schema và seed data
docker compose up -d
docker compose exec -T postgres psql -U examora -d examora < database/schema_optimized.sql
docker compose exec -T postgres psql -U examora -d examora < database/seed_data.sql

# 4. Khởi động services
docker compose up -d
```

### 1.3 Stack infrastructure (Docker Compose)

| Service | Port | Mục đích |
|---|---|---|
| PostgreSQL 15 | 5432 | Database |
| RabbitMQ | 5672 | Message Broker |
| RabbitMQ Management | 15672 | Message visualization |
| API Gateway | 3100 | REST API Gateway |
| AI Generation Service | 3003 | AI Question Generation |
| AI Worker Service | 8000 | FastAPI Worker |
| Frontend | 5173 | React SPA |

Khởi động chỉ infrastructure:

```bash
docker compose up -d postgres rabbitmq
```

### 1.4 Chạy từng service độc lập

#### Frontend (React + Vite)

```bash
cd web-app
npm install
npm run dev    # http://localhost:5173
```

#### API Gateway (Node.js)

```bash
cd backend/API_Gateway
npm install
npm run dev    # port 3100
```

#### AI Generation Service (Node.js)

```bash
cd backend/AI_Generation_Service
npm install
npm run dev    # port 3003
```

#### AI Worker Service (Python FastAPI)

```bash
cd backend/AI_Worker_Service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 1.5 Quick Start với Docker

```bash
# Start all services
docker compose up -d

# Rebuild khi có thay đổi code
docker compose up -d --build

# Xem logs
docker compose logs -f

# Stop all
docker compose down
```

### 1.6 Verify mọi thứ OK

```bash
# Health check API Gateway
curl http://localhost:3100/health

# RabbitMQ Management UI
open http://localhost:15672

# Frontend
open http://localhost:5173
```

### 1.7 Common commands

```bash
# Docker
docker compose up -d              # Start containers
docker compose down                # Stop containers
docker compose logs -f            # Tail logs
docker compose down -v           # Destroy volumes

# Database
docker compose exec postgres psql -U examora -d examora

# Reset database
docker compose exec -T postgres psql -U examora -d examora < database/schema_optimized.sql
docker compose exec -T postgres psql -U examora -d examora < database/seed_data.sql
```

---

## 2. Cách triển khai logic

### 2.1 Architecture Overview

```
┌──────────┐
│ Frontend │  React SPA (port 5173)
└────┬─────┘
     │ HTTPS
     ▼
┌──────────────┐
│ API Gateway  │  Node.js Express (port 3100)
│              │  - JWT validation
│              │  - Route to services
│              │  - Rate limiting
└────┬─────────┘
     │
     ├──► AI Generation Service (3003)   — Node.js, Gemini API
     │
     ▼
┌──────────────┐
│  RabbitMQ   │  Message Broker (port 5672)
│              │  - Queue: ai.question.generate
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ AI Worker    │  Python FastAPI (port 8000)
│ Service      │  - Gemini API integration
│              │  - Question generation
└──────────────┘

Database:
- PostgreSQL: examora_db
```

### 2.2 AI Question Generation Flow

```
1. Client POST /api/questions/generate
   └─► API Gateway → AI Generation Service
       ├─► Validate request
       ├─► Create job record in DB
       └─► Publish to RabbitMQ queue "ai.question.generate"
           📤

2. AI Worker Service consumes queue:
   └─► Call Gemini API for question generation
   └─► Parse and validate questions
   └─► Publish "question.generated" event

3. AI Generation Service receives result:
   └─► Update job status
   └─► Notify client (WebSocket/polling)
```

### 2.3 Service Structure

#### API Gateway

```
backend/API_Gateway/
├── src/
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── routes/            # Route definitions
│   ├── middleware/        # Auth, logging, rate limit
│   └── config/            # Environment config
├── tests/
└── index.ts
```

#### AI Generation Service

```
backend/AI_Generation_Service/
├── src/
│   ├── controllers/       # Request handlers
│   ├── services/          # AI logic, RabbitMQ
│   ├── models/            # Data models
│   ├── routes/            # Route definitions
│   ├── config/            # Environment config
│   └── tests/
└── index.ts
```

#### AI Worker Service

```
backend/AI_Worker_Service/
├── app/
│   ├── main.py            # FastAPI app
│   ├── api/               # Routes
│   ├── services/          # Gemini API
│   ├── schemas/           # Pydantic models
│   └── core/              # Config, logging
├── tests/
└── requirements.txt
```

### 2.4 Coding rules

| Quy tắc | Chi tiết |
|---|---|
| Branch | `feature/add-ai-generation` |
| Commit | `feat(ai): add Gemini API integration` (Conventional Commits) |
| Logging | Winston (Node.js), structlog (Python) — **không `console.log`** |
| Secrets | KHÔNG hardcode credentials — load từ `.env` |
| Coverage | ≥ 80% |
| Tests | `should_<expected>_When_<condition>` naming |

---

## 3. Kết nối & giao tiếp giữa services

### 3.1 Communication patterns

| Pattern | Khi nào dùng | Công cụ |
|---|---|---|
| **REST via Gateway** | Query data cần ngay, CRUD | Express routes |
| **RabbitMQ** | Async, multiple consumers, job processing | amqplib |
| **WebSocket** | Real-time notifications | Socket.io |

### 3.2 RabbitMQ Configuration

| Queue | Producer | Consumers |
|---|---|---|
| `ai.question.generate` | AI Generation Service | AI Worker Service |
| `ai.question.completed` | AI Worker Service | AI Generation Service |
| `notification.send` | Any service | Notification Handler |

### 3.3 Event Schema

```json
{
  "event_id": "uuid",
  "event_type": "question.generated",
  "event_version": 1,
  "aggregate_type": "question",
  "aggregate_id": "uuid",
  "source": "AI_Worker_Service",
  "occurred_at": "2026-07-23T10:00:00.000Z",
  "trace_id": "uuid",
  "data": {}
}
```

### 3.4 Message Queue Flow

```
┌─────────────────┐         ┌─────────────┐
│ AI Generation   │ Publish │  RabbitMQ   │
│ Service         │────────►│  Exchange   │
│ (Producer)      │         │             │
└─────────────────┘         └──────┬──────┘
                                    │
                                    │ Route
                                    ▼
                             ┌──────────────┐
                             │ ai.question  │
                             │ .generate    │
                             │ (Queue)      │
                             └──────┬───────┘
                                    │
                                    │ Consume
                                    ▼
                             ┌─────────────────┐
                             │ AI Worker       │
                             │ Service         │
                             │ (Consumer)      │
                             └─────────────────┘
```

### 3.5 JWT Authentication

```
Client                    API Gateway
  │                            │
  │  POST /api/auth/login      │
  ├───────────────────────────►│
  │                            │
  │  { accessToken }           │
  │◄───────────────────────────┤
  │                            │
  │  GET /api/questions        │
  │  Authorization: Bearer ... │
  ├───────────────────────────►│
  │                            │ JwtMiddleware:
  │                            │  1. Validate token
  │                            │  2. Extract user claims
  │                            │  3. Attach to request
  │                            │
  │  200 OK { questions }      │
  │◄───────────────────────────┤
```

Public paths (không cần JWT):
- `/api/auth/login`
- `/api/auth/register`
- `/api/health`

---

## 4. Phụ lục

### 4.1 Service port mapping

| Service | Port | Language |
|---|---|---|
| Frontend (Vite dev) | 5173 | TypeScript |
| API Gateway | 3100 | Node.js |
| AI Generation Service | 3003 | Node.js |
| AI Worker Service | 8000 | Python |
| PostgreSQL | 5432 | SQL |
| RabbitMQ | 5672 | AMQP |
| RabbitMQ Management | 15672 | HTTP |

### 4.2 Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS + React Router v7 |
| API Gateway | Node.js + Express + TypeScript |
| AI Generation | Node.js + Gemini API + RabbitMQ |
| AI Worker | Python + FastAPI + Pydantic + Gemini API |
| Database | PostgreSQL 15 |
| Message Queue | RabbitMQ |
| Container | Docker + Docker Compose |

### 4.3 Cấu trúc thư mục

```
Project_Examora/
├── backend/
│   ├── API_Gateway/            # Node.js Express API Gateway
│   ├── AI_Generation_Service/  # Node.js AI Service
│   └── AI_Worker_Service/       # Python FastAPI Worker
├── web-app/                     # React Frontend
├── database/
│   ├── schema_optimized.sql    # Database schema
│   └── seed_data.sql           # Sample data
├── docker/
│   └── Dockerfile.*            # Docker configs
├── docs/
├── .env.example
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

### 4.4 RabbitMQ debugging commands

```bash
# List queues
docker compose exec rabbitmq rabbitmqctl list_queues

# List exchanges
docker compose exec rabbitmq rabbitmqctl list_exchanges

# View queue messages
docker compose exec rabbitmq rabbitmqadmin get queue=ai.question.generate

# Purge queue
docker compose exec rabbitmq rabbitmqctl purge_queue ai.question.generate
```

### 4.5 PostgreSQL queries

```bash
# List tables
docker compose exec postgres psql -U examora -d examora -c '\dt'

# View table data
docker compose exec postgres psql -U examora -d examora -c 'SELECT * FROM questions LIMIT 10;'

# Connection stats
docker compose exec postgres psql -U examora -d examora -c \
  "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

### 4.6 Tài liệu liên quan

| Tài liệu | Mục đích |
|---|---|
| `database/Data.md` | Database schema, seed data |
| `database/Command.md` | PostgreSQL commands reference |
| `Docker.md` | Docker setup, troubleshooting |
| `backend/Backend.md` | Backend setup, environment |
| `frontend/Frontend.md` | Frontend setup, API clients |

### 4.7 Environment Variables

```bash
# Frontend (.env)
VITE_API_GATEWAY_URL=http://localhost:3100
VITE_RABBITMQ_URL=ws://localhost:15672

# API Gateway (.env)
PORT=3100
DATABASE_URL=postgresql://examora:examora@localhost:5432/examora
RABBITMQ_URL=amqp://examora:examora@localhost:5672
JWT_SECRET=your-secret-key

# AI Generation Service (.env)
PORT=3003
GEMINI_API_KEY=your-gemini-key
RABBITMQ_URL=amqp://examora:examora@localhost:5672

# AI Worker Service (.env)
PORT=8000
GEMINI_API_KEY=your-gemini-key
RABBITMQ_URL=amqp://examora:examora@localhost:5672
```

---

## 📄 License

Proprietary © 2026 Examora Team. All rights reserved.

<div align="center">

**Made with ❤️ by Examora Team**

</div>
