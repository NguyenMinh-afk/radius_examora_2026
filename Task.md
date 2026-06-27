I. KIẾN TRÚC NGHIỆP VỤ STUDENT THEO SCHEMA THẬT

Trước khi vào UI, chốt luôn luồng dữ liệu thật trong hệ thống Exmora:

user_db.users / user_db.user_profiles
        ↓
exam_db.classes (lớp do giáo viên tạo)
        ↓
exam_db.class_members (sinh viên tham gia lớp)
        ↓
exam_db.exam_assignments (giao bài cho lớp)
        ↓
exam_db.student_assignments (ánh xạ bài giao → sinh viên cụ thể)
        ↓
exam_db.attempts (mỗi lần sinh viên làm bài)
        ↓
exam_db.attempt_answers (đáp án từng câu trong attempt)

Nghĩa là với sinh viên:
- Lớp học của tôi = exam_db.class_members → exam_db.classes
- Bài thi của tôi = exam_db.student_assignments → exam_db.exam_assignments → exam_db.exams
- Kết quả của tôi = exam_db.attempts
- Thông báo của tôi = notification_db.notifications
II. SIDEBAR SINH VIÊN CHUẨN THEO SCHEMA

Sau khi bám đúng schema, mình khuyên sidebar sinh viên không nên để “Môn học” là menu chính nữa, mà nên để “Lớp học của tôi”. Vì sinh viên được giao bài thông qua lớp, không phải trực tiếp qua course.

Sidebar chuẩn cho Student
Menu chính
Trang chủ
Lớp học của tôi
Bài thi
Lịch thi
Kết quả
Thông báo
Hồ sơ cá nhân
Cài đặt
Đăng xuất
Ý nghĩa từng mục
1) Trang chủ

Tổng quan cá nhân:

số lớp đang tham gia
số bài thi sắp tới
bài đang mở
điểm trung bình
thông báo mới
kết quả gần đây
2) Lớp học của tôi

Lấy từ:

exam_db.class_members
exam_db.classes
course_db.courses
user_db.users (teacher)
3) Bài thi

Lấy từ:

exam_db.student_assignments
exam_db.exam_assignments
exam_db.exams
exam_db.classes
course_db.courses
4) Lịch thi

Lấy từ exam_assignments theo thời gian mở/đóng.

5) Kết quả

Lấy từ exam_db.attempts.

6) Thông báo

Lấy từ notification_db.notifications.

7) Hồ sơ cá nhân

Lấy từ:

user_db.users
user_db.user_profiles
III. CẤU TRÚC ROUTE SINH VIÊN

Đây là route structure hợp lý để code React.

const studentRoutes = [
  { path: "/student/dashboard", label: "Trang chủ" },
  { path: "/student/classes", label: "Lớp học của tôi" },
  { path: "/student/classes/:classId", label: "Chi tiết lớp học" },
  { path: "/student/assignments", label: "Bài thi" },
  { path: "/student/assignments/:assignmentId", label: "Chi tiết bài thi" },
  { path: "/student/assignments/:assignmentId/start", label: "Làm bài thi" },
  { path: "/student/schedule", label: "Lịch thi" },
  { path: "/student/results", label: "Kết quả" },
  { path: "/student/results/:attemptId", label: "Chi tiết kết quả" },
  { path: "/student/notifications", label: "Thông báo" },
  { path: "/student/profile", label: "Hồ sơ cá nhân" },
  { path: "/student/settings", label: "Cài đặt" }
];
IV. DASHBOARD CONTENT BÁM DỮ LIỆU THẬT
1) Dashboard phải trả lời được 6 câu hỏi

Khi sinh viên mở dashboard, họ cần biết ngay:

Tôi đang học bao nhiêu lớp?
Tôi có bao nhiêu bài thi sắp tới?
Có bài nào đang mở để vào làm ngay không?
Điểm trung bình hiện tại là bao nhiêu?
Kết quả gần đây ra sao?
Có thông báo mới / deadline nào gấp không?
2) Bố cục dashboard đề xuất
Hàng 1 – Hero card

Xin chào, [Tên sinh viên]!
Bạn đang tham gia X lớp học và có Y bài thi sắp tới.

Thông tin tóm tắt:

Có N bài thi đang mở
Lịch thi gần nhất: [Tên assignment] – [Tên lớp] – [thời gian]
Điểm trung bình hiện tại: 8.2

CTA:

Vào bài thi
Xem lịch thi
Hàng 2 – 4 thẻ overview
Lớp học đang tham gia
Bài thi sắp tới
Bài thi đang mở
Điểm trung bình
Hàng 3 – 2 cột
Cột trái: Bài thi gần nhất / sắp tới

Hiển thị assignment thực sự của sinh viên.

Cột phải: Thông báo mới

Hiển thị notification cá nhân.

Hàng 4 – 2 cột
Cột trái: Kết quả gần đây

Dựa trên attempts.

Cột phải: Lớp học của tôi

Danh sách vài lớp gần nhất hoặc progress theo lớp.

3) Dashboard sections chi tiết
A. HERO CARD
Nội dung nên hiển thị
Tên sinh viên (users.full_name)
số lớp đang học
số bài thi sắp tới
số bài đang mở
điểm trung bình
lịch thi gần nhất
Ví dụ text thực tế:
Xin chào, Nguyễn Đức Minh!
Bạn đang tham gia 3 lớp học và có 2 bài thi sắp tới trong tuần này.

- 1 bài thi đang mở để làm ngay
- Điểm trung bình hiện tại: 8.2
- Lịch thi gần nhất: Quiz Chương 3 – Lớp Cơ sở dữ liệu D22CQCN01 – 14:00, 24/06/2026
B. OVERVIEW STATS
4 card overview nên là:
Lớp học của tôi
Bài thi sắp tới
Bài thi đang mở
Điểm trung bình
Ví dụ:
Lớp học của tôi: 3
Bài thi sắp tới: 2
Bài thi đang mở: 1
Điểm trung bình: 8.2
C. CARD “BÀI THI GẦN NHẤT”

Danh sách từ student_assignments + exam_assignments.

Mỗi item phải có:
tên bài thi / assignment title
lớp học
môn học
giảng viên
thời gian mở / đóng
trạng thái
nút hành động
Ví dụ item:
Quiz Chương 3
Lớp: Cơ sở dữ liệu - D22CQCN01
Giảng viên: Nguyễn Văn A
Mở: 24/06/2026 14:00
Đóng: 24/06/2026 15:00
Trạng thái: Sắp diễn ra
[ Xem chi tiết ]
D. CARD “THÔNG BÁO MỚI”

Từ notification_db.notifications.

Nên hiển thị:
title
message rút gọn
thời gian
trạng thái đã đọc/chưa đọc
E. CARD “KẾT QUẢ GẦN ĐÂY”

Từ attempts.

Mỗi item:
tên bài thi
lớp
điểm
số đúng / sai
ngày nộp
nút xem chi tiết
F. CARD “LỚP HỌC CỦA TÔI”

Hiển thị 3–4 lớp sinh viên đang tham gia:

tên lớp
môn học
giảng viên
số bài thi đã giao
số bài đã hoàn thành
V. PAGE “LỚP HỌC CỦA TÔI” – THIẾT KẾ CHUẨN

Trang này cực quan trọng vì nó là cầu nối giữa course ↔ class ↔ assignment.

1) Mục tiêu trang

Cho sinh viên xem:

mình đang thuộc những lớp nào
lớp đó của môn nào
giảng viên nào phụ trách
trong lớp có bao nhiêu bài thi
đã hoàn thành bao nhiêu bài
2) Nguồn dữ liệu

Lấy từ:

exam_db.class_members
exam_db.classes
course_db.courses
user_db.users (teacher)
3) Bố cục trang
Header
Tiêu đề: Lớp học của tôi
Mô tả: Xem danh sách lớp học, giảng viên phụ trách và các bài thi được giao trong từng lớp.
Thanh filter/search
tìm theo tên lớp / mã lớp / tên môn
filter theo học kỳ / năm học / trạng thái lớp
Grid danh sách lớp

Mỗi card lớp hiển thị:

Thông tin chính
Tên lớp (classes.name)
Mã lớp (classes.class_code)
Môn học (courses.name)
Giảng viên (teacher.full_name)
Học kỳ (classes.semester)
Năm học (classes.academic_year)
Thống kê trong card
số bài thi đã giao
số bài đã hoàn thành
số bài đang mở
điểm trung bình trong lớp (nếu muốn)
Action
Xem lớp
Xem bài thi
4) Card class mẫu
Cơ sở dữ liệu - D22CQCN01
Mã lớp: CSDL-D22-01
Giảng viên: Nguyễn Văn A
Học kỳ: HK1 | Năm học: 2025-2026

Bài thi đã giao: 5
Đã hoàn thành: 3
Đang mở: 1

[ Xem lớp ]   [ Xem bài thi ]
5) Trang chi tiết lớp học
Route

/student/classes/:classId

Nội dung đầu trang
tên lớp
mã lớp
môn học
giảng viên
học kỳ / năm học
số bài thi
số bài đã hoàn thành
Các tab trong chi tiết lớp:
Tab 1 – Bài thi của lớp

Danh sách assignment của lớp mà sinh viên được giao.

Tab 2 – Tiến độ
số bài hoàn thành
điểm trung bình
lịch sử làm bài
Tab 3 – Thông báo

Thông báo liên quan đến lớp/bài thi

VI. PAGE “BÀI THI” LẤY TỪ student_assignments

Đây là page quan trọng nhất của student panel.

1) Mục tiêu

Hiển thị chỉ các bài thi được giao cho sinh viên đó, chứ không hiển thị tất cả exam trong hệ thống.

2) Nguồn dữ liệu
Bảng chính:
exam_db.student_assignments
Join thêm:
exam_db.exam_assignments
exam_db.exams
exam_db.classes
course_db.courses
user_db.users (teacher)
exam_db.attempts (nếu cần trạng thái đã làm)
3) Bố cục trang “Bài thi”
Header
tiêu đề: Bài thi
mô tả: Theo dõi tất cả bài thi được giao cho bạn từ các lớp học.
Filter tabs
Tất cả
Đang mở
Sắp diễn ra
Đã nộp
Quá hạn
Search / filter nâng cao
theo lớp
theo môn học
theo giảng viên
theo trạng thái
4) Mỗi item bài thi cần hiển thị gì?
Khối chính
exam_assignments.title hoặc exams.title
courses.name
classes.name
teacher.full_name
start_time
end_time
student_assignments.status
attempts_used / max_attempts
Nếu đã làm:
điểm gần nhất
ngày nộp
trạng thái đã nộp / đã chấm
5) Ví dụ item bài thi
Quiz Chương 3
Môn học: Cơ sở dữ liệu
Lớp: D22CQCN01
Giảng viên: Nguyễn Văn A
Thời gian mở: 24/06/2026 14:00
Thời gian đóng: 24/06/2026 15:00
Số lần làm: 0/1
Trạng thái: Sắp diễn ra

[ Xem chi tiết ]
Nếu đang mở:
Quiz React nâng cao
Môn học: Phát triển ứng dụng Web
Lớp: WEB-D22-01
Giảng viên: Trần Thị B
Thời gian mở: 21/06/2026 08:00
Thời gian đóng: 21/06/2026 23:59
Số lần làm: 0/1
Trạng thái: Đang mở

[ Vào thi ]
Nếu đã nộp:
Kiểm tra Chương 2
Môn học: Cơ sở dữ liệu
Lớp: D22CQCN01
Giảng viên: Nguyễn Văn A
Điểm: 8.5
Đã nộp lúc: 18/06/2026 09:15
Trạng thái: Đã nộp

[ Xem kết quả ]
6) Trạng thái bài thi nên chuẩn hóa như sau

Đây là cái bạn nên xử lý ở frontend hoặc backend DTO.

Trạng thái hiển thị cho student:
Đang mở: current time nằm giữa start_time và end_time, chưa hết số lần làm
Sắp diễn ra: current time < start_time
Đã nộp: đã có attempt submitted/graded
Quá hạn: current time > end_time và chưa nộp
Đã hết lượt: attempts_used >= max_attempts
VII. MAPPING FIELD CỤ THỂ TỪ SCHEMA → UI

Đây là phần quan trọng nhất. Mình sẽ map theo từng màn.

A. STUDENT PROFILE / HEADER
Nguồn:
user_db.users
user_db.user_profiles
UI field	Bảng	Cột
studentId	users.id
fullName	users.full_name
email	users.email
avatar	users.avatar_url
isActive	users.is_active
studentCode	user_profiles.student_code
classCodeProfile	user_profiles.class_code
schoolName	user_profiles.school_name

B. “LỚP HỌC CỦA TÔI”
Nguồn chính:
exam_db.class_members
exam_db.classes
course_db.courses
user_db.users (teacher)
UI field	Bảng	Cột
classId	classes.id
className	classes.name
classCode	classes.class_code
courseId	classes.course_id
courseName	courses.name
teacherId	classes.teacher_id
teacherName	users.full_name
yearLevel	classes.year_level
academicYear	classes.academic_year
semester	classes.semester
isActive	classes.is_active
joinedAt	class_members.joined_at
Field tổng hợp nên tính thêm:
UI field	Logic
totalAssignments	count exam_assignments theo class_id
completedAssignments	count assignments mà student có attempt submitted/graded
openAssignments	count assignment đang mở
upcomingAssignments	count assignment sắp diễn ra
C. “BÀI THI”
Nguồn chính:
exam_db.student_assignments
exam_db.exam_assignments
exam_db.exams
exam_db.classes
course_db.courses
user_db.users (teacher)
exam_db.attempts

UI field	Bảng	Cột
studentAssignmentId	student_assignments.id
assignmentId	student_assignments.assignment_id
studentId	student_assignments.student_id
assignmentStatusRaw	student_assignments.status
attemptsUsed	student_assignments.attempts_used
assignmentTitle	exam_assignments.title
instructions	exam_assignments.instructions
startTime	exam_assignments.start_time
endTime	exam_assignments.end_time
maxAttempts	exam_assignments.max_attempts
examId	exam_assignments.exam_id
classId	exam_assignments.class_id
examTitle	exams.title
examDescription	exams.description
examDuration	exams.duration
totalPoints	exams.total_points
passingScore	exams.passing_score
className	classes.name
classCode	classes.class_code
courseName	courses.name
teacherName	users.full_name (join classes.teacher_id)
Field tính toán thêm cho UI:
UI field	Logic
displayTitle	ưu tiên exam_assignments.title, fallback exams.title
status	derive từ start/end/attempt/submission
latestScore	lấy attempt mới nhất nếu có
latestSubmittedAt	lấy từ attempt mới nhất
canStart	status = đang mở && attemptsUsed < maxAttempts
canViewResult	có attempt submitted/graded
D. “KẾT QUẢ”
Nguồn:
exam_db.attempts
exam_db.exams
exam_db.exam_assignments
exam_db.classes
course_db.courses

user_db.users (teacher, qua classes.teacher_id)
UI field	Bảng	Cột
attemptId	attempts	attempt_id
examId	attempts	exam_id
studentId	attempts	student_id
assignmentId	attempts	assignment_id
attemptNumber	attempts	attempt_number
startedAt	attempts	started_at
submittedAt	attempts	submitted_at
timeTaken	attempts	time_taken
attemptStatus	attempts	status (giá trị: in_progress | submitted | graded | abandoned)
score	attempts	score
percentage	attempts	percentage
correctAnswers	attempts	correct_answers
wrongAnswers	attempts	wrong_answers
assignmentTitle	exam_assignments	title
className	classes.name (join qua exam_assignments.class_id)
courseName	courses.name (join qua exams.course_id)
teacherName	users.full_name (join classes.teacher_id → users.id)
E. “THÔNG BÁO”
Nguồn:
notification_db.notifications
UI field	Bảng	Cột
id	notifications	id
type	notifications	type
title	notifications	title
message	notifications	message
actionUrl	notifications	action_url
actionData	notifications	action_data
isRead	notifications	is_read
readAt	notifications	read_at
createdAt	notifications	created_at
VIII. DTO / API RESPONSE MÀ FRONTEND NÊN DÙNG

Mình khuyên bạn đừng để frontend join dữ liệu lung tung. Backend nên trả về DTO sạch cho từng màn. Dưới đây là cấu trúc mình đề xuất.

1) API Dashboard
GET /api/student/dashboard
Response đề xuất
{
  "student": {
    "id": "uuid-student",
    "fullName": "Nguyễn Đức Minh",
    "email": "minh@example.com",
    "avatarUrl": "https://...",
    "studentCode": "SV001"
  },
  "overview": {
    "classCount": 3,
    "upcomingAssignments": 2,
    "openAssignments": 1,
    "averageScore": 8.2
  },
  "nextAssignment": {
    "assignmentId": "a1",
    "title": "Quiz Chương 3",
    "className": "Cơ sở dữ liệu - D22CQCN01",
    "courseName": "Cơ sở dữ liệu",
    "teacherName": "Nguyễn Văn A",
    "startTime": "2026-06-24T14:00:00",
    "endTime": "2026-06-24T15:00:00",
    "status": "upcoming"
  },
  "upcomingAssignments": [
    {
      "assignmentId": "a1",
      "title": "Quiz Chương 3",
      "className": "Cơ sở dữ liệu - D22CQCN01",
      "courseName": "Cơ sở dữ liệu",
      "teacherName": "Nguyễn Văn A",
      "startTime": "2026-06-24T14:00:00",
      "endTime": "2026-06-24T15:00:00",
      "status": "upcoming",
      "attemptsUsed": 0,
      "max_attempts": 1
    }
  ],
  "recentResults": [
    {
      "attemptId": "at1",
      "assignmentId": "a2",
      "title": "Kiểm tra Chương 2",
      "className": "Cơ sở dữ liệu - D22CQCN01",
      "courseName": "Cơ sở dữ liệu",
      "score": 8.5,
      "percentage": 85,
      "correctAnswers": 17,
      "wrongAnswers": 3,
      "submittedAt": "2026-06-18T09:15:00"
    }
  ],
  "myClasses": [
    {
      "classId": "c1",
      "className": "Cơ sở dữ liệu - D22CQCN01",
      "classCode": "CSDL-D22-01",
      "courseName": "Cơ sở dữ liệu",
      "teacherName": "Nguyễn Văn A",
      "semester": "HK1",
      "academicYear": "2025-2026",
      "totalAssignments": 5,
      "completedAssignments": 3
    }
  ],
  "notifications": [
    {
      "id": "n1",
      "type": "assignment",
      "title": "Bài thi “Quiz React nâng cao” đã được mở.",
      "message": "Bạn có thể vào làm bài từ bây giờ.",
      "isRead": false,
      "createdAt": "2026-06-21T20:00:00"
    }
  ]
}
2) API “Lớp học của tôi”
GET /api/student/classes
[
  {
    "classId": "c1",
    "className": "Cơ sở dữ liệu - D22CQCN01",
    "classCode": "CSDL-D22-01",
    "courseId": 1,
    "courseName": "Cơ sở dữ liệu",
    "teacherId": "t1",
    "teacherName": "Nguyễn Văn A",
    "yearLevel": "2025",
    "semester": "HK1",
    "academicYear": "2025-2026",
    "isActive": true,
    "joinedAt": "2026-01-15T08:00:00",
    "stats": {
      "totalAssignments": 5,
      "completedAssignments": 3,
      "openAssignments": 1,
      "upcomingAssignments": 1,
      "averageScore": 8.2
    }
  }
]
3) API chi tiết lớp học
GET /api/student/classes/:classId
{
  "classInfo": {
    "classId": "c1",
    "className": "Cơ sở dữ liệu - D22CQCN01",
    "classCode": "CSDL-D22-01",
    "courseName": "Cơ sở dữ liệu",
    "teacherName": "Nguyễn Văn A",
    "semester": "HK1",
    "academicYear": "2025-2026"
  },
  "stats": {
    "totalAssignments": 5,
    "completedAssignments": 3,
    "openAssignments": 1,
    "upcomingAssignments": 1,
    "averageScore": 8.2
  },
  "assignments": [],
  "recentResults": [],
  "notifications": []
}
4) API “Bài thi của tôi”
GET /api/student/assignments
{
  "items": [
    {
      "studentAssignmentId": "sa1",
      "assignmentId": "a1",
      "title": "Quiz Chương 3",
      "courseName": "Cơ sở dữ liệu",
      "className": "Cơ sở dữ liệu - D22CQCN01",
      "classCode": "CSDL-D22-01",
      "teacherName": "Nguyễn Văn A",
      "instructions": "Đọc kỹ đề trước khi làm.",
      "startTime": "2026-06-24T14:00:00",
      "endTime": "2026-06-24T15:00:00",
      "duration": 60,
      "max_attempts": 1,
      "attemptsUsed": 0,
      "status": "upcoming",
      "latestAttempt": null
    },
    {
      "studentAssignmentId": "sa2",
      "assignmentId": "a2",
      "title": "Quiz React nâng cao",
      "courseName": "Phát triển ứng dụng Web",
      "className": "WEB-D22-01",
      "classCode": "WEB-D22-01",
      "teacherName": "Trần Thị B",
      "instructions": "Mỗi câu chỉ chọn 1 đáp án.",
      "startTime": "2026-06-21T08:00:00",
      "endTime": "2026-06-21T23:59:00",
      "duration": 30,
      "max_attempts": 1,
      "attemptsUsed": 0,
      "status": "open",
      "latestAttempt": null
    },
    {
      "studentAssignmentId": "sa3",
      "assignmentId": "a3",
      "title": "Kiểm tra Chương 2",
      "courseName": "Cơ sở dữ liệu",
      "className": "Cơ sở dữ liệu - D22CQCN01",
      "classCode": "CSDL-D22-01",
      "teacherName": "Nguyễn Văn A",
      "instructions": "Làm bài trong 45 phút.",
      "startTime": "2026-06-18T08:00:00",
      "endTime": "2026-06-18T09:00:00",
      "duration": 45,
      "max_attempts": 1,
      "attemptsUsed": 1,
      "status": "submitted",
      "latestAttempt": {
        "attemptId": "at3",
        "score": 8.5,
        "percentage": 85,
        "submittedAt": "2026-06-18T09:15:00"
      }
    }
  ],
  "summary": {
    "total": 10,
    "open": 1,
    "upcoming": 2,
    "submitted": 5,
    "expired": 2
  }
}
IX. THIẾT KẾ CHI TIẾT PAGE “LỚP HỌC CỦA TÔI”
1) Header trang

Lớp học của tôi
Theo dõi các lớp học bạn đang tham gia, giảng viên phụ trách và các bài thi được giao trong từng lớp.

Nút / filter:
ô tìm kiếm lớp
filter học kỳ
filter năm học
2) Grid card lớp
Mỗi card gồm 4 khối:
Khối 1 – thông tin lớp
Tên lớp
Mã lớp
Môn học
Khối 2 – giảng viên & học kỳ
Giảng viên
Học kỳ
Năm học
Khối 3 – thống kê nhanh
bài thi đã giao
bài đã hoàn thành
bài đang mở
Khối 4 – actions
Xem lớp
Xem bài thi
3) Text UI mẫu cho card lớp
Cơ sở dữ liệu - D22CQCN01
Mã lớp: CSDL-D22-01
Môn học: Cơ sở dữ liệu

Giảng viên: Nguyễn Văn A
Học kỳ: HK1
Năm học: 2025-2026

Bài thi đã giao: 5
Đã hoàn thành: 3
Đang mở: 1

[ Xem lớp ] [ Xem bài thi ]
X. THIẾT KẾ CHI TIẾT PAGE “BÀI THI”
1) Header

Bài thi của tôi
Theo dõi tất cả bài thi được giao từ các lớp học mà bạn đang tham gia.

2) Bộ tab trạng thái
Tất cả
Đang mở
Sắp diễn ra
Đã nộp
Quá hạn
3) Bộ lọc bổ sung
theo lớp học
theo môn học
theo giảng viên
theo thời gian
4) Layout card / list bài thi

Mỗi card bài thi gồm:

Dòng 1
tên bài thi
badge trạng thái
Dòng 2
môn học
lớp học
giảng viên
Dòng 3
mở lúc
đóng lúc
thời lượng
số lần làm
Dòng 4
nếu đã nộp: điểm + ngày nộp
nếu đang mở: nút “Vào thi”
nếu sắp diễn ra: “Xem chi tiết”
nếu quá hạn: “Đã quá hạn”
5) Text UI mẫu
Quiz React nâng cao
[ Đang mở ]

Môn học: Phát triển ứng dụng Web
Lớp: WEB-D22-01
Giảng viên: Trần Thị B

Mở lúc: 21/06/2026 08:00
Đóng lúc: 21/06/2026 23:59
Thời lượng: 30 phút
Số lần làm: 0/1

[ Vào thi ]
XI. PROMPT AI CODE MỚI – KHÔNG DÙNG MOCKDATA, BÁM SCHEMA THẬT

Dưới đây là prompt mới để bạn đưa thẳng cho AI code.
Prompt này đã sửa hoàn toàn theo schema thật của Exmora: student có class, assignment, result, notification, không còn kiểu dashboard “ảo” nữa.

PROMPT AI CODE – EXMORA STUDENT PANEL
Hãy thiết kế và code giao diện Student Panel cho hệ thống thi trắc nghiệm Exmora bằng React + Tailwind CSS, bám đúng nghiệp vụ và schema dữ liệu thật của hệ thống.

# 1. Mục tiêu
Tạo giao diện sinh viên cho hệ thống thi trắc nghiệm trực tuyến Exmora. Đây là student dashboard thật, không phải admin dashboard. Giao diện phải phản ánh đúng luồng dữ liệu:
- sinh viên tham gia lớp học
- giảng viên giao bài thi cho lớp
- sinh viên nhận assignment qua lớp
- sinh viên làm bài, nộp bài, xem kết quả

# 2. Bối cảnh dữ liệu / schema thật
Frontend cần bám theo các nhóm dữ liệu sau:

## User
- user_db.users
- user_db.user_profiles

## Class / membership
- exam_db.classes
- exam_db.class_members

## Course
- course_db.courses

## Assignment / exam
- exam_db.exams
- exam_db.exam_assignments
- exam_db.student_assignments

## Attempt / result
- exam_db.attempts
- exam_db.attempt_answers

## Notification
- notification_db.notifications

# 3. Sidebar sinh viên
Sidebar bên trái gồm:
1. Trang chủ
2. Lớp học của tôi
3. Bài thi
4. Lịch thi
5. Kết quả
6. Thông báo
7. Hồ sơ cá nhân
8. Cài đặt
9. Đăng xuất

Yêu cầu:
- dùng icon lucide-react
- item active có nền xanh nhạt và chữ xanh đậm
- bo góc mềm
- có logo EXMORA ở trên
- có footer chứa Profile / Settings / Logout nếu phù hợp

# 4. Các route cần hỗ trợ
- /student/dashboard
- /student/classes
- /student/classes/:classId
- /student/assignments
- /student/assignments/:assignmentId
- /student/schedule
- /student/results
- /student/results/:attemptId
- /student/notifications
- /student/profile
- /student/settings

# 5. Các API response mà frontend sẽ nhận
Frontend KHÔNG tự join bảng. Giả sử backend đã trả DTO hoàn chỉnh.

## 5.1 GET /api/student/dashboard
Response:
{
  "student": {
    "id": "uuid-student",
    "fullName": "Nguyễn Đức Minh",
    "email": "minh@example.com",
    "avatarUrl": "https://...",
    "studentCode": "SV001"
  },
  "overview": {
    "classCount": 3,
    "upcomingAssignments": 2,
    "openAssignments": 1,
    "averageScore": 8.2
  },
  "nextAssignment": {
    "assignmentId": "a1",
    "title": "Quiz Chương 3",
    "className": "Cơ sở dữ liệu - D22CQCN01",
    "courseName": "Cơ sở dữ liệu",
    "teacherName": "Nguyễn Văn A",
    "startTime": "2026-06-24T14:00:00",
    "endTime": "2026-06-24T15:00:00",
    "status": "upcoming"
  },
  "upcomingAssignments": [
    {
      "assignmentId": "a1",
      "title": "Quiz Chương 3",
      "className": "Cơ sở dữ liệu - D22CQCN01",
      "courseName": "Cơ sở dữ liệu",
      "teacherName": "Nguyễn Văn A",
      "startTime": "2026-06-24T14:00:00",
      "endTime": "2026-06-24T15:00:00",
      "status": "upcoming",
      "attemptsUsed": 0,
      "max_attempts": 1
    }
  ],
  "recentResults": [
    {
      "attemptId": "at1",
      "assignmentId": "a2",
      "title": "Kiểm tra Chương 2",
      "className": "Cơ sở dữ liệu - D22CQCN01",
      "courseName": "Cơ sở dữ liệu",
      "score": 8.5,
      "percentage": 85,
      "correctAnswers": 17,
      "wrongAnswers": 3,
      "submittedAt": "2026-06-18T09:15:00"
    }
  ],
  "myClasses": [
    {
      "classId": "c1",
      "className": "Cơ sở dữ liệu - D22CQCN01",
      "classCode": "CSDL-D22-01",
      "courseName": "Cơ sở dữ liệu",
      "teacherName": "Nguyễn Văn A",
      "semester": "HK1",
      "academicYear": "2025-2026",
      "totalAssignments": 5,
      "completedAssignments": 3
    }
  ],
  "notifications": [
    {
      "id": "n1",
      "type": "assignment",
      "title": "Bài thi “Quiz React nâng cao” đã được mở.",
      "message": "Bạn có thể vào làm bài từ bây giờ.",
      "isRead": false,
      "createdAt": "2026-06-21T20:00:00"
    }
  ]
}

## 5.2 GET /api/student/classes
Response:
[
  {
    "classId": "c1",
    "className": "Cơ sở dữ liệu - D22CQCN01",
    "classCode": "CSDL-D22-01",
    "courseId": 1,
    "courseName": "Cơ sở dữ liệu",
    "teacherId": "t1",
    "teacherName": "Nguyễn Văn A",
    "yearLevel": "2025",
    "semester": "HK1",
    "academicYear": "2025-2026",
    "isActive": true,
    "joinedAt": "2026-01-15T08:00:00",
    "stats": {
      "totalAssignments": 5,
      "completedAssignments": 3,
      "openAssignments": 1,
      "upcomingAssignments": 1,
      "averageScore": 8.2
    }
  }
]

## 5.3 GET /api/student/classes/:classId
Response:
{
  "classInfo": {
    "classId": "c1",
    "className": "Cơ sở dữ liệu - D22CQCN01",
    "classCode": "CSDL-D22-01",
    "courseName": "Cơ sở dữ liệu",
    "teacherName": "Nguyễn Văn A",
    "semester": "HK1",
    "academicYear": "2025-2026"
  },
  "stats": {
    "totalAssignments": 5,
    "completedAssignments": 3,
    "openAssignments": 1,
    "upcomingAssignments": 1,
    "averageScore": 8.2
  },
  "assignments": [],
  "recentResults": [],
  "notifications": []
}

## 5.4 GET /api/student/assignments
Response:
{
  "items": [
    {
      "studentAssignmentId": "sa1",
      "assignmentId": "a1",
      "title": "Quiz Chương 3",
      "courseName": "Cơ sở dữ liệu",
      "className": "Cơ sở dữ liệu - D22CQCN01",
      "classCode": "CSDL-D22-01",
      "teacherName": "Nguyễn Văn A",
      "instructions": "Đọc kỹ đề trước khi làm.",
      "startTime": "2026-06-24T14:00:00",
      "endTime": "2026-06-24T15:00:00",
      "duration": 60,
      "max_attempts": 1,
      "attemptsUsed": 0,
      "status": "upcoming",
      "latestAttempt": null
    },
    {
      "studentAssignmentId": "sa2",
      "assignmentId": "a2",
      "title": "Quiz React nâng cao",
      "courseName": "Phát triển ứng dụng Web",
      "className": "WEB-D22-01",
      "classCode": "WEB-D22-01",
      "teacherName": "Trần Thị B",
      "instructions": "Mỗi câu chỉ chọn 1 đáp án.",
      "startTime": "2026-06-21T08:00:00",
      "endTime": "2026-06-21T23:59:00",
      "duration": 30,
      "max_attempts": 1,
      "attemptsUsed": 0,
      "status": "open",
      "latestAttempt": null
    },
    {
      "studentAssignmentId": "sa3",
      "assignmentId": "a3",
      "title": "Kiểm tra Chương 2",
      "courseName": "Cơ sở dữ liệu",
      "className": "Cơ sở dữ liệu - D22CQCN01",
      "classCode": "CSDL-D22-01",
      "teacherName": "Nguyễn Văn A",
      "instructions": "Làm bài trong 45 phút.",
      "startTime": "2026-06-18T08:00:00",
      "endTime": "2026-06-18T09:00:00",
      "duration": 45,
      "max_attempts": 1,
      "attemptsUsed": 1,
      "status": "submitted",
      "latestAttempt": {
        "attemptId": "at3",
        "score": 8.5,
        "percentage": 85,
        "submittedAt": "2026-06-18T09:15:00"
      }
    }
  ],
  "summary": {
    "total": 10,
    "open": 1,
    "upcoming": 2,
    "submitted": 5,
    "expired": 2
  }
}

# 6. Yêu cầu thiết kế Student Dashboard
Code trang /student/dashboard với layout dashboard hiện đại, sáng, sạch, card trắng, bo góc lớn, shadow nhẹ, tông xanh dương chủ đạo.

## 6.1 Hero card đầu trang
Hiển thị:
- “Xin chào, {student.fullName}!”
- “Bạn đang tham gia {overview.classCount} lớp học và có {overview.upcomingAssignments} bài thi sắp tới.”
- dòng phụ:
  - “{overview.openAssignments} bài thi đang mở để làm ngay”
  - “Điểm trung bình hiện tại: {overview.averageScore}”
  - “Lịch thi gần nhất: {nextAssignment.title} – {nextAssignment.className} – {formatDate(nextAssignment.startTime)}”
- 2 nút:
  - “Vào bài thi”
  - “Xem lịch thi”

## 6.2 4 card overview
1. Lớp học của tôi
2. Bài thi sắp tới
3. Bài thi đang mở
4. Điểm trung bình

## 6.3 Hàng nội dung thứ 2
### Cột trái: “Bài thi gần nhất”
Dùng dữ liệu dashboard.upcomingAssignments
Mỗi item hiển thị:
- title
- className
- courseName
- teacherName
- startTime / endTime
- status
- attemptsUsed / maxAttempts
- nút hành động phù hợp (Vào thi / Xem chi tiết)

### Cột phải: “Thông báo mới”
Dùng dashboard.notifications
Mỗi item hiển thị:
- title
- message
- createdAt
- badge unread nếu isRead = false

## 6.4 Hàng cuối
### Card “Kết quả gần đây”
Dùng dashboard.recentResults
Hiển thị:
- title
- className
- score
- correctAnswers / wrongAnswers
- submittedAt
- nút xem kết quả

### Card “Lớp học của tôi”
Dùng dashboard.myClasses
Hiển thị:
- className
- classCode
- courseName
- teacherName
- totalAssignments
- completedAssignments

# 7. Yêu cầu trang /student/classes
Thiết kế trang “Lớp học của tôi”.

## Header:
- tiêu đề “Lớp học của tôi”
- mô tả ngắn
- ô search theo className/classCode/courseName
- filter theo semester / academicYear

## Grid card lớp:
Mỗi card hiển thị:
- className
- classCode
- courseName
- teacherName
- semester
- academicYear
- stats.totalAssignments
- stats.completedAssignments
- stats.openAssignments
- stats.averageScore
- nút “Xem lớp”
- nút “Xem bài thi”

# 8. Yêu cầu trang /student/classes/:classId
Thiết kế trang chi tiết lớp học.

## Header hiển thị:
- classInfo.className
- classInfo.classCode
- classInfo.courseName
- classInfo.teacherName
- classInfo.semester
- classInfo.academicYear

## Stats overview:
- totalAssignments
- completedAssignments
- openAssignments
- upcomingAssignments
- averageScore

## Nội dung trang:
- tab “Bài thi của lớp”
- tab “Kết quả gần đây”
- tab “Thông báo”

# 9. Yêu cầu trang /student/assignments
Thiết kế trang “Bài thi của tôi” lấy dữ liệu từ GET /api/student/assignments.

## Header:
- “Bài thi của tôi”
- mô tả ngắn
- summary chips: total, open, upcoming, submitted, expired

## Filter tabs:
- Tất cả
- Đang mở
- Sắp diễn ra
- Đã nộp
- Quá hạn

## Search/filter:
- search theo title
- filter theo className
- filter theo courseName
- filter theo teacherName

## Danh sách bài thi:
Mỗi item hiển thị:
- title
- status badge
- courseName
- className
- teacherName
- startTime
- endTime
- duration
- attemptsUsed / maxAttempts
- instructions (rút gọn)
- nếu latestAttempt tồn tại thì hiển thị score + submittedAt
- action button:
  - open => “Vào thi”
  - upcoming => “Xem chi tiết”
  - submitted => “Xem kết quả”
  - expired => “Đã quá hạn”

# 10. Yêu cầu component hóa
Tách component rõ ràng:
- StudentSidebar
- StudentHeader
- DashboardHero
- DashboardStats
- AssignmentListCard
- NotificationsCard
- RecentResultsCard
- MyClassesCard
- ClassCard
- AssignmentCard
- StatusBadge
- EmptyState

# 11. UI style
- background: bg-slate-50
- card: bg-white rounded-2xl border border-slate-200 shadow-sm
- button primary: bg-blue-600 hover:bg-blue-700 text-white rounded-xl
- text chính: text-slate-900
- text phụ: text-slate-500
- spacing rộng, dashboard hiện đại
- responsive desktop-first

# 12. Yêu cầu code
- Viết code React component đầy đủ cho:
  - StudentLayout
  - StudentDashboardPage
  - StudentClassesPage
  - StudentClassDetailPage
  - StudentAssignmentsPage
- Có mock fetch bằng đúng response DTO ở trên
- Dùng dữ liệu DTO thật như đã mô tả, không tự nghĩ schema khác
- Code sạch, chia component, dễ copy vào project
XII. CẤU TRÚC FILE REACT MÌNH KHUYÊN DÙNG
src/
  layouts/
    StudentLayout.tsx

  pages/
    student/
      StudentDashboardPage.tsx
      StudentClassesPage.tsx
      StudentClassDetailPage.tsx
      StudentAssignmentsPage.tsx
      StudentResultsPage.tsx
      StudentNotificationsPage.tsx
      StudentProfilePage.tsx
      StudentSettingsPage.tsx

  components/
    student/
      StudentSidebar.tsx
      StudentHeader.tsx
      DashboardHero.tsx
      DashboardStats.tsx
      OverviewStatCard.tsx
      AssignmentListCard.tsx
      NotificationsCard.tsx
      RecentResultsCard.tsx
      MyClassesCard.tsx
      ClassCard.tsx
      AssignmentCard.tsx
      StatusBadge.tsx
      EmptyState.tsx

  services/
    studentApi.js

  data/
    studentDashboardResponse.js
    studentClassesResponse.js
    studentAssignmentsResponse.js
XIII. GỢI Ý DTO STATUS CHO FRONTEND

Để frontend render dễ, bạn nên thống nhất enum status như sau:

Assignment status DTO
type AssignmentStatus =
  | "open"
  | "upcoming"
  | "submitted"
  | "expired"
  | "graded";
Notification type
type NotificationType =
  | "assignment"
  | "grade"
  | "system"
  | "verification"
  | "email";
XIV. MÌNH KHUYÊN CHỈNH NHẸ BACKEND ĐỂ FRONTEND DỄ LÀM HƠN

Schema hiện tại ổn, nhưng để UI student đẹp và query gọn hơn, bạn nên để backend trả thêm mấy field tổng hợp sau:

1) Dashboard overview
classCount
upcomingAssignments
openAssignments
averageScore
2) Trong GET /student/classes

mỗi class nên có luôn:

totalAssignments
completedAssignments
openAssignments
averageScore
3) Trong GET /student/assignments

mỗi assignment nên có:

status
latestAttempt
canStart
canViewResult

=> như vậy frontend không cần tự suy luận nhiều.
