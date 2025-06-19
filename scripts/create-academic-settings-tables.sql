-- Create academic calendar table for academic management settings
CREATE TABLE IF NOT EXISTS academic_calendar (
    id SERIAL PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    current_term VARCHAR(20) NOT NULL CHECK (current_term IN ('first', 'second', 'third')),
    term_start_date DATE NOT NULL,
    term_end_date DATE NOT NULL,
    exam_start_date DATE,
    exam_end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create exam types table for academic management
CREATE TABLE IF NOT EXISTS exam_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('midterm', 'terminal', 'test', 'assignment')),
    max_score INTEGER NOT NULL,
    term VARCHAR(20) NOT NULL CHECK (term IN ('first', 'second', 'third')),
    academic_year VARCHAR(20) NOT NULL,
    ca1_max INTEGER DEFAULT 0,
    ca2_max INTEGER DEFAULT 0,
    exam_max INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, term, academic_year)
);

-- Insert current academic year and terms
INSERT INTO academic_calendar (academic_year, current_term, term_start_date, term_end_date, exam_start_date, exam_end_date, status) VALUES
('2024-2025', 'first', '2024-09-01', '2024-12-15', '2024-12-01', '2024-12-15', 'active'),
('2024-2025', 'second', '2025-01-08', '2025-04-15', '2025-04-01', '2025-04-15', 'upcoming'),
('2024-2025', 'third', '2025-05-01', '2025-08-15', '2025-08-01', '2025-08-15', 'upcoming')
ON CONFLICT DO NOTHING;

-- Insert exam types based on academic settings
INSERT INTO exam_types (name, type, max_score, term, academic_year, ca1_max, ca2_max, exam_max, status) VALUES
-- First Term Exams
('First Term Mid-term Exam', 'midterm', 40, 'first', '2024-2025', 10, 10, 20, 'active'),
('First Term Terminal Exam', 'terminal', 100, 'first', '2024-2025', 20, 20, 60, 'active'),
('First Term Class Test 1', 'test', 20, 'first', '2024-2025', 0, 0, 20, 'active'),
('First Term Class Test 2', 'test', 20, 'first', '2024-2025', 0, 0, 20, 'active'),

-- Second Term Exams
('Second Term Mid-term Exam', 'midterm', 40, 'second', '2024-2025', 10, 10, 20, 'upcoming'),
('Second Term Terminal Exam', 'terminal', 100, 'second', '2024-2025', 20, 20, 60, 'upcoming'),
('Second Term Class Test 1', 'test', 20, 'second', '2024-2025', 0, 0, 20, 'upcoming'),

-- Third Term Exams
('Third Term Mid-term Exam', 'midterm', 40, 'third', '2024-2025', 10, 10, 20, 'upcoming'),
('Third Term Terminal Exam', 'terminal', 100, 'third', '2024-2025', 20, 20, 60, 'upcoming')
ON CONFLICT (name, term, academic_year) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_academic_calendar_year_term ON academic_calendar(academic_year, current_term);
CREATE INDEX IF NOT EXISTS idx_exam_types_term_year ON exam_types(term, academic_year);
CREATE INDEX IF NOT EXISTS idx_exam_types_status ON exam_types(status);
