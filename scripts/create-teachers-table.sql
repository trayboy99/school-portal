CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255),
  
  -- Personal Information
  first_name VARCHAR(100),
  middle_name VARCHAR(100),
  surname VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  avatar TEXT, -- For storing teacher photo URL or base64
  
  -- Professional Information
  department VARCHAR(100),
  subjects TEXT[],
  qualification VARCHAR(255),
  experience VARCHAR(100),
  
  -- Employment Information
  employment_type VARCHAR(50),
  salary VARCHAR(100),
  hire_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active',
  
  -- Emergency Contact
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT teachers_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Insert sample teacher data
INSERT INTO teachers (
  employee_id, username, password, first_name, surname, 
  email, department, subjects, phone, qualification, experience,
  employment_type, status
) VALUES 
(
  'TCH001', 'teacher1', 'teacher123', 'Sarah', 'Smith',
  'sarah.smith@westminster.edu', 'Mathematics', ARRAY['Mathematics', 'Statistics'], 
  '123-456-7892', 'MSc Mathematics', '5 years', 'Full-time', 'active'
),
(
  'TCH002', 'teacher2', 'teacher123', 'Michael', 'Brown',
  'michael.brown@westminster.edu', 'Science', ARRAY['Physics', 'Chemistry'], 
  '123-456-7895', 'PhD Physics', '8 years', 'Full-time', 'active'
)
ON CONFLICT (username) DO NOTHING;
