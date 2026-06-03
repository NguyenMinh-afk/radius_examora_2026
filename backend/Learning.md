# Learning & Run Notes (Backend)

Mục đích: hướng dẫn ngắn để chạy môi trường backend local, ports chính, cách đồng bộ `.env` và một số lưu ý debug.

## 1. Chuẩn Bị

- Từ thư mục `backend`, tạo hoặc cập nhật `.env` cho mỗi service nếu cần: chạy `./setup-env.sh` (nếu có) hoặc copy từ `.env.example` và sửa giá trị `DB_HOST` → `postgres-db`, `RABBITMQ_HOST` → `rabbitmq`, `DB_NAME` → `Exam_Bank`.
- Lưu ý quan trọng: container Docker không tự reload `.env` khi bạn sửa file trên máy. Nếu `.env` đổi mà container vẫn chạy, service có thể đang giữ biến môi trường cũ.

## 2. Root Cause Khi Google Login Fail

- Trên local chạy `npm run dev`, service đọc `.env` trực tiếp nên có thể chạy bình thường.
- Khi chạy bằng Docker Compose, biến môi trường được nạp vào container lúc tạo container. Nếu bạn đổi `.env` sau đó, container không tự cập nhật.
- Vì vậy có thể xảy ra mismatch kiểu:

```bash
Local .env
DB_HOST=localhost
RABBITMQ_HOST=localhost

Docker container
DB_HOST=postgres-db
RABBITMQ_HOST=rabbitmq
```

- Hoặc ngược lại. Khi backend Google callback cần truy vấn DB / OAuth user, chỉ cần sai env là frontend sẽ chỉ thấy `Google login failed`.

## 3. Build Vs Up

- Chỉ build image (không start containers):

```bash
docker compose build
```

- Tạo containers nhưng không start:

```bash
docker compose up --no-start
```

- Start và attach logs:

```bash
docker compose up --build
# hoặc chỉ start background
docker compose up -d
```

## 4. Khởi Từng Nhóm Để Debug

```bash
docker compose up -d postgres-db rabbitmq prometheus grafana
docker compose up --build user-service api-gateway exam-service question-service ai-generation-service notification-service infrastructure-service frontend
```

## 5. Ports Quan Trọng (host:container)

- Postgres: 5432:5432
- RabbitMQ: 5672:5672 (client), 15672:15672 (management)
- User Service: 5000:5000
- API Gateway: 3100:3000 (host 3100 → container 3000)
- Exam: 3001:3001
- Question: 3002:3002
- AI Generation: 3003:3003
- Notification: 3004:3004
- Infrastructure Service: 5005:5005
- Prometheus: 9090:9090
- Grafana: 3000:3000
- Frontend: 5173:5173

## 6. Postgres Init

- Init scripts `../database/schema_optimized.sql` và `../database/seed_data.sql` được mount vào `/docker-entrypoint-initdb.d/`. Chúng chỉ chạy khi volume dữ liệu mới (lần đầu tạo DB). Nếu cần reset init, xóa volume `postgres` rồi `docker compose up` lại.

## 7. Prometheus / Grafana

- Prometheus config: `infra/prometheus/prometheus.yml` (scrape `/metrics`). Kiểm tra endpoint metrics cho từng service, ví dụ `http://localhost:5005/metrics`.
- Grafana UI: `http://localhost:3000`.

## 8. Debug Nhanh

- Xem logs live: `docker compose logs -f <service>`
- List containers và ports: `docker compose ps` hoặc `docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`
- Kiểm tra env thực tế trong container:

```bash
docker exec -it backend-user-service-1 sh
env | grep DB_HOST
env | grep RABBITMQ_HOST
```

- Nếu vừa sửa `.env`, đồng bộ lại container bằng:

```bash
docker compose down
docker compose up -d --force-recreate
```

- Dừng/clean: `docker compose down` (gỡ network + containers), `docker compose rm` để remove.

## 9. Gợi Ý Cấu Hình Thêm

- Thêm `healthcheck` và `restart: unless-stopped` cho services quan trọng nếu muốn tự khởi lại khi lỗi.

## 10. Quy Ước Env Nên Dùng

- Chạy local ngoài Docker: `DB_HOST=localhost`, `RABBITMQ_HOST=localhost`.
- Chạy bằng Docker Compose: `DB_HOST=postgres-db`, `RABBITMQ_HOST=rabbitmq`.
- Tốt nhất là tách riêng file env theo môi trường, ví dụ `.env.local` và `.env.docker`, thay vì sửa một file qua lại.

Nếu muốn, tôi có thể: (A) khởi `infrastructure-service` và theo dõi logs, (B) thêm một đoạn `setup-env.sh` mẫu vào repo, hoặc (C) cập nhật README chạy từng service. Bạn chọn phương án nào?
