# AI Service

## 1. Tổng quan

AI Service là backend sinh câu hỏi trắc nghiệm từ tài liệu học tập.

Hệ thống hiện hỗ trợ các đầu vào:
- PDF
- DOCX
- TXT
- Ảnh (`.png`, `.jpg`, `.jpeg`, `.webp`)

Luồng chung của hệ thống là:
- API nhận file hoặc text input
- API lưu metadata và tạo task
- Worker xử lý nền để đọc tài liệu, OCR khi cần, tiền xử lý nội dung
- Gemini sinh câu hỏi
- PostgreSQL lưu kết quả để người dùng lấy lại và review

Mục tiêu của dự án là tự động hóa pipeline từ tài liệu học tập sang bộ câu hỏi trắc nghiệm, nhưng vẫn giữ bước review trước khi dùng chính thức.

## 2. Chức năng đã có

Dự án hiện đã có các chức năng chính sau:
- Upload tài liệu học tập.
- Đọc PDF có text layer bằng `pypdf`.
- Đọc DOCX bằng `python-docx`.
- Đọc TXT bằng decode text.
- OCR PDF scan và ảnh bằng Tesseract local hoặc OCR.Space.
- Tự động chọn OCR provider theo loại tài liệu và trạng thái runtime.
- `TopicResolver` tự nhận diện môn/chủ đề từ nội dung tài liệu.
- Gemini single-call để sinh câu hỏi.
- Validate câu hỏi sau khi sinh.
- Lưu câu hỏi với trạng thái `pending_review`.
- API lấy kết quả theo task/request.
- Theo dõi quota Gemini và OCR.Space.

## 3. Kiến trúc tổng thể

Các thành phần chính:
- FastAPI API: nhận request, lưu file, tạo request/task.
- RabbitMQ: hàng đợi cho tác vụ xử lý nền.
- Worker: đọc tài liệu, OCR, preprocess, detect topic, gọi Gemini, validate và lưu kết quả.
- PostgreSQL: lưu request, task, document, câu hỏi sinh ra, log và quota.
- Tesseract / OCR.Space: xử lý OCR khi tài liệu không có text extract được.
- Gemini: sinh câu hỏi trắc nghiệm.
- `TopicResolver` local: nhận diện chủ đề mà không cần gọi Gemini.

## 4. Luồng xử lý tài liệu

Luồng xử lý chính của hệ thống:

Upload file  
→ API lưu file  
→ tạo task  
→ worker đọc file  
→ extract text hoặc OCR nếu cần  
→ preprocess text  
→ nhận diện topic  
→ build context  
→ gọi Gemini 1 lần  
→ validate  
→ lưu DB  
→ trả kết quả

## 5. Quy tắc OCR

OCR không chạy cho mọi loại tài liệu. Hệ thống chỉ OCR khi thật sự cần.

### Không OCR
- TXT: decode text trực tiếp.
- DOCX: đọc bằng `python-docx`.
- PDF có text layer: đọc bằng `pypdf`.

### Chỉ OCR khi
- PDF scan hoặc image-only PDF.
- Ảnh được upload trực tiếp.

### Auto OCR
- Nếu cần OCR và có OCR.Space key/quota, hệ thống có thể thử OCR.Space trước với ảnh hoặc scan nhỏ.
- Nếu OCR.Space lỗi, hết quota hoặc timeout, hệ thống fallback sang local Tesseract khi local OCR khả dụng.
- PDF scan lớn ưu tiên dùng local OCR.
- Với tài liệu nhạy cảm, nên cấu hình dùng local OCR để tránh gửi file ra dịch vụ cloud bên ngoài.

## 6. Gemini dùng để làm gì

Gemini trong dự án này chỉ dùng cho bước sinh câu hỏi.

Cụ thể:
- Dùng Gemini để sinh câu hỏi trắc nghiệm từ context đã chuẩn bị.
- Không dùng Gemini để OCR.
- Không dùng Gemini để detect topic.
- Không dùng Gemini để validate câu hỏi.
- Mỗi task mặc định chỉ gọi Gemini 1 lần.

## 7. TopicResolver hoạt động ra sao

`TopicResolver` là thành phần local dùng để nhận diện môn/chủ đề của tài liệu trước khi sinh câu hỏi.

Nó kết hợp nhiều tín hiệu như:
- topic người dùng nhập
- tiêu đề hoặc phần đầu tài liệu
- tên file
- heading trong nội dung
- catalog topic và keyword nội bộ

Kết quả của `TopicResolver` được dùng để:
- xác định topic phù hợp cho task
- hỗ trợ build prompt tốt hơn
- giảm phụ thuộc vào Gemini cho bước phân loại chủ đề

## 8. Giới hạn hiện tại

Một số giới hạn hiện có của hệ thống:
- OCR với file scan lớn vẫn tốn CPU và RAM.
- OCR.Space free không phù hợp cho PDF nhiều trang.
- OCR tiếng Việt còn phụ thuộc mạnh vào chất lượng scan.
- Câu hỏi sinh ra vẫn cần review trước khi dùng chính thức.
- Chưa có RAG hoặc vector search.
- Chưa có cache OCR text hoàn chỉnh nếu chưa triển khai.
## 9. Cài đặt nhanh và xem log

Chạy dự án nhanh bằng Docker:

```powershell
cd "D:\EPU\A-NCKH\dự án\ai-service"

docker compose up -d --build api

docker compose down
docker compose up -d --build postgres rabbitmq api worker
docker compose ps
```


Test nhanh qua Swagger:

1. Mở Swagger tại `http://localhost:8000/api/docs`.
2. Dùng API `POST /api/v1/ai/documents/upload` để upload file test và tạo task.
3. Sau khi gọi API thành công, copy giá trị `task_id` trong response.
4. Dùng API `GET /api/v1/ai/tasks/{task_id}/results`, dán `task_id` vừa copy để xem trạng thái và danh sách câu hỏi.
5. Nếu cần xem worker đang xử lý OCR hay text layer, dùng log worker và có thể lọc theo `task_id`:

```powershell
docker compose logs worker | Select-String "<task_id>|OCR decision|OCR provider|OCR.Space|Starting OCR|OCR completed|PDF text|text layer|Worker reading document"
```