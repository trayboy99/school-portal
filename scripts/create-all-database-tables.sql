-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS academic_terms CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Create Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    custom_password VARCHAR(255),
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    surname VARCHAR(100) NOT NULL,
    full_name VARCHAR(300) GENERATED ALWAYS AS (
        CASE 
            WHEN middle_name IS NOT NULL AND middle_name != '' 
            THEN first_name || ' ' || middle_name || ' ' || surname
            ELSE first_name || ' ' || surname
        END
    ) STORED,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    address TEXT,
    guardian_name VARCHAR(200),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(255),
    current_class VARCHAR(50),
    section VARCHAR(20),
    roll_number VARCHAR(20),
    admission_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Graduated', 'Transferred')),
    photo_url TEXT,
    emergency_contact VARCHAR(20),
    blood_group VARCHAR(5),
    medical_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Teachers table
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    teacher_id VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    custom_password VARCHAR(255),
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    surname VARCHAR(100) NOT NULL,
    full_name VARCHAR(300) GENERATED ALWAYS AS (
        CASE 
            WHEN middle_name IS NOT NULL AND middle_name != '' 
            THEN first_name || ' ' || middle_name || ' ' || surname
            ELSE first_name || ' ' || surname
        END
    ) STORED,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    address TEXT,
    qualification VARCHAR(200),
    experience_years INTEGER DEFAULT 0,
    department VARCHAR(100),
    subjects TEXT[], -- Array of subjects they can teach
    hire_date DATE DEFAULT CURRENT_DATE,
    salary DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave', 'Terminated')),
    photo_url TEXT,
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Subjects table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(200) NOT NULL,
    department VARCHAR(100),
    description TEXT,
    credits INTEGER DEFAULT 1,
    class_level VARCHAR(50), -- JSS1, JSS2, SSS1, etc.
    is_core BOOLEAN DEFAULT false,
    is_elective BOOLEAN DEFAULT false,
    prerequisites TEXT[],
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Classes table with correct column name
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL, -- Changed from 'name' to 'class_name'
    category VARCHAR(50) NOT NULL CHECK (category IN ('Junior', 'Senior')),
    section VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    teacher_id INTEGER REFERENCES teachers(id),
    teacher_name VARCHAR(300),
    max_students INTEGER DEFAULT 40,
    current_students INTEGER DEFAULT 0,
    subjects_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_name, section, academic_year)
);

-- Create Academic Years table
CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    year_name VARCHAR(20) UNIQUE NOT NULL, -- e.g., "2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Completed')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Academic Terms table
CREATE TABLE academic_terms (
    id SERIAL PRIMARY KEY,
    term_name VARCHAR(50) NOT NULL,
    academic_year_id INTEGER REFERENCES academic_years(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Completed')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(term_name, academic_year_id)
);

-- Create Exams table (simplified)
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    exam_name VARCHAR(200) NOT NULL,
    exam_type VARCHAR(50) NOT NULL CHECK (exam_type IN ('Mid-term', 'Final', 'Quiz', 'Assignment', 'Project')),
    exam_date DATE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_students_username ON students(username);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_class ON students(current_class);
CREATE INDEX idx_students_status ON students(status);

CREATE INDEX idx_teachers_username ON teachers(username);
CREATE INDEX idx_teachers_teacher_id ON teachers(teacher_id);
CREATE INDEX idx_teachers_department ON teachers(department);
CREATE INDEX idx_teachers_status ON teachers(status);

CREATE INDEX idx_subjects_code ON subjects(subject_code);
CREATE INDEX idx_subjects_department ON subjects(department);
CREATE INDEX idx_subjects_level ON subjects(class_level);

CREATE INDEX idx_classes_name ON classes(class_name);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_year ON classes(academic_year);

CREATE INDEX idx_exams_date ON exams(exam_date);
CREATE INDEX idx_exams_type ON exams(exam_type);
CREATE INDEX idx_exams_status ON exams(status);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON academic_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_terms_updated_at BEFORE UPDATE ON academic_terms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one current academic year and term
CREATE OR REPLACE FUNCTION ensure_single_current_year()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = true THEN
        UPDATE academic_years SET is_current = false WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_current_year
    BEFORE INSERT OR UPDATE ON academic_years
    FOR EACH ROW EXECUTE FUNCTION ensure_single_current_year();

CREATE OR REPLACE FUNCTION ensure_single_current_term()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = true THEN
        UPDATE academic_terms SET is_current = false WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_current_term
    BEFORE INSERT OR UPDATE ON academic_terms
    FOR EACH ROW EXECUTE FUNCTION ensure_single_current_term();

-- Insert sample data
-- Sample Students
INSERT INTO students (student_id, username, password, first_name, middle_name, surname, email, phone, date_of_birth, gender, current_class, section, roll_number, guardian_name, guardian_phone) VALUES
('STU001', 'john.doe', 'student123', 'John', 'Michael', 'Doe', 'john.doe@student.edu', '08012345678', '2008-05-15', 'Male', 'JSS 1', 'Gold', '001', 'Mr. Robert Doe', '08087654321'),
('STU002', 'jane.smith', 'student123', 'Jane', 'Elizabeth', 'Smith', 'jane.smith@student.edu', '08023456789', '2007-08-22', 'Female', 'JSS 2', 'Silver', '002', 'Mrs. Mary Smith', '08098765432'),
('STU003', 'david.wilson', 'student123', 'David', '', 'Wilson', 'david.wilson@student.edu', '08034567890', '2006-12-10', 'Male', 'JSS 3', 'Bronze', '003', 'Mr. James Wilson', '08076543210'),
('STU004', 'sarah.johnson', 'student123', 'Sarah', 'Grace', 'Johnson', 'sarah.johnson@student.edu', '08045678901', '2005-03-18', 'Female', 'SSS 1', 'Gold', '004', 'Dr. Paul Johnson', '08065432109'),
('STU005', 'michael.brown', 'student123', 'Michael', 'Anthony', 'Brown', 'michael.brown@student.edu', '08056789012', '2004-09-25', 'Male', 'SSS 2', 'Silver', '005', 'Mrs. Linda Brown', '08054321098');

-- Sample Teachers
INSERT INTO teachers (teacher_id, username, password, first_name, middle_name, surname, email, phone, date_of_birth, gender, qualification, experience_years, department, subjects, hire_date, salary) VALUES
('TCH001', 'john.smith', 'teacher123', 'John', 'Paul', 'Smith', 'john.smith@school.edu', '08011111111', '1985-06-15', 'Male', 'B.Sc Mathematics, M.Ed', 8, 'Mathematics', ARRAY['Mathematics', 'Further Mathematics'], '2020-09-01', 150000.00),
('TCH002', 'mary.johnson', 'teacher123', 'Mary', 'Grace', 'Johnson', 'mary.johnson@school.edu', '08022222222', '1982-11-20', 'Female', 'B.A English, M.A Literature', 12, 'Languages', ARRAY['English Language', 'Literature'], '2018-01-15', 160000.00),
('TCH003', 'peter.williams', 'teacher123', 'Peter', 'David', 'Williams', 'peter.williams@school.edu', '08033333333', '1980-04-08', 'Male', 'B.Sc Physics, M.Sc', 15, 'Sciences', ARRAY['Physics', 'Chemistry'], '2015-08-20', 170000.00);

-- Sample Subjects
INSERT INTO subjects (subject_code, subject_name, department, description, credits, class_level, is_core, is_elective) VALUES
('MATH001', 'Mathematics', 'Mathematics', 'Basic Mathematics for Junior Secondary', 3, 'JSS 1-3', true, false),
('ENG001', 'English Language', 'Languages', 'English Language and Communication', 3, 'JSS 1-3', true, false),
('PHY001', 'Physics', 'Sciences', 'Introduction to Physics', 3, 'SSS 1-3', true, false),
('CHEM001', 'Chemistry', 'Sciences', 'Basic Chemistry Principles', 3, 'SSS 1-3', true, false),
('BIO001', 'Biology', 'Sciences', 'Life Sciences and Biology', 3, 'JSS 1-3', true, false),
('HIST001', 'History', 'Social Sciences', 'Nigerian and World History', 2, 'JSS 1-3', false, true),
('GEO001', 'Geography', 'Social Sciences', 'Physical and Human Geography', 2, 'JSS 1-3', false, true),
('ART001', 'Fine Arts', 'Arts', 'Drawing and Painting', 2, 'JSS 1-3', false, true),
('MUS001', 'Music', 'Arts', 'Music Theory and Practice', 2, 'JSS 1-3', false, true),
('PE001', 'Physical Education', 'Sports', 'Physical Fitness and Sports', 1, 'JSS 1-3', true, false);

-- Sample Classes
INSERT INTO classes (class_name, category, section, academic_year, teacher_id, teacher_name, max_students, current_students, subjects_count, description) VALUES
('JSS 1', 'Junior', 'Gold', '2024-2025', 1, 'John Paul Smith', 40, 8, 6, 'Junior Secondary School Year 1 - Gold Section'),
('JSS 1', 'Junior', 'Silver', '2024-2025', 2, 'Mary Grace Johnson', 40, 12, 6, 'Junior Secondary School Year 1 - Silver Section'),
('JSS 2', 'Junior', 'Gold', '2024-2025', 3, 'Peter David Williams', 40, 15, 7, 'Junior Secondary School Year 2 - Gold Section'),
('JSS 2', 'Junior', 'Silver', '2024-2025', 1, 'John Paul Smith', 40, 10, 7, 'Junior Secondary School Year 2 - Silver Section'),
('JSS 3', 'Junior', 'Bronze', '2024-2025', 2, 'Mary Grace Johnson', 40, 18, 8, 'Junior Secondary School Year 3 - Bronze Section'),
('SSS 1', 'Senior', 'Gold', '2024-2025', 3, 'Peter David Williams', 35, 20, 9, 'Senior Secondary School Year 1 - Gold Section'),
('SSS 1', 'Senior', 'Silver', '2024-2025', 1, 'John Paul Smith', 35, 16, 9, 'Senior Secondary School Year 1 - Silver Section'),
('SSS 2', 'Senior', 'Gold', '2024-2025', 2, 'Mary Grace Johnson', 35, 14, 10, 'Senior Secondary School Year 2 - Gold Section'),
('SSS 2', 'Senior', 'Silver', '2024-2025', 3, 'Peter David Williams', 35, 22, 10, 'Senior Secondary School Year 2 - Silver Section'),
('SSS 3', 'Senior', 'Gold', '2024-2025', 1, 'John Paul Smith', 30, 25, 10, 'Senior Secondary School Year 3 - Gold Section');

-- Sample Academic Years
INSERT INTO academic_years (year_name, start_date, end_date, is_current, status, description) VALUES
('2023-2024', '2023-09-01', '2024-07-31', false, 'Completed', 'Academic Year 2023-2024'),
('2024-2025', '2024-09-01', '2025-07-31', true, 'Active', 'Current Academic Year 2024-2025'),
('2025-2026', '2025-09-01', '2026-07-31', false, 'Active', 'Upcoming Academic Year 2025-2026');

-- Sample Academic Terms
INSERT INTO academic_terms (term_name, academic_year_id, start_date, end_date, is_current, status, description) VALUES
('First Term', 2, '2024-09-01', '2024-12-15', false, 'Completed', 'First Term 2024-2025'),
('Second Term', 2, '2025-01-08', '2025-04-15', true, 'Active', 'Second Term 2024-2025'),
('Third Term', 2, '2025-04-22', '2025-07-31', false, 'Active', 'Third Term 2024-2025');

-- Sample Exams
INSERT INTO exams (exam_name, exam_type, exam_date, academic_year, term, status, description) VALUES
('First Term Mid-term Examination', 'Mid-term', '2024-10-15', '2024-2025', 'First Term', 'Completed', 'Mid-term examination for first term'),
('First Term Final Examination', 'Final', '2024-12-01', '2024-2025', 'First Term', 'Completed', 'Final examination for first term'),
('Second Term Mid-term Examination', 'Mid-term', '2025-02-15', '2024-2025', 'Second Term', 'Completed', 'Mid-term examination for second term'),
('Second Term Final Examination', 'Final', '2025-04-01', '2024-2025', 'Second Term', 'Scheduled', 'Final examination for second term'),
('Mathematics Quiz', 'Quiz', '2025-03-10', '2024-2025', 'Second Term', 'Scheduled', 'Mathematics subject quiz'),
('Science Project Presentation', 'Project', '2025-03-20', '2024-2025', 'Second Term', 'Scheduled', 'Science project presentations');

-- Grant necessary permissions (if using RLS)
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'Database setup completed successfully! All tables created with sample data.' as status;
