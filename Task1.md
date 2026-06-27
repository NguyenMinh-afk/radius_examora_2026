Đồng ý. Sau khi xem toàn bộ **schema**, **file tree**, **kiến trúc microservice** và prompt Student của bạn thì mình sẽ **không làm kiểu chung chung** nữa.

Teacher Panel phải bám đúng **service** của Project_Exmora, không để AI tự sinh thêm service hay model. Kiến trúc sẽ dựa trên chính project của bạn.

---

# I. KIẾN TRÚC NGHIỆP VỤ TEACHER THEO SCHEMA THẬT

Teacher không làm việc trực tiếp với Student.

Luồng nghiệp vụ chuẩn là:

```
user_db.users
user_db.user_profiles (chứa teacher_code, teacher_department, teacher_specialization)
        │
        ▼
course_db.courses
        │
        ▼
exam_db.classes
        │
        ▼
exam_db.class_members
        │
        ▼
question_db.questions
        │
        ▼
exam_db.exams
        │
        ▼
exam_db.exam_assignments
        │
        ▼
exam_db.student_assignments
        │
        ▼
exam_db.attempts
        │
        ▼
exam_db.attempt_answers
```

Teacher quản lý:

* Course
* Class
* Question Bank
* Exam
* Assignment
* Student trong lớp
* Result
* Notification

Không được phép tạo logic khác schema.

---

# II. PHÂN CHIA ĐÚNG MICROSERVICE

Đây là phần AI thường code sai nhất.

## User_Service

Chỉ xử lý

```
Teacher Profile
User Profile
Authentication
Avatar
Password
```

Không được viết

```
Exam
Question
Assignment
Class
```

ở đây.

---

## Question_Service

Chỉ xử lý

```
Question Bank

Question CRUD

Question Import

Question AI Generate

Question Tag

Question Difficulty

Question Search
```

Không được xử lý

```
Exam
Assignment
Result
```

---

## Exam_Service

Đây là service lớn nhất.

Chỉ xử lý

```
Classes

Class Members

Exam

Exam Assignment

Student Assignment

Attempt

Result

Schedule
```

---

## AI_Generation_Service

Chỉ

```
Generate Question

Generate Exam

Generate Explanation

Generate Bloom Level

Generate Difficulty
```

Không được CRUD Question.

---

## Notification_Service

```
Announcement

Reminder

Exam Open

Exam Closed

Grade Published
```

---

## API Gateway

Chỉ routing.

Không viết business logic.

---

# III. SIDEBAR GIẢNG VIÊN CHUẨN

Không nên để kiểu Admin.

Teacher sẽ có:

```
Dashboard

Khóa học

Lớp học

Ngân hàng câu hỏi

Đề thi

Bài thi đã giao

Lịch thi

Kết quả

Thông báo

Hồ sơ

Cài đặt

Đăng xuất
```

---

# IV. ROUTE STRUCTURE

```
/teacher/dashboard

/teacher/courses

/teacher/courses/:courseId

/teacher/classes

/teacher/classes/:classId

/teacher/questions

/teacher/questions/create

/teacher/questions/:id

/teacher/exams

/teacher/exams/create

/teacher/exams/:examId

/teacher/assignments

/teacher/assignments/create

/teacher/assignments/:assignmentId

/teacher/schedule

/teacher/results

/teacher/results/:attemptId

/teacher/notifications

/teacher/profile

/teacher/settings
```

---

# V. DASHBOARD TEACHER

Dashboard phải trả lời ngay:

```
Tôi đang dạy bao nhiêu lớp?

Có bao nhiêu sinh viên?

Có bao nhiêu đề thi?

Có bao nhiêu bài thi đang mở?

Có bao nhiêu bài chưa chấm?

Có bao nhiêu thông báo?
```

---

Hero

```
Xin chào, Nguyễn Văn A.

Bạn đang quản lý:

8 lớp học

356 sinh viên

12 đề thi

5 bài thi đang mở

Có 8 bài làm cần xem.
```

CTA

```
+ Tạo đề thi

+ Giao bài

+ Tạo câu hỏi
```

---

Overview

```
Classes

Students

Exams

Assignments
```

---

Hàng dưới

```
Upcoming Assignments

Recent Results

Recent Notifications

My Classes
```

---

# VI. PAGE KHÓA HỌC

Nguồn

```
course_db.courses
```

Card

```
Tên môn

Mã môn

Số lớp

Số đề

Số câu hỏi

Nút

Xem

Quản lý
```

---

# VII. PAGE LỚP HỌC

Nguồn

```
exam_db.classes
```

Join

```
courses

teacher

class_members
```

Card

```
Tên lớp

Mã lớp

Môn học

Học kỳ

Năm học

Số sinh viên

Số bài thi

Đang mở

Điểm TB

Action
```

---

Chi tiết lớp

```
Header

Thông tin lớp

Tabs

Sinh viên

Bài thi

Kết quả

Thông báo
```

---

# VIII. PAGE QUESTION BANK

Nguồn

```
question_db.questions

Join:
- course_db.courses (theo questions.course_id)
- course_db.chapters (theo questions.chapter_id)
```

Hiển thị

```
Question

Difficulty  (questions.difficulty)

Bloom        (questions.bloom_level)

Topic        (course_db.chapters.name, theo questions.chapter_id)

Course       (course_db.courses.name)

Status       (questions.is_active)

CreatedAt
```

Filter

```
Course

Topic

Difficulty

Bloom

Question Type

Search
```

Actions

```
Create

Edit

Delete

Preview

Duplicate

AI Generate
```

---

# IX. PAGE ĐỀ THI

Nguồn

```
exam_db.exams
```

Card

```
Tên đề

Môn học

Số câu

Điểm

Thời gian

Passing Score

CreatedAt

Published
```

Action

```
Edit

Preview

Assign

Delete
```

---

# X. PAGE GIAO BÀI

Nguồn

```
exam_db.exam_assignments

Join:
- exam_db.exams (theo exam_assignments.exam_id)
- exam_db.classes (theo exam_assignments.class_id)
- user_db.users (teacher, theo classes.teacher_id)
```

Hiển thị

```
Tên Assignment

Exam

Class

Open Time

Close Time

Max Attempts       (exam_assignments.max_attempts)

Student Assigned

Submitted

Graded
```

Action

```
View

Edit

Close

Delete
```

---

# XI. PAGE KẾT QUẢ

Nguồn

```
exam_db.attempts
```

Join

```
Student

Assignment

Exam

Class
```

Hiển thị

```
Sinh viên

Lớp

Đề

Điểm

%

Thời gian

Attempt

Status
```

Filter

```
Class

Assignment

Student

Status

Score
```

---

# XII. PAGE THÔNG BÁO

Nguồn

```
notification_db.notifications
```

Teacher có thể

```
Tạo thông báo

Gửi toàn lớp

Gửi nhiều lớp

Gửi theo Assignment
```

---

# XIII. DTO BACKEND CHUẨN

## Dashboard

```
GET /api/teacher/dashboard
```

```
teacher

overview

recentAssignments

recentResults

myClasses

notifications
```

Overview

```
classCount

studentCount

examCount

assignmentCount

openAssignments

pendingGrades
```

---

## Classes

```
GET /teacher/classes
```

```
classId

className

classCode

courseName

semester

academicYear

studentCount

assignmentCount

averageScore

teacherName
```

---

## Questions

```
GET /teacher/questions
```

```
questionId

content

difficulty        (questions.difficulty)

bloom            (questions.bloom_level)

topic            (course_db.chapters.name, theo questions.chapter_id)

courseId         (questions.course_id)

courseName       (course_db.courses.name)

status           (questions.is_active)
```

---

## Exams

```
GET /teacher/exams
```

```
examId

title

courseName

questionCount

duration

passingScore

published
```

---

## Assignments

```
GET /teacher/assignments
```

```
assignmentId

title

examName

className

startTime

endTime

maxAttempts       (exam_assignments.max_attempts)

studentAssigned

submitted

graded

status
```

---

## Results

```
GET /teacher/results
```

```
attemptId

studentName

className

examName

score

percentage

submittedAt

status
```

---

# XIV. COMPONENT REACT

```
TeacherSidebar

TeacherHeader

TeacherHero

TeacherOverviewCards

CourseCard

ClassCard

QuestionCard

ExamCard

AssignmentCard

ResultCard

NotificationCard

StatusBadge

EmptyState

SearchBar

FilterBar
```

---

# XV. CẤU TRÚC FILE REACT

Theo đúng project của bạn (`frontend/src`), không tạo cấu trúc mới:

```
frontend/src/
├── api
│   └── axios
│       └── Teacher.ts                // API Teacher
├── components
│   └── teacher
│       ├── TeacherSidebar.tsx
│       ├── TeacherHeader.tsx
│       ├── DashboardHero.tsx
│       ├── DashboardOverviewStats.tsx
│       ├── MyClassesCard.tsx
│       ├── RecentAssignmentsCard.tsx
│       ├── RecentResultsCard.tsx
│       ├── NotificationCard.tsx
│       ├── CourseCard.tsx
│       ├── ClassCard.tsx
│       ├── QuestionCard.tsx
│       ├── ExamCard.tsx
│       ├── AssignmentCard.tsx
│       ├── ResultCard.tsx
│       └── StatusBadge.tsx
├── pages
│   └── Dashboard
│       └── Teacher
│           ├── TeacherDashboard.tsx
│           ├── TeacherCoursesPage.tsx
│           ├── TeacherClassesPage.tsx
│           ├── TeacherClassDetailPage.tsx
│           ├── TeacherQuestionsPage.tsx
│           ├── TeacherExamsPage.tsx
│           ├── TeacherAssignmentsPage.tsx
│           ├── TeacherResultsPage.tsx
│           ├── TeacherNotificationsPage.tsx
│           ├── TeacherProfilePage.tsx
│           └── TeacherSettingsPage.tsx
├── services
│   └── teacherApi.ts
├── types
│   └── teacher.types.ts
```

---

# XVI. QUY TẮC CODE BẮT BUỘC (Rất quan trọng)

Để AI không "phá" kiến trúc microservice của **Project_Exmora**, cần bổ sung các ràng buộc sau vào prompt:

1. **Không tạo service mới** ngoài các service hiện có:

   * `User_Service`
   * `Question_Service`
   * `Exam_Service`
   * `Notification_Service`
   * `AI_Generation_Service`
   * `API_Gateway_Service`

2. **Không đổi tên thư mục** hoặc cấu trúc trong `frontend/src`; chỉ bổ sung file theo đúng cây thư mục hiện tại.

3. **Không tạo model, bảng hoặc schema mới**. Chỉ sử dụng các model đã có trong:

   * `User_Service/src/models`
   * `Exam_Service/src/models`
   * `Question_Service/src/models`
   * `Notification_Service/src/models`

4. **Controller → Service → Model** phải đúng service sở hữu dữ liệu:

   * `Question_Controller` chỉ gọi `Question_Service`.
   * `Student/Teacher Controller` trong `Exam_Service` chỉ xử lý Class, Exam, Assignment, Attempt và Result.
   * Không gọi trực tiếp model của service khác.

5. **Trao đổi giữa các service** phải thông qua:

   * API Gateway (HTTP)
   * RabbitMQ/Event nếu là tác vụ bất đồng bộ

   Không import model hoặc Sequelize instance từ service khác.

6. **Frontend không tự join dữ liệu**. Backend phải trả về DTO hoàn chỉnh như đã định nghĩa.

7. **Không dùng mock data** trong code cuối cùng. Chỉ tạo lớp API (`teacherApi.ts`) với interface/DTO đúng để sau này kết nối trực tiếp tới backend. ( Câu này bị lỗi này kết nối với dữ liệu thật luôn nhé chứ không phải này mới kết nối)


