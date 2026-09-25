-- =====================================================
-- SEED 56: Notifications and Email Templates
-- =====================================================

SET search_path = notification_db, public;

-- Email templates
INSERT INTO email_templates (
    template_key, template_name, subject, body_html, body_text, variables, is_active
) VALUES
    ('PASSWORD_RESET', 'Password Reset', 'Đặt lại mật khẩu EXAMORA',
     '<p>Xin chào {{name}},</p><p>Nhấn vào liên kết sau để đặt lại mật khẩu: <a href="{{reset_url}}">{{reset_url}}</a></p>',
     'Xin chào {{name}}, dùng liên kết sau để đặt lại mật khẩu: {{reset_url}}.',
     '{"name": "", "reset_url": ""}', true),
    ('welcome', 'Welcome', 'Chào mừng bạn đến với EXAMORA!',
     '<h1>Chào mừng {{fullName}}!</h1><p>Cảm ơn bạn đã đăng ký tài khoản EXAMORA.</p>',
     'Chao muon {{fullName}}!', '{"fullName": ""}', true),
    ('email_verification', 'Email Verification', 'Xác minh email EXAMORA',
     '<p>Xin chào {{name}},</p><p>Mã xác minh của bạn là: <strong>{{verification_code}}</strong></p>',
     'Xin chao {{name}}, ma xac minh cua ban la: {{verification_code}}.',
     '{"name": "", "verification_code": ""}', true),
    ('exam_assigned', 'Exam Assigned', 'New exam assigned',
     '<p>You have a new exam assigned: {{examTitle}}</p>',
     'You have a new exam: {{examTitle}}.', '{"examTitle": ""}', true),
    ('grade_notification', 'Grade Published', 'Kết quả bài thi đã được công bố',
     '<p>Xin chào {{name}},</p><p>Kết quả bài thi "{{examTitle}}" đã được công bố. Điểm của bạn: {{score}}.</p>',
     'Xin chao {{name}}, ket qua bai thi "{{examTitle}}" da duoc cong bo. Diem cua ban: {{score}}.',
     '{"name": "", "examTitle": "", "score": ""}', true)
ON CONFLICT (template_key) DO NOTHING;

-- Notifications
INSERT INTO notifications (id, user_id, type, title, message, action_url, is_read, created_at)
VALUES
    ('90000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'assignment',
     'Bài thi mới được giao', 'Bài thi "Quiz Chương 3 - Cơ sở dữ liệu" đã được mở.',
     '/student/assignments/EA000000-0000-0000-0000-000000000002', false, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('90000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'grade',
     'Kết quả đã được công bố', 'Kết quả bài thi "Kiểm tra Chương 2" đã được công bố. Điểm của bạn: 8.5/10.',
     '/student/results/EB000000-0000-0000-0000-000000000001', false, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('90000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'system',
     'Nhắc nhở: Bài thi sắp đóng', 'Bài thi "Quiz React nâng cao" sẽ đóng sau 12 giờ nữa.',
     '/student/assignments/EA000000-0000-0000-0000-000000000003', true, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('90000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'assignment',
     'Bạn đã được thêm vào lớp mới', 'Bạn đã được thêm vào lớp "Mạng máy tính - D22MMT01".',
     '/student/classes/B0000000-0000-0000-0000-000000000004', true, CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('90000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'verification',
     'Xác minh email thành công', 'Email của bạn đã được xác minh thành công.',
     NULL, true, CURRENT_TIMESTAMP - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- Email logs
INSERT INTO email_logs (
    id, user_id, recipient_email, template_key, subject, status, sent_at, created_at
) VALUES
    ('91000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'student1@examora.local',
     'exam_assigned', 'New exam assigned', 'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('91000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'student2@examora.local',
     'welcome', 'Chào mừng bạn đến với EXAMORA!', 'sent', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;
