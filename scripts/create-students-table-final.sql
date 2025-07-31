CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  custom_password VARCHAR(255),
  first_name VARCHAR(100),
  middle_name VARCHAR(100),
  surname VARCHAR(100),
  email VARCHAR(255),
  current_class VARCHAR(50),
  section VARCHAR(10),
  roll_number VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  phone VARCHAR(20),
  address TEXT,
  parent_name VARCHAR(200),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(255),
  admission_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample student data
INSERT INTO students (
  username, password_hash, custom_password, first_name, surname, 
  email, current_class, section, roll_number, gender, phone,
  parent_name, parent_phone, parent_email
) VALUES 
(
  'student1', 'student123', 'student123', 'John', 'Doe',
  'john.doe@student.westminster.edu', 'Grade 10', 'A', '001', 'Male', '123-456-7890',
  'Jane Doe', '123-456-7891', 'jane.doe@email.com'
),
(
  'student2', 'student123', 'student123', 'Alice', 'Johnson',
  'alice.johnson@student.westminster.edu', 'Grade 11', 'B', '002', 'Female', '123-456-7893',
  'Bob Johnson', '123-456-7894', 'bob.johnson@email.com'
)
ON CONFLICT (username) DO NOTHING;
