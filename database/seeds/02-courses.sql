-- =====================================================
-- SEED 02: Courses, Faculties, Chapters
-- =====================================================

SET search_path = course_db, public;

-- Insert faculties
INSERT INTO faculties (id, name, code, description) VALUES
    (1, 'Khoa học Máy tính', 'CS', 'Faculty of Computer Science'),
    (2, 'Toán học', 'MATH', 'Faculty of Mathematics'),
    (3, 'Vật lý', 'PHYS', 'Faculty of Physics'),
    (4, 'Hóa học', 'CHEM', 'Faculty of Chemistry'),
    (5, 'Kinh tế', 'ECON', 'Faculty of Economics')
ON CONFLICT (id) DO NOTHING;

-- Insert courses
INSERT INTO courses (id, faculty_id, name, code, description, credits, semester_type) VALUES
    -- Computer Science courses
    (1, 1, 'Lập trình Python cơ bản', 'CS100', 'Introduction to Python Programming', 3, 'semester'),
    (2, 1, 'Cấu trúc dữ liệu và giải thuật', 'CS101', 'Data Structures and Algorithms', 4, 'semester'),
    (3, 1, 'Lập trình Web', 'CS102', 'Web Development', 3, 'semester'),
    -- Mathematics courses
    (10, 2, 'Giải tích 1', 'MATH100', 'Calculus 1', 4, 'semester'),
    (11, 2, 'Đại số tuyến tính', 'MATH101', 'Linear Algebra', 3, 'semester'),
    (12, 2, 'Xác suất thống kê', 'MATH102', 'Probability and Statistics', 3, 'semester'),
    -- Physics courses
    (20, 3, 'Vật lý đại cương 1', 'PHYS100', 'General Physics 1', 4, 'semester'),
    (21, 3, 'Vật lý đại cương 2', 'PHYS101', 'General Physics 2', 4, 'semester')
ON CONFLICT (id) DO NOTHING;

-- Insert chapters for CS100 (Python)
INSERT INTO chapters (id, course_id, name, chapter_number, year_level, description) VALUES
    (1, 1, 'Giới thiệu Python', 1, 10, 'Cài đặt, IDE, Hello World'),
    (2, 1, 'Biến và kiểu dữ liệu', 2, 10, 'Variables, Numbers, Strings'),
    (3, 1, 'Cấu trúc điều khiển', 3, 10, 'If/else, loops'),
    (4, 1, 'Hàm', 4, 10, 'Functions, parameters, return'),
    (5, 1, 'Lists và Dictionaries', 5, 10, 'Collection data types');

-- Insert chapters for CS101 (Data Structures)
INSERT INTO chapters (id, course_id, name, chapter_number, year_level, description) VALUES
    (10, 2, 'Arrays và Lists', 1, 11, 'Array operations, linked lists'),
    (11, 2, 'Stacks và Queues', 2, 11, 'Stack, queue implementations'),
    (12, 2, 'Trees', 3, 11, 'Binary trees, BST'),
    (13, 2, 'Graphs', 4, 11, 'Graph representations, BFS, DFS'),
    (14, 2, 'Sorting algorithms', 5, 11, 'Quick sort, merge sort, etc');

-- Insert chapters for MATH100 (Calculus)
INSERT INTO chapters (id, course_id, name, chapter_number, year_level, description) VALUES
    (20, 10, 'Giới hạn', 1, 10, 'Limits and continuity'),
    (21, 10, 'Đạo hàm', 2, 10, 'Derivatives'),
    (22, 10, 'Ứng dụng đạo hàm', 3, 10, 'Applications of derivatives'),
    (23, 10, 'Tích phân', 4, 10, 'Integrals'),
    (24, 10, 'Tích phân xác định', 5, 10, 'Definite integrals');

-- Insert knowledge units
INSERT INTO knowledge_units (id, chapter_id, name, code, description) VALUES
    -- Python chapters
    (1, 1, 'Cài đặt Python', 'CS100-1-1', 'Installing Python and IDE'),
    (2, 1, 'Chạy chương trình đầu tiên', 'CS100-1-2', 'Hello World program'),
    (3, 2, 'Biến', 'CS100-2-1', 'Variables in Python'),
    (4, 2, 'Kiểu số', 'CS100-2-2', 'Numeric types'),
    (5, 2, 'Strings', 'CS100-2-3', 'String operations'),
    (6, 3, 'If/Else', 'CS100-3-1', 'Conditional statements'),
    (7, 3, 'For loop', 'CS100-3-2', 'For loops'),
    (8, 3, 'While loop', 'CS100-3-3', 'While loops'),
    (9, 4, 'Định nghĩa hàm', 'CS100-4-1', 'Function definition'),
    (10, 4, 'Parameters', 'CS100-4-2', 'Function parameters'),
    -- Data Structures chapters
    (20, 10, 'Array', 'CS101-1-1', 'Array operations'),
    (21, 10, 'Linked List', 'CS101-1-2', 'Singly linked list'),
    (22, 11, 'Stack', 'CS101-2-1', 'Stack implementation'),
    (23, 11, 'Queue', 'CS101-2-2', 'Queue implementation'),
    -- Calculus chapters
    (30, 20, 'Định nghĩa giới hạn', 'MATH100-1-1', 'Definition of limit'),
    (31, 20, 'Tính giới hạn', 'MATH100-1-2', 'Calculating limits'),
    (32, 21, 'Đạo hàm cơ bản', 'MATH100-2-1', 'Basic derivatives');
