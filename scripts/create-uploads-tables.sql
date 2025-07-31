-- Create upload deadlines table
CREATE TABLE IF NOT EXISTS upload_deadlines (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('exam_questions', 'e_notes')),
  academic_year VARCHAR(20) NOT NULL,
  academic_term VARCHAR(20) NOT NULL,
  deadline_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(type, academic_year, academic_term)
);

-- Create exam questions uploads table
CREATE TABLE IF NOT EXISTS exam_questions_uploads (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES teachers(id),
  academic_year VARCHAR(20) NOT NULL,
  academic_term VARCHAR(20) NOT NULL,
  subject_id INTEGER REFERENCES subjects(id),
  class_id INTEGER REFERENCES classes(id),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER, -- Can be teacher_id or admin_id
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted'))
);

-- Create e-notes uploads table
CREATE TABLE IF NOT EXISTS e_notes_uploads (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES teachers(id),
  academic_year VARCHAR(20) NOT NULL,
  academic_term VARCHAR(20) NOT NULL,
  subject_id INTEGER REFERENCES subjects(id),
  class_id INTEGER REFERENCES classes(id),
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 11),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER, -- Can be teacher_id or admin_id
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
  UNIQUE(teacher_id, academic_year, academic_term, subject_id, class_id, week_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_upload_deadlines_type_year_term ON upload_deadlines(type, academic_year, academic_term);
CREATE INDEX IF NOT EXISTS idx_exam_questions_teacher_year_term ON exam_questions_uploads(teacher_id, academic_year, academic_term);
CREATE INDEX IF NOT EXISTS idx_e_notes_teacher_year_term ON e_notes_uploads(teacher_id, academic_year, academic_term);
CREATE INDEX IF NOT EXISTS idx_e_notes_week ON e_notes_uploads(week_number);
