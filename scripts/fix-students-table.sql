-- First, let's see what we currently have
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'students';

-- Check current columns in students table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- Drop and recreate the students table with the correct structure
DROP TABLE IF EXISTS students CASCADE;

-- Create the complete students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    admission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Student photo
    avatar TEXT,
    
    -- Name fields (separate for form compatibility)
    surname VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    first_name VARCHAR(100) NOT NULL,
    name VARCHAR(300), -- Combined name for compatibility
    
    -- Contact information
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    -- Personal details
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    address TEXT, -- Using 'address' for compatibility
    home_address TEXT, -- Also keeping home_address
    
    -- Academic information
    class VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL,
    
    -- Parent information
    parent_name VARCHAR(200) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(255),
    
    -- Login credentials
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    credential_method VARCHAR(20) DEFAULT 'auto',
    credentials_sent_to VARCHAR(20)
);

-- Create indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_roll_no ON students(roll_no);
CREATE INDEX idx_students_class_section ON students(class, section);

-- Insert sample data to test
INSERT INTO students (
    roll_no, surname, middle_name, first_name, name, email, phone,
    date_of_birth, gender, address, home_address, class, section,
    parent_name, parent_phone, parent_email,
    credential_method, credentials_sent_to, avatar
) VALUES 
(
    '2024001', 'Doe', 'Michael', 'John', 'John Michael Doe', 
    'john.doe@email.com', '+234 801 234 5678',
    '2010-05-20', 'Male', '123 Main Street, Lagos', '123 Main Street, Lagos',
    'JSS 1', 'Gold', 'Jane Doe', '+234 802 345 6789', 'jane.doe@email.com',
    'auto', 'parent', '/placeholder.svg?height=40&width=40'
),
(
    '2024002', 'Smith', 'Grace', 'Sarah', 'Sarah Grace Smith',
    'sarah.smith@email.com', '+234 803 456 7890',
    '2009-08-15', 'Female', '456 Oak Avenue, Abuja', '456 Oak Avenue, Abuja',
    'JSS 2', 'Silver', 'Robert Smith', '+234 804 567 8901', 'robert.smith@email.com',
    'email-setup', 'both', '/placeholder.svg?height=40&width=40'
);

-- Verify the data was inserted
SELECT COUNT(*) as total_students FROM students;
SELECT roll_no, name, email, class, section FROM students;
