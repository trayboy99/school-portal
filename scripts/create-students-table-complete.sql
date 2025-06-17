-- Drop existing students table if it exists (be careful in production!)
DROP TABLE IF EXISTS students CASCADE;

-- Create comprehensive students table with all required fields
CREATE TABLE students (
    -- Primary key and system fields
    id SERIAL PRIMARY KEY,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Graduated')),
    admission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Student photo/image
    avatar TEXT, -- URL or base64 image data
    
    -- Personal information
    surname VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    first_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(300) GENERATED ALWAYS AS (
        TRIM(CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', surname))
    ) STORED,
    
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
    
    -- Emergency contact (additional)
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(20),
    
    -- Medical information (optional)
    medical_info TEXT,
    
    -- Login credentials
    username VARCHAR(100) UNIQUE, -- If custom username, otherwise use email
    password_hash VARCHAR(255), -- Hashed password
    credential_method VARCHAR(20) DEFAULT 'auto' CHECK (credential_method IN ('auto', 'manual', 'email-setup')),
    credentials_sent_to VARCHAR(20) CHECK (credentials_sent_to IN ('student', 'parent', 'both')),
    setup_token VARCHAR(255), -- For email setup links
    setup_token_expires TIMESTAMP WITH TIME ZONE, -- Token expiration
    password_reset_required BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Additional metadata
    notes TEXT,
    tags TEXT[], -- Array of tags for categorization
    
    -- Audit fields
    created_by INTEGER, -- Reference to user who created the record
    updated_by INTEGER  -- Reference to user who last updated the record
);

-- Create indexes for better performance
CREATE INDEX idx_students_roll_no ON students(roll_no);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_username ON students(username);
CREATE INDEX idx_students_class_section ON students(class, section);
CREATE INDEX idx_students_parent_email ON students(parent_email);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_admission_date ON students(admission_date);
CREATE INDEX idx_students_full_name ON students(full_name);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data to test the table
INSERT INTO students (
    roll_no, surname, middle_name, first_name, email, phone,
    date_of_birth, gender, home_address, class, section,
    parent_name, parent_phone, parent_email,
    credential_method, credentials_sent_to,
    avatar
) VALUES 
(
    '2024001', 'Doe', 'Michael', 'John', 'john.doe@email.com', '+234 801 234 5678',
    '2010-05-20', 'Male', '123 Main Street, Lagos, Nigeria', 'JSS 1', 'Gold',
    'Jane Doe', '+234 802 345 6789', 'jane.doe@email.com',
    'auto', 'parent',
    '/placeholder.svg?height=40&width=40'
),
(
    '2024002', 'Smith', 'Grace', 'Sarah', 'sarah.smith@email.com', '+234 803 456 7890',
    '2009-08-15', 'Female', '456 Oak Avenue, Abuja, Nigeria', 'JSS 2', 'Silver',
    'Robert Smith', '+234 804 567 8901', 'robert.smith@email.com',
    'email-setup', 'both',
    '/placeholder.svg?height=40&width=40'
),
(
    '2024003', 'Johnson', NULL, 'David', 'david.johnson@email.com', '+234 805 678 9012',
    '2011-03-10', 'Male', '789 Pine Road, Port Harcourt, Nigeria', 'JSS 1', 'Gold',
    'Mary Johnson', '+234 806 789 0123', 'mary.johnson@email.com',
    'manual', 'student',
    '/placeholder.svg?height=40&width=40'
);

-- Create a view for easy student information retrieval
CREATE OR REPLACE VIEW student_summary AS
SELECT 
    id,
    roll_no,
    full_name,
    email,
    phone,
    class,
    section,
    parent_name,
    parent_phone,
    parent_email,
    status,
    admission_date,
    age_years,
    credential_method,
    last_login,
    created_at
FROM students,
LATERAL (
    SELECT EXTRACT(YEAR FROM AGE(date_of_birth)) AS age_years
) ages;

-- Grant appropriate permissions (adjust based on your needs)
-- GRANT SELECT, INSERT, UPDATE ON students TO authenticated;
-- GRANT SELECT ON student_summary TO authenticated;

-- Display table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;
