-- =====================================================
-- SEED 52: Courses, Faculties, Chapters
-- =====================================================

SET search_path = course_db, public;

-- Faculty
INSERT INTO faculties (id, name, code, description)
VALUES
    (1, 'Khoa Công nghệ thông tin', 'CNTT', 'Khoa Công nghệ thông tin')
ON CONFLICT (id) DO NOTHING;

-- Courses (64 courses)
INSERT INTO courses (id, faculty_id, name, code, description, credits, semester_type, is_active)
VALUES
    (1, 1, 'Lập trình cơ bản', '0101004548', NULL, 2, 'HK1', true),
    (2, 1, 'Pháp luật đại cương', '0101002018', NULL, 2, 'HK1', true),
    (3, 1, 'Toán cao cấp 1', '0101004545', NULL, 3, 'HK1', true),
    (4, 1, 'Triết học Mác - Lênin', '0101003923', NULL, 3, 'HK1', true),
    (5, 1, 'Vật lý đại cương', '0101003612', NULL, 3, 'HK1', true),
    (6, 1, 'Xác suất thống kê', '0101003657', NULL, 2, 'HK1', true),
    (7, 1, 'Đại cương về quản lý điều hành và khởi nghiệp', '0101004551', NULL, 3, 'HK2', true),
    (8, 1, 'Giáo dục quốc phòng 1', '0101004342', NULL, 3, 'HK2', true),
    (9, 1, 'Giáo dục quốc phòng 2', '0101004343', NULL, 2, 'HK2', true),
    (10, 1, 'Giáo dục quốc phòng 3', '0101004344', NULL, 2, 'HK2', true),
    (11, 1, 'Giáo dục quốc phòng 4', '0101004345', NULL, 4, 'HK2', true),
    (12, 1, 'Giáo dục thể chất 1', '0101000801', NULL, 1, 'HK2', true),
    (13, 1, 'Giáo dục thể chất 2', '0101000808', NULL, 1, 'HK2', true),
    (14, 1, 'Giáo dục thể chất 3', '0101000813', NULL, 1, 'HK2', true),
    (15, 1, 'Giáo dục thể chất 4', '0101000816', NULL, 1, 'HK2', true),
    (16, 1, 'Kinh tế chính trị Mác - Lênin', '0101003925', NULL, 2, 'HK2', true),
    (17, 1, 'Năng lượng cho phát triển bền vững', '0101004552', NULL, 2, 'HK2', true),
    (18, 1, 'Tiếng Anh 1', '0101003137', NULL, 4, 'HK2', true),
    (19, 1, 'Toán cao cấp 2', '0101004546', NULL, 3, 'HK2', true),
    (20, 1, 'Toán rời rạc', '0101004205', NULL, 3, 'HK2', true),
    (21, 1, 'Chủ nghĩa xã hội khoa học', '0101003926', NULL, 2, 'HK3', true),
    (22, 1, 'Cơ sở dữ liệu', '0101004744', NULL, 4, 'HK3', true),
    (23, 1, 'Công nghệ phần mềm', '0101000325', NULL, 2, 'HK3', true),
    (24, 1, 'Kiến trúc máy tính', '0101001178', NULL, 2, 'HK3', true),
    (25, 1, 'Lập trình C nâng cao', '0101004290', NULL, 3, 'HK3', true),
    (26, 1, 'Mạng máy tính', '0101001640', NULL, 2, 'HK3', true),
    (27, 1, 'Ngôn ngữ lập trình python', '0101003881', NULL, 2, 'HK3', true),
    (28, 1, 'Tiếng Anh 2', '0101004549', NULL, 4, 'HK3', true),
    (29, 1, 'Cơ sở lập trình Web', '0101004745', NULL, 3, 'HK4', true),
    (30, 1, 'Công nghệ điện toán đám mây', '0101004746', NULL, 3, 'HK4', true),
    (31, 1, 'Nguyên lý hệ điều hành', '0101001830', NULL, 2, 'HK4', true),
    (32, 1, 'Nguyên lý lập trình hướng đối tượng', '0101001841', NULL, 2, 'HK4', true),
    (33, 1, 'Nhập môn cấu trúc dữ liệu và giải thuật', '0101004291', NULL, 3, 'HK4', true),
    (34, 1, 'Thiết bị mạng', '0101002563', NULL, 3, 'HK4', true),
    (35, 1, 'Tiếng anh chuyên ngành CNPM', '0101004511', NULL, 3, 'HK4', true),
    (36, 1, 'Tư tưởng Hồ Chí Minh', '0101003505', NULL, 2, 'HK4', true),
    (37, 1, 'Cấu trúc dữ liệu và giải thuật nâng cao', '0101000146', NULL, 3, 'HK5', true),
    (38, 1, 'Hệ phân tán', '0101000863', NULL, 2, 'HK5', true),
    (39, 1, 'Lập trình Java', '0101001436', NULL, 3, 'HK5', true),
    (40, 1, 'Lập trình .net', '0101004755', NULL, 4, 'HK5', true),
    (41, 1, 'Lịch sử Đảng Cộng sản Việt Nam', '0101003928', NULL, 2, 'HK5', true),
    (42, 1, 'Nhập môn An toàn và bảo mật thông tin', '0101001877', NULL, 2, 'HK5', true),
    (43, 1, 'Phân tích thiết kế hướng đối tượng', '0101001995', NULL, 3, 'HK5', true),
    (44, 1, 'Học máy cơ bản', '0101004750', NULL, 3, 'HK6', true),
    (45, 1, 'Kiểm thử và đảm bảo chất lượng PM', '0101001132', NULL, 2, 'HK6', true),
    (46, 1, 'Lập trình hệ thống', '0101001427', NULL, 2, 'HK6', true),
    (47, 1, 'Lập trình trên thiết bị di động', '0101004294', NULL, 3, 'HK6', true),
    (48, 1, 'Lập trình web nâng cao', '0101004754', NULL, 4, 'HK6', true),
    (49, 1, 'Phần mềm mã nguồn mở', '0101001957', NULL, 2, 'HK6', true),
    (50, 1, 'Quản trị dự án CNTT', '0101002234', NULL, 2, 'HK6', true),
    (51, 1, 'Trí tuệ nhân tạo', '0101004758', NULL, 3, 'HK6', true),
    (52, 1, 'Hệ thống IoT và ứng dụng', '0101004861', NULL, 2, 'HK7', true),
    (53, 1, 'Hệ thống thông tin không gian', '0101000958', NULL, 2, 'HK7', true),
    (54, 1, 'Học máy nâng cao', '0101004295', NULL, 3, 'HK7', true),
    (55, 1, 'Lập trình Blockchain', '0101004753', NULL, 3, 'HK7', true),
    (56, 1, 'Ngôn ngữ kịch bản', '0101004757', NULL, 3, 'HK7', true),
    (57, 1, 'Nhập môn xử lý ảnh', '0101001901', NULL, 2, 'HK7', true),
    (58, 1, 'Phân tích và trực quan hóa dữ liệu', '0101004759', NULL, 3, 'HK7', true),
    (59, 1, 'Phát triển phần mềm web an toàn', '0101002033', NULL, 2, 'HK7', true),
    (60, 1, 'Thực tập hệ thống thông tin quản lý', '0101002793', NULL, 4, 'HK8', true),
    (61, 1, 'Thực tập hệ thống thông tin tích hợp', '0101002794', NULL, 4, 'HK8', true),
    (62, 1, 'Thực tập quản trị dự án phần mềm', '0101002908', NULL, 4, 'HK8', true),
    (63, 1, 'Đồ án tốt nghiệp', '0101004588', NULL, 8, 'HK9', true),
    (64, 1, 'Thực tập tốt nghiệp', '0101004569', NULL, 4, 'HK9', true)
ON CONFLICT (id) DO NOTHING;

-- Chapters
INSERT INTO chapters (id, course_id, year_level, chapter_number, name, description, is_active)
VALUES
    (1, 1, 1, 1, 'Nhập môn lập trình', 'Biến, kiểu dữ liệu và cú pháp cơ bản', true),
    (2, 1, 1, 2, 'Cấu trúc điều khiển', 'Rẽ nhánh và vòng lặp', true),
    (3, 1, 1, 3, 'Hàm và mảng', 'Khai báo hàm, tham số và mảng', true),
    (4, 22, 2, 1, 'Mô hình quan hệ', 'Khái niệm bảng, khóa và ràng buộc', true),
    (5, 22, 2, 2, 'Ngôn ngữ SQL', 'Câu lệnh SELECT, INSERT, UPDATE, DELETE', true),
    (6, 22, 2, 3, 'Thiết kế CSDL', 'Chuẩn hóa và thiết kế sơ đồ', true),
    (7, 29, 2, 1, 'HTML cơ bản', 'Cấu trúc trang web', true),
    (8, 29, 2, 2, 'CSS', 'Định dạng và bố cục', true),
    (9, 33, 2, 1, 'Cấu trúc dữ liệu cơ bản', 'Mảng, danh sách liên kết', true),
    (10, 33, 2, 2, 'Giải thuật sắp xếp', 'Bubble, Quick, Merge Sort', true)
ON CONFLICT (id) DO NOTHING;

-- Knowledge units
INSERT INTO knowledge_units (id, chapter_id, name, description, is_active)
VALUES
    (1, 1, 'Biến và kiểu dữ liệu', 'Kiểu số nguyên, số thực và chuỗi', true),
    (2, 1, 'Toán tử và biểu thức', 'Các phép toán cơ bản', true),
    (3, 2, 'Câu lệnh if-else', 'Rẽ nhánh có điều kiện', true),
    (4, 2, 'Vòng lặp', 'Vòng lặp for/while cơ bản', true),
    (5, 3, 'Khai báo hàm', 'Hàm void, hàm có giá trị trả về', true),
    (6, 3, 'Mảng một chiều', 'Khai báo và sử dụng mảng', true),
    (7, 4, 'Khóa chính', 'Khóa chính và ràng buộc toàn vẹn', true),
    (8, 4, 'Khóa ngoại', 'Liên kết giữa các bảng', true),
    (9, 5, 'Câu lệnh SELECT', 'Truy vấn dữ liệu', true),
    (10, 5, 'Câu lệnh DML', 'INSERT, UPDATE, DELETE', true)
ON CONFLICT (id) DO NOTHING;
