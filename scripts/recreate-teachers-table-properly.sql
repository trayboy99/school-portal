-- Drop and recreate teachers table with correct structure
DROP TABLE IF EXISTS teachers CASCADE;

-- Create teachers table with proper structure for authentication
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    teacher_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) NOT NULL,
    subjects TEXT[] DEFAULT '{}',
    classes TEXT[] DEFAULT '{}',
    qualification VARCHAR(200),
    experience INTEGER DEFAULT 0,
    hire_date DATE DEFAULT CURRENT_DATE,
    employment_type VARCHAR(50) DEFAULT 'Full-time',
    salary DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'Active',
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test teachers for login
INSERT INTO teachers (
    teacher_id, first_name, middle_name, surname, email, phone, 
    department, subjects, classes, status
) VALUES
('TCH001', 'John', NULL, 'Smith', 'test@teacher.com', '08012345678', 
 'Mathematics', ARRAY['Mathematics'], ARRAY['JSS1A'], 'Active'),
('TCH002', 'Mary', 'Jane', 'Johnson', 'mary@teacher.com', '08087654321', 
 'English', ARRAY['English'], ARRAY['JSS2A'], 'Active'),
('TCH003', 'Test', NULL, 'Teacher', 'teacher@test.com', '08011111111', 
 'Science', ARRAY['Physics', 'Chemistry'], ARRAY['JSS3A', 'JSS3B'], 'Active'),
('TCH004', 'Sarah', 'Ann', 'Wilson', 'sarah@teacher.com', '08099999999', 
 'Biology', ARRAY['Biology'], ARRAY['SS1A'], 'Active');

-- Create index for faster lookups
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_teachers_status ON teachers(status);
CREATE INDEX idx_teachers_teacher_id ON teachers(teacher_id);

-- Verify the table was created correctly
SELECT teacher_id, first_name, middle_name, surname, email, department, status 
FROM teachers;
