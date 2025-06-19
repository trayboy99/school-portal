-- Create test teachers for login
INSERT INTO teachers (teacher_id, first_name, surname, email, phone, department, subjects, classes, status) VALUES
('TCH001', 'John', 'Smith', 'john.smith@school.com', '08012345678', 'Mathematics', ARRAY['Mathematics', 'Further Mathematics'], ARRAY['JSS1A', 'JSS2B'], 'Active'),
('TCH002', 'Mary', 'Johnson', 'mary.johnson@school.com', '08087654321', 'English', ARRAY['English Language', 'Literature'], ARRAY['JSS1B', 'JSS3A'], 'Active'),
('TCH003', 'David', 'Wilson', 'david.wilson@school.com', '08098765432', 'Science', ARRAY['Physics', 'Chemistry'], ARRAY['SS1A', 'SS2A'], 'Active'),
('TCH004', 'Test', 'Teacher', 'test@teacher.com', '08011111111', 'General', ARRAY['Mathematics'], ARRAY['JSS1A'], 'Active')
ON CONFLICT (teacher_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  surname = EXCLUDED.surname,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  department = EXCLUDED.department,
  subjects = EXCLUDED.subjects,
  classes = EXCLUDED.classes,
  status = EXCLUDED.status;
