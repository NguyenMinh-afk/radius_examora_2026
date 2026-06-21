# Module Admin

Phần Admin dùng để quản trị hệ thống ở mức tổng quan: người dùng, phân quyền, trạng thái khóa học, trạng thái câu hỏi, giám sát RabbitMQ/AI job, gửi thông báo, audit log và system log.

Admin không chỉnh sửa nội dung học thuật bên trong khóa học hoặc câu hỏi. Các phần tạo/sửa nội dung chi tiết nên thuộc phạm vi của giảng viên.

## Tài khoản đăng nhập

```text
Email: admin@examora.local
Password: Admin@123
```

## Chạy bằng Docker

Chạy tại thư mục gốc của dự án:

```powershell
cd D:\MICROSERVICE+RABBITMQ+AITAOSINH\github\Project_Exmora
docker compose -f backend/docker-compose.yml up -d postgres-db rabbitmq user-service frontend
```

Mở giao diện:

```text
http://localhost:5173
```

RabbitMQ Management:

```text
http://localhost:15672
Username: admin
Password: StrongPassword123
```

## Nạp dữ liệu demo

Chạy sau khi PostgreSQL đã khởi động:

```powershell
docker exec -i backend-postgres-db-1 psql -U postgres -d Exam_Bank < database/admin_demo_seed.sql
```

File seed demo có thể chạy nhiều lần mà không tạo trùng dữ liệu. Dữ liệu demo bao gồm:

- Tài khoản admin, giảng viên, sinh viên và một sinh viên bị khóa
- Một số khóa học demo
- Câu hỏi thường và câu hỏi do AI sinh
- AI jobs và RabbitMQ queue jobs
- Thông báo hệ thống
- Audit logs và system logs

## Các chức năng Admin đã triển khai

| Chức năng | Mô tả |
|---|---|
| Dashboard | Xem thống kê tổng quan hệ thống |
| Users | Xem danh sách người dùng, đổi vai trò, khóa/mở tài khoản |
| Courses | Xem danh sách khóa học, xem chi tiết read-only, ẩn/hiện khóa học |
| Questions | Xem danh sách câu hỏi, xem chi tiết read-only, ẩn/hiện câu hỏi |
| RabbitMQ | Theo dõi queue jobs và trạng thái xử lý |
| AI Jobs | Theo dõi tiến trình sinh câu hỏi bằng AI |
| Notifications | Gửi thông báo broadcast đến tất cả/giảng viên/sinh viên |
| Audit Logs | Truy vết thao tác của Admin |
| System Logs | Xem sự kiện vận hành hệ thống |

## Tóm tắt Admin API

Tất cả API bên dưới yêu cầu JWT của tài khoản Admin.

| Nhóm | Method | Endpoint | Mục đích |
|---|---|---|---|
| Dashboard | GET | `/api/admin/dashboard` | Lấy thống kê tổng quan |
| Users | GET | `/api/admin/users` | Lấy danh sách và lọc người dùng |
| Users | PATCH | `/api/admin/users/:id/status` | Khóa/mở hoặc duyệt người dùng |
| Users | PATCH | `/api/admin/users/:id/role` | Đổi vai trò người dùng |
| Roles | GET | `/api/admin/roles` | Lấy danh sách vai trò |
| Courses | GET | `/api/admin/courses` | Lấy danh sách và lọc khóa học |
| Courses | GET | `/api/admin/courses/:id` | Xem chi tiết khóa học |
| Courses | PATCH | `/api/admin/courses/:id/status` | Ẩn/hiện khóa học |
| Questions | GET | `/api/admin/questions` | Lấy danh sách và lọc câu hỏi |
| Questions | GET | `/api/admin/questions/:id` | Xem chi tiết câu hỏi |
| Questions | PATCH | `/api/admin/questions/:id/status` | Ẩn/hiện câu hỏi |
| AI Jobs | GET | `/api/admin/ai-jobs` | Giám sát AI jobs |
| Queue Jobs | GET | `/api/admin/queue-jobs` | Giám sát RabbitMQ jobs |
| Notifications | GET | `/api/admin/notifications` | Xem lịch sử thông báo broadcast |
| Notifications | POST | `/api/admin/notifications` | Gửi thông báo broadcast |
| Audit Logs | GET | `/api/admin/audit-logs` | Xem lịch sử thao tác Admin |
| System Logs | GET | `/api/admin/system-logs` | Xem sự kiện vận hành |

## Luồng demo đề xuất

```text
Admin đăng nhập
-> Xem Dashboard
-> Xem danh sách người dùng
-> Đổi vai trò hoặc khóa tài khoản bằng modal xác nhận
-> Xem danh sách khóa học
-> Ẩn/hiện khóa học
-> Xem danh sách câu hỏi
-> Xem chi tiết câu hỏi read-only
-> Ẩn/hiện câu hỏi
-> Gửi thông báo broadcast
-> Kiểm tra RabbitMQ/AI Jobs
-> Kiểm tra Audit Logs và System Logs
```

## Phạm vi của Admin

Admin được quyền kiểm soát truy cập và trạng thái hiển thị, nhưng không trực tiếp chỉnh sửa nội dung học thuật.

- Admin có thể ẩn/hiện khóa học.
- Admin có thể ẩn/hiện câu hỏi.
- Admin có thể khóa/mở tài khoản người dùng.
- Admin có thể gửi thông báo hệ thống.
- Admin có thể theo dõi AI/RabbitMQ jobs.
- Admin có thể xem log để truy vết thao tác và lỗi hệ thống.
- Giảng viên chịu trách nhiệm chính với nội dung khóa học, chương, chủ đề và câu hỏi.
