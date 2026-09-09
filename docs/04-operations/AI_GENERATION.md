# AI Generation - Hướng dẫn Setup và Sử dụng

## Tổng quan

Hệ thống AI Generation cho phép giáo viên tạo câu hỏi trắc nghiệm tự động bằng AI từ nội dung học tập. Hệ thống sử dụng RabbitMQ để xử lý bất đồng bộ và Gemini AI để sinh câu hỏi.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│ API Gateway  │────▶│ AI Gen Svc  │────▶│  RabbitMQ   │
│   (React)    │     │  (Port 3100)│     │ (Port 3003) │     │  (Port 5672)│
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PostgreSQL │◀────│ AI Worker   │◀────│  Consumer   │◀────│    DLQ      │
│  (Port 5432)│     │ (FastAPI)   │     │             │     │             │
└─────────────┘     │ (Port 8000) │     └─────────────┘     └─────────────┘
                    └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │ Gemini API  │
                    │ (Cloud)     │
                    └─────────────┘
```

## Các thành phần

### 1. AI_Generation_Service (Node.js - Port 3003)

Service nhận request từ frontend, tạo request/task trong database và gửi message vào RabbitMQ queue.

**Các endpoint chính:**
- `POST /api/ai/generate-questions` - Tạo yêu cầu sinh câu hỏi
- `GET /api/ai/requests/:id` - Lấy trạng thái request
- `GET /api/ai/requests` - Lấy lịch sử các request

### 2. AI_Worker_Service (Python FastAPI - Port 8000)

Worker xử lý message từ RabbitMQ, gọi Gemini API để sinh câu hỏi và lưu kết quả vào database.

**Các endpoint chính:**
- `GET /api/docs` - Swagger UI
- `GET /api/v1/health` - Health check
- `GET /api/v1/generation/tasks/:task_id/results` - Lấy kết quả generation

### 3. RabbitMQ (Port 5672, Management: 15672)

Message broker xử lý giao tiếp bất đồng bộ giữa AI_Generation_Service và AI_Worker_Service.

**Queue Configuration:**
- Main queue: `ai.generation`
- DLQ: `ai.generation.dlq`

The main queue has no message TTL. A task therefore remains pending while the
Worker is unavailable instead of expiring into the DLQ without a matching
database status update. Existing RabbitMQ installations must follow the
one-time queue migration in `Docker.md`.
- Exchange: `examora.dlx` (direct)

## Setup

### Yêu cầu

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+
- RabbitMQ 3+

### Các bước Setup

#### 1. Cài đặt Database

Đảm bảo PostgreSQL đang chạy và database `Exam_Bank` đã được tạo:

```sql
-- Kiểm tra database
SELECT datname FROM pg_database;

-- Database cần có: Exam_Bank
-- Schema cần có: ai_db, public
```

#### 2. Cài đặt RabbitMQ

```bash
# Chạy RabbitMQ container
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=StrongPassword123 \
  rabbitmq:3-management
```

#### 3. Cài đặt AI_Generation_Service

```bash
cd backend/AI_Generation_Service

# Cài đặt dependencies
npm install

# Copy và chỉnh sửa .env
cp .env.example .env
# Chỉnh sửa .env với thông tin database và RabbitMQ

# Chạy service
npm run dev
```

#### 4. Cài đặt AI_Worker_Service

```bash
cd backend/AI_Worker_Service

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
.\venv\Scripts\activate   # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Copy và chỉnh sửa .env
cp .env.docker .env  # cho Docker
# hoặc chỉnh sửa .env cho local

# Chạy worker
python run_worker.py

# (Tùy chọn) Chạy FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 5. Cài đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

## Sử dụng

### 1. Truy cập trang AI Generation

Đăng nhập với tài khoản giáo viên và truy cập:
```
http://localhost:5173/teacher/ai-generation
```

### 2. Tạo câu hỏi mới

1. Chọn tab "Tạo mới"
2. Chọn môn học (tùy chọn)
3. Chọn loại câu hỏi (mặc định: trắc nghiệm)
4. Chọn độ khó (dễ/trung bình/khó/rất khó)
5. Nhập số lượng câu hỏi (1-50)
6. Nhập nội dung học tập hoặc tải lên tài liệu
7. Click "Tạo câu hỏi"

### 3. Theo dõi tiến trình

1. Chuyển sang tab "Lịch sử"
2. Xem trạng thái các request:
   - **Đang chờ**: Request đã được gửi, đang chờ xử lý
   - **Đang xử lý**: AI Worker đang sinh câu hỏi
   - **Hoàn thành**: Đã sinh xong, có thể xem câu hỏi
   - **Thất bại**: Có lỗi xảy ra

### 4. Xem câu hỏi đã tạo

Sau khi hoàn thành, click icon mắt để xem câu hỏi hoặc truy cập trang Questions.

## Cấu hình môi trường

### AI_Generation_Service (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Exam_Bank
DB_USER=postgres
DB_PASSWORD=123456

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=StrongPassword123
RABBITMQ_URL=amqp://admin:StrongPassword123@localhost:5672
RABBITMQ_EXCHANGE=examora.topic
RABBITMQ_ROUTING_KEY=ai.generate

# Queue
RABBITMQ_QUEUE=ai.generation
RABBITMQ_DLQ=ai.generation.dlq
```

### AI_Worker_Service (.env)

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:123456@localhost:5432/Exam_Bank

# RabbitMQ
RABBITMQ_URL=amqp://admin:StrongPassword123@localhost:5672/
RABBITMQ_EXCHANGE=examora.topic
RABBITMQ_ROUTING_KEY=ai.generate
RABBITMQ_QUEUE=ai.generation
RABBITMQ_DLX=examora.dlx
RABBITMQ_DLQ=ai.generation.dlq

# Gemini API
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.1-flash-lite

# Quota (Free tier: 18 requests/day)
GEMINI_DAILY_REQUEST_LIMIT=18
ENABLE_LOCAL_FALLBACK=true
LOCAL_FALLBACK_WHEN_QUOTA_EXCEEDED=true
```

## Xử lý sự cố

### 1. Message không được xử lý

Kiểm tra:
```bash
# Kiểm tra RabbitMQ
docker exec -it EXAMORA-rabbitmq rabbitmqctl list_queues name messages consumers arguments

# Kiểm tra message trong queue
docker exec -it EXAMORA-rabbitmq rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers
```

### 2. Worker không nhận message

Kiểm tra:
- Queue names có khớp không
- Connection string có đúng không
- Worker có đang chạy không

```bash
# Kiểm tra worker logs
docker logs EXAMORA-ai-worker-service
```

### 3. Gemini API lỗi quota

Hệ thống có cơ chế:
- Model fallback: Thử các model khác
- Local fallback: Sinh câu hỏi cơ bản khi quota hết
- Lỗi tạm thời: Retry/backoff tối đa 3 lần; quá số lần xử lý sẽ cập nhật `failed` và chuyển DLQ
- Hệ thống không sử dụng cơ chế đợi đến ngày hôm sau

### 4. Database connection failed

```bash
# Kiểm tra PostgreSQL
docker exec -it postgres psql -U postgres -d Exam_Bank

# Kiểm tra tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'ai_db';
```

## Monitoring

### RabbitMQ Management UI

Truy cập: http://localhost:15672
- Username: admin
- Password: StrongPassword123

### Worker Logs

```bash
# Xem logs real-time
docker logs -f EXAMORA-ai-worker-service

# Xem logs với grep
docker logs EXAMORA-ai-worker-service | grep ERROR
```

### Database Queries

```sql
-- Xem các request pending
SELECT * FROM ai_db.ai_generation_requests WHERE status = 'pending';

-- Xem các câu hỏi chờ review
SELECT * FROM ai_db.generated_questions WHERE status = 'pending_review';

-- Xem logs
SELECT * FROM ai_db.ai_generation_logs ORDER BY created_at DESC LIMIT 20;
```

## Security

- API Gateway yêu cầu JWT token
- Database passwords nên được đặt trong environment variables
- Gemini API key cần được bảo mật
- RabbitMQ credentials nên được thay đổi trong production

## Performance

- Prefetch count của consumer: 1 (xử lý từng message)
- Retry count: 3 lần trước khi gửi vào DLQ
- Message TTL: 1 giờ
- Max context chars: 120,000
- Max output tokens: 32,768
