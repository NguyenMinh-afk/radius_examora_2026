# Database Schema Documentation

## Tổng quan hệ thống

Hệ thống CSDL được thiết kế cho đề tài: **"NGHIÊN CỨU PHÁT TRIỂN PHẦN MỀM ĐA NỀN TẢNG TÍCH HỢP AI ĐỂ TẠO SINH VÀ QUẢN LÝ NGÂN HÀNG ĐỀ THI TRẮC NGHIỆM"**

## Kiến trúc hệ thống

```
┌─────────────┐
│  Frontend   │ 
│(Examora UI) │
└──────┬──────┘
       │
       ↓
┌─────────────┐      ┌──────────────┐
│   Backend   │◄────►│  PostgreSQL  │
│  (Node.js)  │      │   Database   │
└──────┬──────┘      └──────────────┘
       │
       ↓
┌─────────────┐      ┌──────────────┐
│  RabbitMQ   │◄────►│   AI Models  │
│    Queue    │      │ (GPT/Gemini) │
└─────────────┘      └──────────────┘
```

## Cấu trúc Database

### 1. **User Management** (Quản lý người dùng)

#### Tables:
- `roles` - Vai trò hệ thống (Admin, Teacher, Student)
- `users` - Thông tin người dùng
- `user_profiles` - Thông tin mở rộng
- `oauth_providers` - Đăng nhập Google/Microsoft

**Chức năng:**
- Đăng ký, đăng nhập đa nền tảng
- Phân quyền rõ ràng
- OAuth2.0 integration

### 2. **Subject & Curriculum** (Môn học & Chương trình)

#### Tables:
- `subjects` - Môn học (Toán, Văn, Anh...)
- `chapters` - Chương/Bài học
- `knowledge_units` - Đơn vị kiến thức

**Chức năng:**
- Cấu trúc theo CT2018
- Phân loại theo lớp 10, 11, 12
- Mapping chương trình chuẩn

### 3. **Question Bank** (Ngân hàng câu hỏi)

#### Tables:
- `questions` - Câu hỏi trắc nghiệm
- `question_tags` - Thẻ phân loại
- `question_tag_relations` - Liên kết nhiều-nhiều
- `question_versions` - Lịch sử chỉnh sửa
- `question_statistics` - Thống kê sử dụng

**Đặc điểm:**
- Hỗ trợ nhiều loại câu hỏi (4 đáp án, Đúng/Sai, Điền khuyết, Ghép đôi)
- Độ khó: Easy, Medium, Hard, Very Hard
- Lưu trữ LaTeX cho công thức toán
- Hỗ trợ hình ảnh, audio, video
- Phân tích độ khó dựa trên kết quả học sinh

### 4. **AI Generation System** (Hệ thống AI)

#### Tables:
- `ai_generation_requests` - Yêu cầu tạo câu hỏi
- `ai_generation_logs` - Lịch sử tạo câu hỏi
- `ai_models` - Cấu hình AI models

**Workflow:**
```
1. Teacher tạo request → 
2. Queue vào RabbitMQ → 
3. Worker xử lý với AI → 
4. Sinh câu hỏi → 
5. Lưu vào database → 
6. Notify teacher
```

**Tính năng:**
- Tích hợp OpenAI GPT, Google Gemini
- Theo dõi chi phí API
- Quality score tự động
- Batch generation

### 5. **Exam Management** (Quản lý đề thi)

#### Tables:
- `exams` - Đề thi/bài kiểm tra
- `exam_questions` - Câu hỏi trong đề
- `exam_assignments` - Giao bài cho lớp
- `student_assignments` - Phân công học sinh
- `exam_submissions` - Bài làm của học sinh
- `submission_answers` - Chi tiết câu trả lời

**Chức năng:**
- Tạo đề thi từ ngân hàng câu hỏi
- Trộn câu hỏi/đáp án
- Giới hạn thời gian
- Cho phép làm lại nhiều lần
- Tự động chấm điểm
- AI proctoring (giám sát)

### 6. **Class & Course** (Lớp học)

#### Tables:
- `classes` - Lớp học
- `class_members` - Thành viên lớp

**Chức năng:**
- Tạo lớp với class code
- Học sinh tự tham gia hoặc được mời
- Quản lý theo năm học, học kỳ

### 7. **Analytics & Progress** (Phân tích & Tiến độ)

#### Tables:
- `student_progress` - Tiến độ học sinh
- `question_statistics` - Thống kê câu hỏi
- `system_analytics` - Thống kê hệ thống

**Metrics:**
- Accuracy rate (Tỷ lệ đúng)
- Difficulty index (Chỉ số độ khó thực tế)
- Discrimination index (Phân biệt học sinh giỏi/yếu)
- Strengths/Weaknesses (Điểm mạnh/yếu)

### 8. **RabbitMQ Integration**

#### Tables:
- `queue_jobs` - Theo dõi queue jobs

**Job Types:**
- `ai_generation` - Tạo câu hỏi AI
- `exam_grading` - Chấm bài tự động
- `analytics` - Tính toán phân tích
- `notification` - Gửi thông báo

### 9. **Notifications**

#### Tables:
- `notifications` - Thông báo người dùng

**Types:**
- Assignment notification
- Grade notification
- AI generation complete
- System announcement

### 10. **System Configuration**

#### Tables:
- `system_settings` - Cấu hình hệ thống

## Cài đặt

### 1. Tạo database

```bash
psql -U postgres
CREATE DATABASE exam_bank_db;
\c exam_bank_db
```

### 2. Import schema

```bash
psql -U postgres -d exam_bank_db -f schema.sql
```

### 3. Kiểm tra

```sql
-- Kiểm tra các bảng
\dt

-- Kiểm tra roles
SELECT * FROM roles;

-- Kiểm tra subjects
SELECT * FROM subjects;
```

## Security Features

1. **Password Hashing**: Sử dụng bcrypt
2. **UUID**: Primary key cho user-related tables
3. **Soft Delete**: Giữ dữ liệu với `is_active` flag
4. **Audit Trail**: Timestamps trên mọi bảng
5. **Foreign Key Constraints**: Đảm bảo tính toàn vẹn dữ liệu

## Performance Optimization

1. **Indexes**: Đầy đủ indexes cho các trường thường query
2. **JSONB**: Lưu trữ flexible data
3. **Views**: Pre-computed queries
4. **Partitioning**: Có thể partition theo date cho analytics tables

## Backup Strategy

```bash
# Daily backup
pg_dump -U postgres exam_bank_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres exam_bank_db < backup_20260104.sql
```

## API Integration Points

### Backend cần implement:

1. **User APIs**
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/oauth/google
   - POST /api/auth/oauth/microsoft

2. **Question APIs**
   - GET /api/questions
   - POST /api/questions
   - POST /api/questions/generate-ai
   - PUT /api/questions/:id
   - DELETE /api/questions/:id

3. **Exam APIs**
   - GET /api/exams
   - POST /api/exams
   - POST /api/exams/:id/assign
   - POST /api/exams/:id/submit

4. **Class APIs**
   - GET /api/classes
   - POST /api/classes
   - POST /api/classes/:id/join
   - GET /api/classes/:id/members

5. **Analytics APIs**
   - GET /api/analytics/student/:id
   - GET /api/analytics/class/:id
   - GET /api/analytics/questions

## RabbitMQ Queues

1. **ai-generation-queue**
   - Priority: High
   - Consumers: AI workers

2. **grading-queue**
   - Priority: Medium
   - Consumers: Grading workers

3. **notification-queue**
   - Priority: Low
   - Consumers: Notification workers

## Monitoring & Logging

- Theo dõi AI generation costs
- Track queue job failures
- Monitor database performance
- Log user activities

## Future Enhancements

1. **Real-time collaboration**: WebSocket integration
2. **Advanced AI**: Fine-tuned models
3. **Blockchain**: Certificate verification
4. **Mobile app**: React Native
5. **Video lessons**: Streaming integration

## Support

For questions or issues, contact: admin@examora.vn
