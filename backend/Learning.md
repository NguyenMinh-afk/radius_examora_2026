
# Learning & Run Notes (Backend)

Mục đích: hướng dẫn ngắn để chạy môi trường backend local, ports chính, cách đồng bộ `.env` và một số lưu ý debug.

1) Chuẩn bị
- Từ thư mục `backend`, tạo hoặc cập nhật `.env` cho mỗi service nếu cần: chạy `./setup-env.sh` (nếu có) hoặc copy từ `.env.example` và sửa giá trị `DB_HOST` → `postgres-db`, `RABBITMQ_HOST` → `rabbitmq`, `DB_NAME` → `Exam_Bank`.

2) Build vs Up
- Chỉ build image (không start containers):

```bash
docker compose build
```

- Tạo containers nhưng không start:

```bash
docker compose up --no-start
```

- Start (ta sẽ khởi chạy và attach logs):

```bash
docker compose up --build
# hoặc chỉ start background
docker compose up -d
```

3) Khởi từng nhóm (để debug nhanh)

```bash
docker compose up -d postgres-db rabbitmq prometheus grafana
docker compose up --build user-service api-gateway exam-service question-service ai-generation-service notification-service infrastructure-service frontend
```

4) Ports quan trọng (host:container)
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

5) Postgres init
- Init scripts `../database/schema_optimized.sql` và `../database/seed_data.sql` được mount vào `/docker-entrypoint-initdb.d/`. Chúng chỉ chạy khi volume dữ liệu mới (lần đầu tạo DB). Nếu cần reset init, xóa volume `postgres` rồi `docker compose up` lại.

6) Prometheus / Grafana
- Prometheus config: `infra/prometheus/prometheus.yml` (scrape `/metrics`). Kiểm tra endpoint metrics cho từng service (vd. `http://localhost:5005/metrics`).
- Grafana UI: `http://localhost:3000`.

7) Debug nhanh
- Xem logs live: `docker compose logs -f <service>`
- List containers và ports: `docker compose ps` hoặc `docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`
- Dừng/clean: `docker compose down` (gỡ network + containers), `docker compose rm` để remove.

8) Gợi ý cấu hình thêm
- Thêm `healthcheck` và `restart: unless-stopped` cho services quan trọng nếu muốn tự khởi lại khi lỗi.

Nếu muốn, tôi có thể: (A) khởi `infrastructure-service` và theo dõi logs, (B) thêm một đoạn `setup-env.sh` mẫu vào repo, hoặc (C) cập nhật README chạy từng service. Bạn chọn phương án nào?

