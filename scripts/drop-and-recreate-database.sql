-- ⚠️ WARNING: This will delete ALL existing data!
-- Drop all existing tables in the correct order (to handle foreign key constraints)

DROP TABLE IF EXISTS student_scores CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Drop any existing functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Now create all tables from scratch with the correct structure

-- 1. Students table with all required fields
CREATE TABLE students (
    -- Primary key and system fields
    id SERIAL PRIMARY KEY,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Graduated')),
    admission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Student photo/image
    avatar TEXT,
    
    -- Personal information (matching your form fields)
    surname VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    first_name VARCHAR(100) NOT NULL,
    
    -- Contact information
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    -- Personal details
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    home_address TEXT,
    
    -- Academic information
    class VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL,
    
    -- Parent/Guardian information
    parent_name VARCHAR(200) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(255),
    
    -- Login credentials
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    credential_method VARCHAR(20) DEFAULT 'auto' CHECK (credential_method IN ('auto', 'manual', 'email-setup')),
    credentials_sent_to VARCHAR(20) CHECK (credentials_sent_to IN ('student', 'parent', 'both')),
    custom_username VARCHAR(100),
    custom_password VARCHAR(255),
    send_credentials_to VARCHAR(20),
    
    -- Additional fields
    notes TEXT
);

-- 2. Teachers table
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    subjects TEXT[],
    experience VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    avatar TEXT,
    department VARCHAR(100),
    qualification VARCHAR(255),
    hire_date DATE,
    employment_type VARCHAR(50),
    salary VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Classes table
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    teacher VARCHAR(255),
    teacher_id VARCHAR(50),
    students INTEGER DEFAULT 0,
    max_students INTEGER DEFAULT 40,
    subjects INTEGER DEFAULT 0,
    room VARCHAR(100),
    section VARCHAR(50),
    academic_year VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Subjects table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    credits INTEGER DEFAULT 1,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Exams table
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    session VARCHAR(20),
    year VARCHAR(10),
    term VARCHAR(50),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Scheduled',
    exam_type VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Student scores table
CREATE TABLE student_scores (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    subject VARCHAR(100),
    class VARCHAR(100),
    ca1 INTEGER DEFAULT 0,
    ca2 INTEGER DEFAULT 0,
    exam INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    grade VARCHAR(2),
    session VARCHAR(20),
    term VARCHAR(50),
    year VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Users table (for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    user_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Settings table
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    category VARCHAR(100),
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_roll_no ON students(roll_no);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_class_section ON students(class, section);
CREATE INDEX idx_students_parent_email ON students(parent_email);
CREATE INDEX idx_teachers_employee_id ON teachers(employee_id);
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_classes_name ON classes(name);
CREATE INDEX idx_subjects_code ON subjects(code);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO students (
    roll_no, surname, middle_name, first_name, email, phone,
    date_of_birth, gender, home_address, class, section,
    parent_name, parent_phone, parent_email,
    credential_method, credentials_sent_to
) VALUES 
(
    'STU001', 'Doe', 'Michael', 'John', 'john.doe@school.edu', '+234-801-234-5678',
    '2010-05-20', 'Male', '123 Main Street, Lagos, Nigeria', 'JSS 1', 'Gold',
    'Jane Doe', '+234-802-345-6789', 'jane.doe@parent.com',
    'auto', 'parent'
),
(
    'STU002', 'Smith', 'Grace', 'Sarah', 'sarah.smith@school.edu', '+234-803-456-7890',
    '2009-08-15', 'Female', '456 Oak Avenue, Abuja, Nigeria', 'JSS 2', 'Silver',
    'Robert Smith', '+234-804-567-8901', 'robert.smith@parent.com',
    'email-setup', 'both'
),
(
    'STU003', 'Johnson', NULL, 'David', 'david.johnson@school.edu', '+234-805-678-9012',
    '2011-03-10', 'Male', '789 Pine Road, Port Harcourt, Nigeria', 'JSS 1', 'Gold',
    'Mary Johnson', '+234-806-789-0123', 'mary.johnson@parent.com',
    'manual', 'student'
);

-- Insert sample teachers
INSERT INTO teachers (name, employee_id, email, phone, subjects, department, status) VALUES
('Dr. Alice Williams', 'TCH001', 'alice.williams@school.edu', '+234-807-111-2222', ARRAY['Mathematics', 'Physics'], 'Science', 'Active'),
('Mr. Bob Brown', 'TCH002', 'bob.brown@school.edu', '+234-808-333-4444', ARRAY['English', 'Literature'], 'Languages', 'Active'),
('Mrs. Carol Davis', 'TCH003', 'carol.davis@school.edu', '+234-809-555-6666', ARRAY['Chemistry', 'Biology'], 'Science', 'Active');

-- Insert sample classes
INSERT INTO classes (name, teacher, section, academic_year, room) VALUES
('JSS 1', 'Dr. Alice Williams', 'Gold', '2024/2025', 'Room 101'),
('JSS 2', 'Mr. Bob Brown', 'Silver', '2024/2025', 'Room 102'),
('JSS 3', 'Mrs. Carol Davis', 'Bronze', '2024/2025', 'Room 103');

-- Insert sample subjects
INSERT INTO subjects (name, code, department, credits) VALUES
('Mathematics', 'MATH101', 'Science', 3),
('English Language', 'ENG101', 'Languages', 3),
('Physics', 'PHY101', 'Science', 3),
('Chemistry', 'CHE101', 'Science', 3),
('Biology', 'BIO101', 'Science', 3);

-- Verify the tables were created successfully
SELECT 'students' as table_name, COUNT(*) as record_count FROM students
UNION ALL
SELECT 'teachers' as table_name, COUNT(*) as record_count FROM teachers
UNION ALL
SELECT 'classes' as table_name, COUNT(*) as record_count FROM classes
UNION ALL
SELECT 'subjects' as table_name, COUNT(*) as record_count FROM subjects
ORDER BY table_name;
