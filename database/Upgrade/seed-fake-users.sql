-- =====================================================
-- SEED FAKE DATA FOR TESTING
-- Generates 50,000+ users (teachers and students)
-- =====================================================

-- Function to generate random Vietnamese name
CREATE OR REPLACE FUNCTION generate_vietnamese_name() 
RETURNS TEXT AS $$
DECLARE
    first_names TEXT[] := ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
    middle_names TEXT[] := ARRAY['Văn', 'Thị', 'Đức', 'Hữu', 'Minh', 'Anh', 'Thành', 'Công', 'Hồng', 'Thanh', 'Quang', 'Tuấn', 'Phương', 'Thu'];
    last_names TEXT[] := ARRAY['An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hải', 'Hùng', 'Khoa', 'Linh', 'Mai', 'Nam', 'Phú', 'Quân', 'Tâm', 'Xuân', 'Yến', 'Long', 'Thảo'];
BEGIN
    RETURN first_names[1 + floor(random() * array_length(first_names, 1))] || ' ' ||
           middle_names[1 + floor(random() * array_length(middle_names, 1))] || ' ' ||
           last_names[1 + floor(random() * array_length(last_names, 1))];
END;
$$ LANGUAGE plpgsql;

-- Function to generate random phone number (unique with index)
CREATE OR REPLACE FUNCTION generate_phone(idx INTEGER)
RETURNS TEXT AS $$
DECLARE
    prefixes TEXT[] := ARRAY['032', '033', '034', '035', '036', '037', '038', '039', '086', '096', '097', '098'];
BEGIN
    -- Generate unique phone by combining prefix + idx + random padding
    RETURN prefixes[1 + floor(random() * array_length(prefixes, 1))] || 
           lpad((idx % 10000000)::TEXT, 7, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate random email from name
CREATE OR REPLACE FUNCTION generate_email(name TEXT, idx INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(
        translate(name, 'ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ',
                  'AAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYDaaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiioooooooooooooooooouuuuuuuuuuuyyyyyyd'),
        '\s+', '.', 'g'
    )) || idx || '@example.com';
END;
$$ LANGUAGE plpgsql;

-- Function to generate random date in range
CREATE OR REPLACE FUNCTION random_date(start_year INTEGER, end_year INTEGER)
RETURNS DATE AS $$
BEGIN
    RETURN (start_year || '-01-01')::DATE + 
           (random() * ((end_year || '-12-31')::DATE - (start_year || '-01-01')::DATE))::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Main function to seed users
CREATE OR REPLACE FUNCTION seed_users(
    total_users INTEGER DEFAULT 50000,
    teacher_ratio NUMERIC DEFAULT 0.1,
    active_in_month_ratio NUMERIC DEFAULT 0.3
)
RETURNS TEXT AS $$
DECLARE
    batch_size INTEGER := 1000;
    total_batches INTEGER;
    current_batch INTEGER := 0;
    teacher_role_id INTEGER;
    student_role_id INTEGER;
    admin_role_id INTEGER;
    user_id UUID;
    full_name TEXT;
    email TEXT;
    phone TEXT;
    password_hash TEXT;
    is_teacher BOOLEAN;
    is_active_month BOOLEAN;
    last_login_date TIMESTAMP;
    this_month_start DATE;
    created_date TIMESTAMP;
    insert_count INTEGER := 0;
BEGIN
    -- Get role IDs
    SELECT id INTO teacher_role_id FROM roles WHERE name = 'teacher';
    SELECT id INTO student_role_id FROM roles WHERE name = 'student';
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
    
    -- Default password hash for 'password123' (bcrypt with cost 10)
    password_hash := '$2b$10$rPx5V3qK7Y.N5m7xqGFZWOE0H8xH5jYqM7VrQXzN5vFJ9k8JZ5vLy';
    
    -- Calculate this month start
    this_month_start := DATE_TRUNC('month', CURRENT_DATE);
    
    total_batches := CEIL(total_users::NUMERIC / batch_size);
    
    RAISE NOTICE 'Starting to seed % users in % batches...', total_users, total_batches;
    
    -- Loop through batches
    FOR i IN 0..(total_users - 1) LOOP
        -- Generate data
        full_name := generate_vietnamese_name();
        email := generate_email(full_name, i);
        phone := generate_phone(i);
        is_teacher := (random() < teacher_ratio);
        is_active_month := (random() < active_in_month_ratio);
        
        -- Generate last login
        IF is_active_month THEN
            last_login_date := this_month_start + (random() * (CURRENT_TIMESTAMP - this_month_start));
        ELSE
            last_login_date := random_date(2023, 2025)::TIMESTAMP;
        END IF;
        
        created_date := random_date(2023, 2025)::TIMESTAMP;
        
        -- Insert user
        INSERT INTO users (
            email, phone, password_hash, full_name, role_id,
            is_active, approval_status, email_verified, last_login, created_at
        ) VALUES (
            email,
            phone,
            password_hash,
            full_name,
            CASE WHEN is_teacher THEN teacher_role_id ELSE student_role_id END,
            true,
            'approved',
            true,
            last_login_date,
            created_date
        ) RETURNING id INTO user_id;
        
        -- Insert user profile
        INSERT INTO user_profiles (
            user_id, 
            date_of_birth,
            gender,
            address,
            city,
            school_name,
            major,
            year_of_study,
            class_code
        ) VALUES (
            user_id,
            random_date(CASE WHEN is_teacher THEN 1980 ELSE 2005 END, 
                       CASE WHEN is_teacher THEN 1995 ELSE 2010 END),
            CASE WHEN random() > 0.5 THEN 'male' ELSE 'female' END,
            floor(random() * 500) || ' Đường Lê Lợi',
            (ARRAY['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'])[1 + floor(random() * 5)],
            (ARRAY['Đại học EXAMORA', 'ĐH Bách Khoa', 'ĐH Khoa học Tự nhiên', 'ĐH Công nghệ'])[1 + floor(random() * 4)],
            CASE
                WHEN is_teacher THEN (ARRAY['Toán học', 'Văn học', 'Vật lý', 'Hóa học', 'Sinh học'])[1 + floor(random() * 5)]
                ELSE (ARRAY['Computer Science', 'Data Science', 'AI Engineering', 'Software Engineering'])[1 + floor(random() * 4)]
            END,
            CASE WHEN is_teacher THEN NULL ELSE (floor(random() * 4) + 1)::INTEGER END,
            CASE WHEN is_teacher THEN NULL ELSE 'K' || (floor(random() * 4) + 1)::TEXT || '-A' || (floor(random() * 8) + 1)::TEXT END
        );
        
        -- Insert teacher or student profile
        IF is_teacher THEN
            INSERT INTO teacher_profiles (
                user_id,
                teacher_code,
                highest_degree,
                major,
                university,
                graduation_year,
                teaching_experience_years,
                contract_type,
                employment_status
            ) VALUES (
                user_id,
                'GV' || lpad(i::TEXT, 6, '0'),
                (ARRAY['bachelor', 'master', 'phd'])[1 + floor(random() * 3)],
                (ARRAY['Toán học', 'Văn học', 'Vật lý', 'Hóa học', 'Sinh học'])[1 + floor(random() * 5)],
                (ARRAY['ĐH Sư phạm Hà Nội', 'ĐH Sư phạm TP.HCM', 'ĐH Khoa học Tự nhiên'])[1 + floor(random() * 3)],
                floor(random() * 15) + 2005,
                floor(random() * 20) + 1,
                (ARRAY['permanent', 'contract'])[1 + floor(random() * 2)],
                'active'
            );
        ELSE
            INSERT INTO student_profiles (
                user_id,
                student_code,
                current_year_of_study,
                current_class_code,
                admission_year,
                enrollment_status,
                academic_year,
                semester
            ) VALUES (
                user_id,
                'SV' || lpad(i::TEXT, 6, '0'),
                floor(random() * 4) + 1,
                'K' || (floor(random() * 4) + 1)::TEXT || '-A' || (floor(random() * 8) + 1)::TEXT,
                floor(random() * 3) + 2021,
                'active',
                '2025-2026',
                (ARRAY['HK1', 'HK2'])[1 + floor(random() * 2)]
            );
        END IF;
        
        insert_count := insert_count + 1;
        
        -- Progress report every batch
        IF i % batch_size = 0 AND i > 0 THEN
            current_batch := current_batch + 1;
            RAISE NOTICE 'Completed batch % of % (% users)', current_batch, total_batches, i;
        END IF;
    END LOOP;
    
    RETURN format('Successfully inserted %s users', insert_count);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- USAGE INSTRUCTIONS:
-- =====================================================

-- To seed 5,000 users (fast, for testing):
-- SELECT seed_users(5000);

-- To seed 50,000 users (default, ~10-15 minutes):
-- SELECT seed_users(50000);

-- To seed 500,000 users (~1-2 hours):
-- SELECT seed_users(500000);

-- To seed 5,000,000 users (~12-24 hours):
-- SELECT seed_users(5000000);

-- With custom ratios:
-- SELECT seed_users(
--     50000,  -- total users
--     0.15,   -- 15% teachers
--     0.4     -- 40% active in current month
-- );

-- =====================================================
-- RUN SEEDING (Tự động chạy khi load file):
-- =====================================================

-- Comment dòng dưới nếu chỉ muốn tạo functions mà chưa chạy seeding
SELECT seed_users(50000);  -- Default: 50K users (thay đổi số lượng tùy ý)

-- =====================================================
-- CLEANUP (if needed - removes all seeded data):
-- =====================================================

-- DELETE FROM teacher_profiles WHERE teacher_code LIKE 'GV%';
-- DELETE FROM student_profiles WHERE student_code LIKE 'SV%';
-- DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com');
-- DELETE FROM users WHERE email LIKE '%@example.com';
