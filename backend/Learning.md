
# Learning & Run Notes (Backend)

Mục đích: tệp này tóm tắt nhanh cách chạy môi trường backend local, ports chính, file .env và các lưu ý debug.

1) Chạy nhanh (tại thư mục `backend`):

```bash
cd c:\Users\Admin\Project_Exmora\backend
docker compose up --build
```

Hoặc khởi từng nhóm để debug:

```bash
docker compose up -d postgres-db rabbitmq prometheus grafana
docker compose up --build user-service api-gateway exam-service question-service ai-generation-service notification-service frontend
```

2) Ports quan trọng (host:container):
- Postgres: 5432:5432
- RabbitMQ: 5672:5672 (client), 15672:15672 (management)
- User Service: 5000:5000
- API Gateway: 3100:3000 (host 3100 → container 3000)
- Exam: 3001:3001
- Question: 3002:3002
- AI Generation: 3003:3003
- Notification: 3004:3004
- Prometheus: 9090:9090
- Grafana: 3000:3000
- Frontend: 5173:5173

3) Env files:
- Kiểm tra các file `.env` trong mỗi service (ví dụ `backend/User_Service/.env`, `backend/AI_Generation_Service/.env`). Nếu thiếu, copy từ `.env.example` và sửa theo môi trường local.

4) Postgres init script:
- Script khởi tạo hiện tạo 1 database `Exam_Bank`. Lưu ý: các file trong `/infra/postgres/init` chỉ chạy khi volume dữ liệu mới (lần khởi tạo đầu).
- Nếu cần chạy lại init, xóa volume postgres rồi `docker compose up` lại.

5) Prometheus/Grafana:
- Prometheus config: `infra/prometheus/prometheus.yml` (scrape /metrics). Nếu service nào dùng `/actuator/prometheus`, sẽ cần điều chỉnh.
- Grafana mặc định có UI trên `http://localhost:3000`.

6) Debug nhanh:
- Xem logs: `docker compose logs -f <service>`
- Kiểm tra port đang lắng nghe: `netstat -ano | findstr :3000` (Windows)
- Kiểm tra endpoint metrics: `curl http://localhost:5000/metrics` hoặc `/actuator/prometheus`

7) Gợi ý cấu hình thêm (nếu muốn):
- Thêm `healthcheck` và `restart: unless-stopped` cho services quan trọng.
- Tách infra components (Grafana/Prometheus/MinIO) thành services riêng để dễ quản lý.

Nếu cần, tôi có thể bổ sung hướng dẫn cài Node/npm, script chạy dev từng service hoặc tạo sample dashboard Grafana.

