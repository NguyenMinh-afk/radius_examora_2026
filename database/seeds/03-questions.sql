-- =====================================================
-- SEED 03: Questions
-- =====================================================

SET search_path = question_db, public;

-- Question tags
INSERT INTO question_tags (id, name, category, description)
VALUES
    (1, 'algebra', 'math', 'Algebra questions'),
    (2, 'calculus', 'math', 'Calculus questions'),
    (3, 'basics', 'cs', 'Basic programming'),
    (4, 'loops', 'cs', 'Loop questions'),
    (5, 'database', 'cs', 'Database questions'),
    (6, 'network', 'cs', 'Network questions'),
    (7, 'web', 'cs', 'Web development'),
    (8, 'algorithms', 'cs', 'Algorithm questions'),
    (9, 'data-structures', 'cs', 'Data structure questions'),
    (10, 'oop', 'cs', 'Object-oriented programming')
ON CONFLICT (id) DO NOTHING;

-- Questions
INSERT INTO questions (
    id, course_id, chapter_id, knowledge_unit_id, created_by,
    question_type, difficulty, content, options, correct_answer,
    explanation, points, time_limit, keywords, is_ai_generated, ai_model, is_active, is_public
) VALUES
    (
        '50000000-0000-0000-0000-000000000001', 1, 1, 1, '20000000-0000-0000-0000-000000000001',
        'multiple_choice', 'easy',
        'Trong C, kiểu dữ liệu int dùng để lưu gì?',
        '[{"key":"A","text":"Số nguyên","is_correct":true},{"key":"B","text":"Chuỗi ký tự","is_correct":false},{"key":"C","text":"Số thực","is_correct":false},{"key":"D","text":"Giá trị logic","is_correct":false}]',
        'A',
        'int dùng để lưu số nguyên.',
        1.0, 60, ARRAY['c','basic'], false, NULL, true, false
    ),
    (
        '50000000-0000-0000-0000-000000000002', 1, 2, 4, '20000000-0000-0000-0000-000000000001',
        'multiple_choice', 'medium',
        'Vòng lặp nào chạy đúng 5 lần?',
        '[{"key":"A","text":"for(i=0;i<5;i++)","is_correct":true},{"key":"B","text":"for(i=1;i<5;i++)","is_correct":false},{"key":"C","text":"for(i=0;i<=5;i++)","is_correct":false},{"key":"D","text":"for(i=1;i<=4;i++)","is_correct":false}]',
        'A',
        'Biến i chạy từ 0 đến 4 là 5 lần lặp.',
        1.0, 60, ARRAY['loop','c'], true, 'gemini', true, false
    ),
    (
        '50000000-0000-0000-0000-000000000003', 22, 4, 7, '20000000-0000-0000-0000-000000000002',
        'true_false', 'easy',
        'Khóa chính giúp định danh duy nhất một bản ghi trong bảng.',
        '[{"key":"A","text":"Đúng","is_correct":true},{"key":"B","text":"Sai","is_correct":false}]',
        'A',
        'Khóa chính đảm bảo tính duy nhất.',
        1.0, 45, ARRAY['database'], false, NULL, true, true
    ),
    (
        '50000000-0000-0000-0000-000000000004', 22, 4, 8, '20000000-0000-0000-0000-000000000001',
        'multiple_choice', 'medium',
        'Khóa ngoại (Foreign Key) trong cơ sở dữ liệu quan hệ dùng để làm gì?',
        '[{"key":"A","text":"Liên kết hai bảng với nhau","is_correct":true},{"key":"B","text":"Mã hóa dữ liệu","is_correct":false},{"key":"C","text":"Tăng tốc độ truy vấn","is_correct":false},{"key":"D","text":"Lưu trữ dữ liệu nhị phân","is_correct":false}]',
        'A',
        'Khóa ngoại tạo mối quan hệ giữa hai bảng.',
        1.0, 60, ARRAY['database','sql'], false, NULL, true, true
    ),
    (
        '50000000-0000-0000-0000-000000000005', 29, 7, NULL, '20000000-0000-0000-0000-000000000002',
        'multiple_choice', 'easy',
        'HTML là viết tắt của cụm từ nào?',
        '[{"key":"A","text":"HyperText Markup Language","is_correct":true},{"key":"B","text":"High Tech Modern Language","is_correct":false},{"key":"C","text":"Hyper Transfer Markup Language","is_correct":false},{"key":"D","text":"Home Tool Markup Language","is_correct":false}]',
        'A',
        'HTML là ngôn ngữ đánh dấu siêu văn bản.',
        1.0, 30, ARRAY['web','html'], false, NULL, true, true
    ),
    (
        '50000000-0000-0000-0000-000000000006', 33, 9, NULL, '20000000-0000-0000-0000-000000000001',
        'multiple_choice', 'hard',
        'Độ phức tạp thời gian của thuật toán Quick Sort trong trường hợp trung bình là bao nhiêu?',
        '[{"key":"A","text":"O(n log n)","is_correct":true},{"key":"B","text":"O(n)","is_correct":false},{"key":"C","text":"O(n^2)","is_correct":false},{"key":"D","text":"O(log n)","is_correct":false}]',
        'A',
        'Quick Sort có độ phức tạp trung bình O(n log n).',
        2.0, 90, ARRAY['algorithms','sorting'], false, NULL, true, true
    )
ON CONFLICT (id) DO NOTHING;

-- Question tag relations
INSERT INTO question_tag_relations (question_id, tag_id)
VALUES
    ('50000000-0000-0000-0000-000000000001', 3),
    ('50000000-0000-0000-0000-000000000002', 4),
    ('50000000-0000-0000-0000-000000000003', 5),
    ('50000000-0000-0000-0000-000000000004', 5),
    ('50000000-0000-0000-0000-000000000005', 7),
    ('50000000-0000-0000-0000-000000000006', 8)
ON CONFLICT DO NOTHING;
