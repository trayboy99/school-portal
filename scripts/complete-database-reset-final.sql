-- =====================================================
-- COMPLETE DATABASE RESET WITH ALL FORMS SUPPORT
-- This script drops everything and recreates all tables
-- with proper structure for ALL forms in the application
-- =====================================================

-- Drop all existing tables and dependencies
DROP TABLE IF EXISTS student_exams CASCADE;
DROP TABLE IF EXISTS exam_subjects CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS academic_calendar CASCADE;
DROP TABLE IF EXISTS exam_types CASCADE;

-- Drop any existing functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_grade() CASCADE;
DROP FUNCTION IF EXISTS copy_midterm_to_terminal(VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;

-- =====================================================
-- 1. TEACHERS TABLE - Supports Add Teachers Form
-- =====================================================
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    
    -- Basic Info (from Add Teachers form)
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    -- Personal Details
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    home_address TEXT,
    
    -- Professional Info
    qualification VARCHAR(255),
    experience VARCHAR(50),
    department VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50),
    hire_date DATE,
    salary VARCHAR(100),
    
    -- Emergency Contact
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(20),
    
    -- Login Credentials
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    credential_method VARCHAR(20) DEFAULT 'auto' CHECK (credential_method IN ('auto', 'manual', 'email-setup')),
    custom_username VARCHAR(100),
    custom_password VARCHAR(255),
    send_credentials_to VARCHAR(20),
    
    -- Photo and Status
    avatar TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
    
    -- Arrays for subjects and classes (for quick access)
    subjects TEXT[],
    classes TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CLASSES TABLE - Supports Add Classes Form
-- =====================================================
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    
    -- Basic Class Info
    name VARCHAR(100) NOT NULL, -- JSS 1, SSS 2, etc.
    category VARCHAR(50) NOT NULL, -- Junior, Senior
    section VARCHAR(50) NOT NULL, -- Gold, Silver
    
    -- Academic Info
    academic_year VARCHAR(20) NOT NULL,
    
    -- Teacher Assignment
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
    teacher_name VARCHAR(255),
    
    -- Capacity
    max_students INTEGER DEFAULT 40,
    current_students INTEGER DEFAULT 0,
    subjects_count INTEGER DEFAULT 0,
    
    -- Physical Location
    room VARCHAR(100) DEFAULT 'TBD',
    
    -- Status and Description
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Archived')),
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. SUBJECTS TABLE - Supports Add Subjects Form
-- =====================================================
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    
    -- Subject Info
    subject_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    target_class VARCHAR(50) NOT NULL,
    
    -- Teacher Assignment
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
    teacher_name VARCHAR(255),
    
    -- Additional Info
    description TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. STUDENTS TABLE - Supports Add Students Form
-- =====================================================
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    
    -- Student ID and Status
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    reg_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Graduated')),
    admission_date DATE DEFAULT CURRENT_DATE,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    -- Personal Details
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    home_address TEXT,
    
    -- Academic Information
    class VARCHAR(50) NOT NULL,
    current_class VARCHAR(50) NOT NULL, -- For marks entry compatibility
    section VARCHAR(50) NOT NULL,
    
    -- Parent/Guardian Information
    parent_name VARCHAR(200) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(255),
    
    -- Emergency Contact
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(20),
    
    -- Medical Information
    medical_info TEXT,
    
    -- Login Credentials
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    credential_method VARCHAR(20) DEFAULT 'auto' CHECK (credential_method IN ('auto', 'manual', 'email-setup')),
    credentials_sent_to VARCHAR(20) CHECK (credentials_sent_to IN ('student', 'parent', 'both')),
    custom_username VARCHAR(100),
    custom_password VARCHAR(255),
    send_credentials_to VARCHAR(20),
    
    -- Photo and Additional
    avatar TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. EXAMS TABLE - Supports Add Exams Form
-- =====================================================
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    
    -- Exam Details
    exam_name VARCHAR(255) NOT NULL,
    class VARCHAR(50) NOT NULL, -- Which class this exam is for
    year VARCHAR(4) NOT NULL,
    term VARCHAR(20) NOT NULL,
    mark_type VARCHAR(20) NOT NULL CHECK (mark_type IN ('midterm', 'terminal')),
    session VARCHAR(20) NOT NULL,
    
    -- Dates
    start_date DATE,
    end_date DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate exams
    UNIQUE(exam_name, class, year, term, mark_type, session)
);

-- =====================================================
-- 6. STUDENT_EXAMS TABLE - Supports Marks Entry Form
-- =====================================================
CREATE TABLE student_exams (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Keys
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
    
    -- Marks (flexible for both midterm and terminal)
    ca1 INTEGER CHECK (ca1 >= 0 AND ca1 <= 20),
    ca2 INTEGER CHECK (ca2 >= 0 AND ca2 <= 20),
    exam INTEGER CHECK (exam >= 0 AND exam <= 60),
    
    -- Calculated fields
    total INTEGER GENERATED ALWAYS AS (COALESCE(ca1, 0) + COALESCE(ca2, 0) + COALESCE(exam, 0)) STORED,
    grade VARCHAR(2),
    
    -- Additional info
    session VARCHAR(20),
    term VARCHAR(50),
    year VARCHAR(10),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(exam_id, student_id, subject_id)
);

-- =====================================================
-- 7. USERS TABLE - For Admin Authentication
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin', 'teacher', 'student')),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Teachers indexes
CREATE INDEX idx_teachers_employee_id ON teachers(employee_id);
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_teachers_department ON teachers(department);
CREATE INDEX idx_teachers_status ON teachers(status);

-- Classes indexes
CREATE INDEX idx_classes_name ON classes(name);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_academic_year ON classes(academic_year);

-- Subjects indexes
CREATE INDEX idx_subjects_teacher_id ON subjects(teacher_id);
CREATE INDEX idx_subjects_target_class ON subjects(target_class);
CREATE INDEX idx_subjects_department ON subjects(department);

-- Students indexes
CREATE INDEX idx_students_roll_no ON students(roll_no);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_students_current_class ON students(current_class);

-- Exams indexes
CREATE INDEX idx_exams_class_year_term ON exams(class, year, term);
CREATE INDEX idx_exams_mark_type ON exams(mark_type);

-- Student_exams indexes
CREATE INDEX idx_student_exams_exam_id ON student_exams(exam_id);
CREATE INDEX idx_student_exams_student_id ON student_exams(student_id);
CREATE INDEX idx_student_exams_subject_id ON student_exams(subject_id);

-- =====================================================
-- CREATE TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate grades
CREATE OR REPLACE FUNCTION update_grade()
RETURNS TRIGGER AS $$
DECLARE
    exam_mark_type VARCHAR(20);
BEGIN
    -- Get the mark_type for this exam
    SELECT mark_type INTO exam_mark_type FROM exams WHERE id = NEW.exam_id;
    
    -- Calculate grade based on mark_type
    IF exam_mark_type = 'midterm' THEN
        -- Midterm grading (out of 40)
        NEW.grade := CASE 
            WHEN NEW.total >= 32 THEN 'A'  -- 80% of 40 = 32
            WHEN NEW.total >= 28 THEN 'B'  -- 70% of 40 = 28
            WHEN NEW.total >= 24 THEN 'C'  -- 60% of 40 = 24
            WHEN NEW.total >= 20 THEN 'D'  -- 50% of 40 = 20
            WHEN NEW.total >= 16 THEN 'E'  -- 40% of 40 = 16
            ELSE 'F'
        END;
    ELSE
        -- Terminal grading (out of 100)
        NEW.grade := CASE 
            WHEN NEW.total >= 80 THEN 'A'  -- 80% of 100 = 80
            WHEN NEW.total >= 70 THEN 'B'  -- 70% of 100 = 70
            WHEN NEW.total >= 60 THEN 'C'  -- 60% of 100 = 60
            WHEN NEW.total >= 50 THEN 'D'  -- 50% of 100 = 50
            WHEN NEW.total >= 40 THEN 'E'  -- 40% of 100 = 40
            ELSE 'F'
        END;
    END IF;
    
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for grade calculation
CREATE TRIGGER trigger_update_grade
    BEFORE INSERT OR UPDATE ON student_exams
    FOR EACH ROW
    EXECUTE FUNCTION update_grade();

-- =====================================================
-- INSERT DUMMY DATA FOR TESTING
-- =====================================================

-- Insert Admin Users
INSERT INTO users (username, email, password_hash, first_name, last_name, user_type, status) VALUES
('admin', 'admin@school.com', 'password', 'System', 'Administrator', 'admin', 'Active'),
('superadmin', 'super@school.com', 'admin123', 'Super', 'Admin', 'admin', 'Active');

-- Insert Teachers with Login Credentials
INSERT INTO teachers (
    employee_id, first_name, middle_name, surname, email, phone, 
    date_of_birth, gender, home_address, qualification, experience, 
    department, employment_type, hire_date, salary, emergency_contact, 
    emergency_phone, username, password_hash, credential_method, 
    avatar, status, subjects, classes
) VALUES 
(
    'TCH001', 'John', 'Michael', 'Smith', 'john.smith@school.com', '+234-801-234-5678',
    '1985-03-15', 'Male', '123 Teacher Street, Lagos, Nigeria', 'MSc Mathematics', '8 years',
    'Mathematics', 'Full-time', '2020-09-01', '₦450,000', 'Jane Smith', 
    '+234-802-345-6789', 'john.smith', 'teacher123', 'auto',
    '/placeholder.svg?height=40&width=40', 'Active', 
    ARRAY['Mathematics', 'Further Mathematics'], ARRAY['JSS 1', 'JSS 2']
),
(
    'TCH002', 'Mary', 'Grace', 'Johnson', 'mary.johnson@school.com', '+234-803-456-7890',
    '1988-07-22', 'Female', '456 Oak Avenue, Abuja, Nigeria', 'BA English Literature', '6 years',
    'Languages', 'Full-time', '2021-01-15', '₦420,000', 'David Johnson',
    '+234-804-567-8901', 'mary.johnson', 'teacher123', 'auto',
    '/placeholder.svg?height=40&width=40', 'Active',
    ARRAY['English Language', 'Literature'], ARRAY['JSS 2', 'JSS 3']
),
(
    'TCH003', 'David', 'Emmanuel', 'Wilson', 'david.wilson@school.com', '+234-805-678-9012',
    '1982-11-10', 'Male', '789 Pine Road, Port Harcourt, Nigeria', 'MSc Physics', '10 years',
    'Science', 'Full-time', '2019-08-20', '₦480,000', 'Sarah Wilson',
    '+234-806-789-0123', 'david.wilson', 'teacher123', 'auto',
    '/placeholder.svg?height=40&width=40', 'Active',
    ARRAY['Physics', 'Chemistry'], ARRAY['SSS 1', 'SSS 2']
),
(
    'TCH004', 'Sarah', 'Blessing', 'Okafor', 'sarah.okafor@school.com', '+234-807-890-1234',
    '1990-05-18', 'Female', '321 Cedar Lane, Kano, Nigeria', 'BSc Biology', '4 years',
    'Science', 'Full-time', '2022-02-10', '₦400,000', 'Peter Okafor',
    '+234-808-901-2345', 'sarah.okafor', 'teacher123', 'auto',
    '/placeholder.svg?height=40&width=40', 'Active',
    ARRAY['Biology', 'Basic Science'], ARRAY['JSS 1', 'JSS 3']
),
(
    'TCH005', 'Test', '', 'Teacher', 'test@teacher.com', '+234-809-012-3456',
    '1987-12-25', 'Male', '555 Test Street, Test City, Nigeria', 'BSc Computer Science', '5 years',
    'Computer Science', 'Full-time', '2021-09-01', '₦430,000', 'Test Contact',
    '+234-810-123-4567', 'test.teacher', 'teacher123', 'auto',
    '/placeholder.svg?height=40&width=40', 'Active',
    ARRAY['Computer Studies', 'Mathematics'], ARRAY['JSS 1', 'SSS 1']
);

-- Insert Classes
INSERT INTO classes (name, category, section, academic_year, teacher_id, teacher_name, max_students, subjects_count, room, description) VALUES
('JSS 1', 'Junior', 'Gold', '2024-2025', 1, 'John Michael Smith', 40, 9, 'Room 101', 'Junior Secondary School Class 1 - Gold Section'),
('JSS 2', 'Junior', 'Silver', '2024-2025', 2, 'Mary Grace Johnson', 40, 9, 'Room 102', 'Junior Secondary School Class 2 - Silver Section'),
('JSS 3', 'Junior', 'Gold', '2024-2025', 4, 'Sarah Blessing Okafor', 40, 9, 'Room 103', 'Junior Secondary School Class 3 - Gold Section'),
('SSS 1', 'Senior', 'Gold', '2024-2025', 3, 'David Emmanuel Wilson', 35, 6, 'Room 201', 'Senior Secondary School Class 1 - Gold Section'),
('SSS 2', 'Senior', 'Silver', '2024-2025', 3, 'David Emmanuel Wilson', 35, 6, 'Room 202', 'Senior Secondary School Class 2 - Silver Section');

-- Insert Subjects
INSERT INTO subjects (subject_id, name, code, department, target_class, teacher_id, teacher_name, description, status) VALUES
('SUBJ001', 'Mathematics', 'MATH101', 'Mathematics', 'JSS 1', 1, 'John Michael Smith', 'Core mathematics curriculum covering algebra and basic geometry', 'Active'),
('SUBJ002', 'English Language', 'ENG101', 'Languages', 'JSS 1', 2, 'Mary Grace Johnson', 'English language fundamentals including grammar and composition', 'Active'),
('SUBJ003', 'Basic Science', 'SCI101', 'Science', 'JSS 1', 4, 'Sarah Blessing Okafor', 'Introduction to basic scientific concepts and principles', 'Active'),
('SUBJ004', 'Mathematics', 'MATH102', 'Mathematics', 'JSS 2', 1, 'John Michael Smith', 'Intermediate mathematics with advanced algebra', 'Active'),
('SUBJ005', 'English Language', 'ENG102', 'Languages', 'JSS 2', 2, 'Mary Grace Johnson', 'Advanced English language and literature', 'Active'),
('SUBJ006', 'Basic Science', 'SCI102', 'Science', 'JSS 2', 4, 'Sarah Blessing Okafor', 'Intermediate science concepts and laboratory work', 'Active'),
('SUBJ007', 'Literature', 'LIT103', 'Languages', 'JSS 3', 2, 'Mary Grace Johnson', 'Introduction to literature and creative writing', 'Active'),
('SUBJ008', 'Biology', 'BIO103', 'Science', 'JSS 3', 4, 'Sarah Blessing Okafor', 'Basic biology and life sciences', 'Active'),
('SUBJ009', 'Physics', 'PHY201', 'Science', 'SSS 1', 3, 'David Emmanuel Wilson', 'Introduction to mechanics, thermodynamics, and basic physics', 'Active'),
('SUBJ010', 'Chemistry', 'CHEM201', 'Science', 'SSS 1', 3, 'David Emmanuel Wilson', 'Basic chemistry principles and laboratory work', 'Active'),
('SUBJ011', 'Further Mathematics', 'MATH301', 'Mathematics', 'SSS 2', 1, 'John Michael Smith', 'Advanced mathematics including calculus and statistics', 'Active'),
('SUBJ012', 'Computer Studies', 'COMP101', 'Computer Science', 'JSS 1', 5, 'Test Teacher', 'Introduction to computer science and programming', 'Active');

-- Insert Students with Login Credentials
INSERT INTO students (
    roll_no, reg_number, first_name, middle_name, surname, email, phone,
    date_of_birth, gender, home_address, class, current_class, section,
    parent_name, parent_phone, parent_email, emergency_contact, emergency_phone,
    username, password_hash, credential_method, credentials_sent_to,
    avatar, status
) VALUES 
(
    'STU001', 'REG2024001', 'Ahmed', 'Kola', 'Bello', 'ahmed.bello@student.com', '+234-811-111-1111',
    '2010-05-20', 'Male', '123 Student Street, Lagos, Nigeria', 'JSS 1', 'JSS 1', 'Gold',
    'Fatima Bello', '+234-812-222-2222', 'fatima.bello@parent.com', 'Uncle Musa', '+234-813-333-3333',
    'ahmed.bello', 'student123', 'auto', 'parent',
    '/placeholder.svg?height=40&width=40', 'Active'
),
(
    'STU002', 'REG2024002', 'Chioma', 'Grace', 'Okoro', 'chioma.okoro@student.com', '+234-814-444-4444',
    '2009-08-15', 'Female', '456 Oak Avenue, Abuja, Nigeria', 'JSS 2', 'JSS 2', 'Silver',
    'Ngozi Okoro', '+234-815-555-5555', 'ngozi.okoro@parent.com', 'Aunt Ada', '+234-816-666-6666',
    'chioma.okoro', 'student123', 'auto', 'both',
    '/placeholder.svg?height=40&width=40', 'Active'
),
(
    'STU003', 'REG2024003', 'Emeka', 'Chidi', 'Nwankwo', 'emeka.nwankwo@student.com', '+234-817-777-7777',
    '2011-03-10', 'Male', '789 Pine Road, Port Harcourt, Nigeria', 'JSS 1', 'JSS 1', 'Gold',
    'Obioma Nwankwo', '+234-818-888-8888', 'obioma.nwankwo@parent.com', 'Uncle Ikenna', '+234-819-999-9999',
    'emeka.nwankwo', 'student123', 'auto', 'student',
    '/placeholder.svg?height=40&width=40', 'Active'
),
(
    'STU004', 'REG2024004', 'Aisha', 'Zainab', 'Abdullahi', 'aisha.abdullahi@student.com', '+234-820-000-0000',
    '2008-12-05', 'Female', '321 Cedar Lane, Kano, Nigeria', 'SSS 1', 'SSS 1', 'Gold',
    'Halima Abdullahi', '+234-821-111-1111', 'halima.abdullahi@parent.com', 'Aunt Khadija', '+234-822-222-2222',
    'aisha.abdullahi', 'student123', 'auto', 'parent',
    '/placeholder.svg?height=40&width=40', 'Active'
),
(
    'STU005', 'REG2024005', 'Tunde', 'Ola', 'Adebayo', 'tunde.adebayo@student.com', '+234-823-333-3333',
    '2007-09-18', 'Male', '654 Elm Street, Ibadan, Nigeria', 'SSS 2', 'SSS 2', 'Silver',
    'Folake Adebayo', '+234-824-444-4444', 'folake.adebayo@parent.com', 'Uncle Segun', '+234-825-555-5555',
    'tunde.adebayo', 'student123', 'auto', 'both',
    '/placeholder.svg?height=40&width=40', 'Active'
);

-- Insert Exams
INSERT INTO exams (exam_name, class, year, term, mark_type, session, start_date, end_date, status) VALUES
('First Term Mid-term Examination', 'JSS 1', '2024', 'first', 'midterm', '2024-2025', '2024-11-15', '2024-11-22', 'Completed'),
('First Term Terminal Examination', 'JSS 1', '2024', 'first', 'terminal', '2024-2025', '2024-12-10', '2024-12-17', 'Completed'),
('Second Term Mid-term Examination', 'JSS 1', '2025', 'second', 'midterm', '2024-2025', '2025-02-15', '2025-02-22', 'Scheduled'),
('First Term Mid-term Examination', 'JSS 2', '2024', 'first', 'midterm', '2024-2025', '2024-11-15', '2024-11-22', 'Completed'),
('First Term Terminal Examination', 'JSS 2', '2024', 'first', 'terminal', '2024-2025', '2024-12-10', '2024-12-17', 'Completed'),
('First Term Mid-term Examination', 'SSS 1', '2024', 'first', 'midterm', '2024-2025', '2024-11-15', '2024-11-22', 'Completed'),
('First Term Terminal Examination', 'SSS 1', '2024', 'first', 'terminal', '2024-2025', '2024-12-10', '2024-12-17', 'Completed'),
('Second Term Mid-term Examination', 'SSS 1', '2025', 'second', 'midterm', '2024-2025', '2025-02-15', '2025-02-22', 'Scheduled');

-- Insert Sample Marks for Testing
INSERT INTO student_exams (exam_id, student_id, subject_id, teacher_id, ca1, ca2, exam, session, term, year) VALUES
-- JSS 1 Midterm marks (out of 40: CA1=10, CA2=10, Exam=20)
(1, 1, 1, 1, 8, 9, 18, '2024-2025', 'first', '2024'), -- Ahmed - Mathematics - Total: 35/40 = A
(1, 1, 2, 2, 7, 8, 16, '2024-2025', 'first', '2024'), -- Ahmed - English - Total: 31/40 = B
(1, 1, 3, 4, 9, 8, 17, '2024-2025', 'first', '2024'), -- Ahmed - Basic Science - Total: 34/40 = A
(1, 3, 1, 1, 6, 7, 15, '2024-2025', 'first', '2024'), -- Emeka - Mathematics - Total: 28/40 = B
(1, 3, 2, 2, 8, 7, 14, '2024-2025', 'first', '2024'), -- Emeka - English - Total: 29/40 = B
(1, 3, 3, 4, 7, 6, 13, '2024-2025', 'first', '2024'), -- Emeka - Basic Science - Total: 26/40 = C

-- JSS 1 Terminal marks (out of 100: CA1=20, CA2=20, Exam=60)
(2, 1, 1, 1, 18, 17, 52, '2024-2025', 'first', '2024'), -- Ahmed - Mathematics - Total: 87/100 = A
(2, 1, 2, 2, 16, 15, 48, '2024-2025', 'first', '2024'), -- Ahmed - English - Total: 79/100 = B
(2, 1, 3, 4, 17, 16, 50, '2024-2025', 'first', '2024'), -- Ahmed - Basic Science - Total: 83/100 = A
(2, 3, 1, 1, 15, 14, 42, '2024-2025', 'first', '2024'), -- Emeka - Mathematics - Total: 71/100 = B
(2, 3, 2, 2, 16, 15, 44, '2024-2025', 'first', '2024'), -- Emeka - English - Total: 75/100 = B
(2, 3, 3, 4, 14, 13, 38, '2024-2025', 'first', '2024'), -- Emeka - Basic Science - Total: 65/100 = C

-- JSS 2 Midterm marks
(4, 2, 4, 1, 9, 8, 17, '2024-2025', 'first', '2024'), -- Chioma - Mathematics - Total: 34/40 = A
(4, 2, 5, 2, 8, 9, 16, '2024-2025', 'first', '2024'), -- Chioma - English - Total: 33/40 = A

-- SSS 1 Midterm marks
(6, 4, 9, 3, 7, 8, 16, '2024-2025', 'first', '2024'), -- Aisha - Physics - Total: 31/40 = B
(6, 4, 10, 3, 8, 7, 17, '2024-2025', 'first', '2024'); -- Aisha - Chemistry - Total: 32/40 = A

-- Update current_students count in classes
UPDATE classes SET current_students = (
    SELECT COUNT(*) FROM students WHERE students.class = classes.name
);

-- Update subjects_count in classes
UPDATE classes SET subjects_count = (
    SELECT COUNT(*) FROM subjects WHERE subjects.target_class = classes.name
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Show summary of created data
SELECT 'SUMMARY OF CREATED DATA' as info;

SELECT 'Teachers' as table_name, COUNT(*) as count FROM teachers
UNION ALL
SELECT 'Classes' as table_name, COUNT(*) as count FROM classes
UNION ALL
SELECT 'Subjects' as table_name, COUNT(*) as count FROM subjects
UNION ALL
SELECT 'Students' as table_name, COUNT(*) as count FROM students
UNION ALL
SELECT 'Exams' as table_name, COUNT(*) as count FROM exams
UNION ALL
SELECT 'Student Marks' as table_name, COUNT(*) as count FROM student_exams
UNION ALL
SELECT 'Admin Users' as table_name, COUNT(*) as count FROM users;

-- Show login credentials
SELECT 'LOGIN CREDENTIALS' as info;
SELECT 'ADMIN LOGINS:' as type, username, 'password: password/admin123' as credentials FROM users WHERE user_type = 'admin'
UNION ALL
SELECT 'TEACHER LOGINS:' as type, username, 'password: teacher123' as credentials FROM teachers WHERE username IS NOT NULL
UNION ALL
SELECT 'STUDENT LOGINS:' as type, username, 'password: student123' as credentials FROM students WHERE username IS NOT NULL LIMIT 3;

-- Show teacher-subject assignments
SELECT 'TEACHER-SUBJECT ASSIGNMENTS' as info;
SELECT 
    t.first_name || ' ' || t.surname as teacher_name,
    s.name as subject_name,
    s.target_class as class_name,
    s.department
FROM teachers t
JOIN subjects s ON t.id = s.teacher_id
ORDER BY t.surname, s.target_class;

-- Show class assignments
SELECT 'CLASS ASSIGNMENTS' as info;
SELECT 
    c.name as class_name,
    c.section,
    c.teacher_name as class_teacher,
    c.current_students,
    c.max_students,
    c.subjects_count
FROM classes c
ORDER BY c.name;

-- Show sample marks
SELECT 'SAMPLE MARKS ENTERED' as info;
SELECT 
    s.first_name || ' ' || s.surname as student_name,
    s.class,
    subj.name as subject,
    e.exam_name,
    se.ca1,
    se.ca2,
    se.exam,
    se.total,
    se.grade
FROM student_exams se
JOIN students s ON se.student_id = s.id
JOIN subjects subj ON se.subject_id = subj.id
JOIN exams e ON se.exam_id = e.id
ORDER BY s.surname, subj.name
LIMIT 10;

SELECT 'DATABASE RESET COMPLETED SUCCESSFULLY!' as status;
SELECT 'All forms are now supported with proper data structure and dummy data for testing.' as message;
