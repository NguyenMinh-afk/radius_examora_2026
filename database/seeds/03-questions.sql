-- =====================================================
-- SEED 03: Questions
-- =====================================================

SET search_path = question_db, public;

-- Sample questions for CS100 (Python)
INSERT INTO questions (id, course_id, chapter_id, knowledge_unit_id, question_type, difficulty, content, options, correct_answer, explanation, tags, is_approved, created_by) VALUES
    -- Chapter 1: Introduction to Python
    ('10000000-0000-0000-0000-000000000001', 1, 1, 1, 'multiple_choice', 'easy',
     'Lệnh nào để in ra màn hình trong Python?',
     '{"A": "echo()", "B": "print()", "C": "console.log()", "D": "System.out.println()"}'::jsonb,
     'B', 'print() là hàm built-in trong Python để in ra màn hình',
     ARRAY['python', 'basics', 'output'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    ('10000000-0000-0000-0000-000000000002', 1, 1, 2, 'multiple_choice', 'easy',
     'Kết quả của lệnh print("Hello World") là gì?',
     '{"A": "Hello World không có dấu ngoặc", "B": "Hello World có dấu ngoặc kép", "C": "Lỗi cú pháp", "D": "Không in gì"}'::jsonb,
     'A', 'print() sẽ in nội dung bên trong dấu ngoặc kép mà không in dấu ngoặc',
     ARRAY['python', 'basics', 'print'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    -- Chapter 2: Variables and Data Types
    ('10000000-0000-0000-0000-000000000003', 1, 2, 3, 'multiple_choice', 'easy',
     'Kết quả của x = 5; y = 3; print(x + y) là gì?',
     '{"A": "53", "B": "8", "C": "x + y", "D": "Lỗi"}'::jsonb,
     'B', 'Phép cộng số học: 5 + 3 = 8',
     ARRAY['python', 'variables', 'arithmetic'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    ('10000000-0000-0000-0000-000000000004', 1, 2, 4, 'multiple_choice', 'medium',
     'Kiểu dữ liệu nào là số thực trong Python?',
     '{"A": "int", "B": "float", "C": "str", "D": "bool"}'::jsonb,
     'B', 'float là kiểu số thực (floating point) trong Python',
     ARRAY['python', 'datatypes', 'numbers'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    ('10000000-0000-0000-0000-000000000005', 1, 2, 5, 'multiple_choice', 'medium',
     'Kết quả của "Hello" + " " + "World" là gì?',
     '{"A": "HelloWorld", "B": "Hello World", "C": "Hello+World", "D": "Lỗi"}'::jsonb,
     'B', 'Toán tử + với string sẽ nối các chuỗi lại với nhau',
     ARRAY['python', 'strings', 'concatenation'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    -- Chapter 3: Control Flow
    ('10000000-0000-0000-0000-000000000006', 1, 3, 6, 'multiple_choice', 'easy',
     'Câu lệnh nào dùng để kiểm tra điều kiện trong Python?',
     '{"A": "switch", "B": "if", "C": "case", "D": "when"}'::jsonb,
     'B', 'if là câu lệnh điều kiện trong Python',
     ARRAY['python', 'control-flow', 'if'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    ('10000000-0000-0000-0000-000000000007', 1, 3, 7, 'multiple_choice', 'easy',
     'Vòng lặp nào được sử dụng khi biết trước số lần lặp?',
     '{"A": "while", "B": "for", "C": "do-while", "D": "loop"}'::jsonb,
     'B', 'Vòng lặp for thường dùng khi biết trước số lần lặp',
     ARRAY['python', 'loops', 'for'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    ('10000000-0000-0000-0000-000000000008', 1, 3, 8, 'multiple_choice', 'medium',
     'Vòng lặp while kết thúc khi nào?',
     '{"A": "Khi biến đếm đạt giới hạn", "B": "Khi điều kiện là False", "C": "Khi có lỗi", "D": "Khi code kết thúc"}'::jsonb,
     'B', 'Vòng lặp while tiếp tục khi điều kiện True và kết thúc khi điều kiện False',
     ARRAY['python', 'loops', 'while'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    -- Chapter 4: Functions
    ('10000000-0000-0000-0000-000000000009', 1, 4, 9, 'multiple_choice', 'easy',
     'Từ khóa nào để định nghĩa một hàm trong Python?',
     '{"A": "function", "B": "def", "C": "func", "D": "define"}'::jsonb,
     'B', 'Từ khóa def được sử dụng để định nghĩa hàm trong Python',
     ARRAY['python', 'functions', 'basics'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    ('10000000-0000-0000-0000-000000000010', 1, 4, 10, 'multiple_choice', 'medium',
     'Kết quả của def add(a, b=2): return a + b; print(add(5)) là gì?',
     '{"A": "5", "B": "7", "C": "2", "D": "Lỗi"}'::jsonb,
     'B', 'Giá trị mặc định của b là 2, nên add(5) = 5 + 2 = 7',
     ARRAY['python', 'functions', 'default-params'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    -- Chapter 5: Lists and Dictionaries
    ('10000000-0000-0000-0000-000000000011', 1, 5, NULL, 'multiple_choice', 'easy',
     'Làm thế nào để truy cập phần tử đầu tiên của list [1, 2, 3]?',
     '{"A": "list[0]", "B": "list[1]", "C": "list.first()", "D": "list[first]"}'::jsonb,
     'A', 'Chỉ số trong Python bắt đầu từ 0',
     ARRAY['python', 'lists', 'indexing'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    ('10000000-0000-0000-0000-000000000012', 1, 5, NULL, 'multiple_choice', 'medium',
     'Kết quả của {"name": "Alice", "age": 25}["name"] là gì?',
     '{"A": "age", "B": "25", "C": "Alice", "D": "Lỗi"}'::jsonb,
     'C', 'Truy cập dictionary bằng key để lấy value',
     ARRAY['python', 'dictionaries', 'access'], true,
     '00000000-0000-0000-0000-000000000002'),

    -- True/False questions
    ('10000000-0000-0000-0000-000000000013', 1, 1, NULL, 'true_false', 'easy',
     'Python là ngôn ngữ biên dịch (compiled language).',
     NULL, 'False', 'Python là ngôn ngữ thông dịch (interpreted language)',
     ARRAY['python', 'basics', 'theory'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    ('10000000-0000-0000-0000-000000000014', 1, 2, NULL, 'true_false', 'easy',
     'Trong Python, biến cần được khai báo kiểu trước khi sử dụng.',
     NULL, 'False', 'Python là ngôn ngữ dynamically typed, không cần khai báo kiểu',
     ARRAY['python', 'variables', 'theory'], true,
     '00000000-0000-0000-0000-000000000002');

-- Sample questions for CS101 (Data Structures)
INSERT INTO questions (id, course_id, chapter_id, knowledge_unit_id, question_type, difficulty, content, options, correct_answer, explanation, tags, is_approved, created_by) VALUES
    ('10000000-0000-0000-0000-000000000020', 2, 10, 20, 'multiple_choice', 'easy',
     'Độ phức tạp của việc truy cập phần tử trong Array là gì?',
     '{"A": "O(1)", "B": "O(n)", "C": "O(log n)", "D": "O(n²)"}'::jsonb,
     'A', 'Array cho phép truy cập ngẫu nhiên với độ phức tạp O(1)',
     ARRAY['datastructures', 'arrays', 'complexity'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    ('10000000-0000-0000-0000-000000000021', 2, 10, 21, 'multiple_choice', 'medium',
     'Linked List so với Array có ưu điểm gì?',
     '{"A": "Truy cập nhanh hơn", "B": "Chèn/xóa nhanh hơn", "C": "Tiết kiệm bộ nhớ hơn", "D": "Dễ implement hơn"}'::jsonb,
     'B', 'Linked List cho phép chèn và xóa với độ phức tạp O(1) nếu có con trỏ',
     ARRAY['datastructures', 'linked-list', 'advantages'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    ('10000000-0000-0000-0000-000000000022', 2, 11, 22, 'multiple_choice', 'easy',
     'Stack hoạt động theo nguyên tắc nào?',
     '{"A": "FIFO", "B": "LIFO", "C": "Random", "D": "Priority"}'::jsonb,
     'B', 'Stack hoạt động theo nguyên tắc Last In First Out (LIFO)',
     ARRAY['datastructures', 'stack', 'concept'], true,
     '00000000-0000-0000-0000-000000000002'),
    
    ('10000000-0000-0000-0000-000000000023', 2, 11, 23, 'multiple_choice', 'easy',
     'Queue hoạt động theo nguyên tắc nào?',
     '{"A": "FIFO", "B": "LIFO", "C": "Random", "D": "Priority"}'::jsonb,
     'A', 'Queue hoạt động theo nguyên tắc First In First Out (FIFO)',
     ARRAY['datastructures', 'queue', 'concept'], true,
     '00000000-0000-0000-0000-000000000002');

-- Sample questions for MATH100 (Calculus)
INSERT INTO questions (id, course_id, chapter_id, knowledge_unit_id, question_type, difficulty, content, options, correct_answer, explanation, tags, is_approved, created_by) VALUES
    ('10000000-0000-0000-0000-000000000030', 10, 20, 30, 'multiple_choice', 'easy',
     'Giới hạn của x² khi x → 2 là bao nhiêu?',
     '{"A": "2", "B": "4", "C": "0", "D": "Không tồn tại"}'::jsonb,
     'B', 'Thế x = 2 vào x² = 2² = 4',
     ARRAY['calculus', 'limits', 'basics'], true,
     '00000000-0000-0000-0000-000000000003'),
    
    ('10000000-0000-0000-0000-000000000031', 10, 21, 32, 'multiple_choice', 'easy',
     'Đạo hàm của f(x) = x³ là gì?',
     '{"A": "x²", "B": "3x²", "C": "3x³", "D": "x³"}'::jsonb,
     'B', 'Sử dụng quy tắc lũy thừa: d/dx(xⁿ) = nxⁿ⁻¹, vậy d/dx(x³) = 3x²',
     ARRAY['calculus', 'derivatives', 'power-rule'], true,
     '00000000-0000-0000-0000-000000000003'),
    
    ('10000000-0000-0000-0000-000000000032', 10, 23, NULL, 'multiple_choice', 'medium',
     'Ứng dụng nào của đạo hàm trong thực tế?',
     '{"A": "Tính diện tích", "B": "Tìm tốc độ thay đổi", "C": "Đếm số lượng", "D": "Sắp xếp"}'::jsonb,
     'B', 'Đạo hàm biểu diễn tốc độ thay đổi tức thời của một đại lượng',
     ARRAY['calculus', 'derivatives', 'applications'], true,
     '00000000-0000-0000-0000-000000000003');
