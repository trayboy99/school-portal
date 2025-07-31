-- Drop the exams table if it exists
DROP TABLE IF EXISTS exams;

-- Create the simplified exams table without class relationships
CREATE TABLE exams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  exam_type VARCHAR(50) NOT NULL CHECK (exam_type IN ('midterm', 'final', 'quiz', 'test')),
  academic_year_id INTEGER NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  academic_term_id INTEGER NOT NULL REFERENCES academic_terms(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_exams_academic_year ON exams(academic_year_id);
CREATE INDEX idx_exams_academic_term ON exams(academic_term_id);
CREATE INDEX idx_exams_date ON exams(exam_date);
CREATE INDEX idx_exams_status ON exams(status);

-- Insert sample data
INSERT INTO exams (name, exam_type, academic_year_id, academic_term_id, exam_date, status) VALUES
('First Term Midterm Exam', 'midterm', 1, 1, '2024-02-15', 'scheduled'),
('First Term Final Exam', 'final', 1, 1, '2024-03-20', 'scheduled'),
('Second Term Quiz', 'quiz', 1, 2, '2024-05-10', 'completed'),
('Second Term Midterm Exam', 'midterm', 1, 2, '2024-06-15', 'scheduled'),
('Annual Final Examination', 'final', 1, 3, '2024-11-25', 'scheduled');
