-- Drop existing table if it exists
DROP TABLE IF EXISTS upload_deadlines;

-- Create upload_deadlines table with proper foreign key relationships
CREATE TABLE upload_deadlines (
    id SERIAL PRIMARY KEY,
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id),
    academic_term_id INTEGER NOT NULL REFERENCES academic_terms(id),
    exam_questions_deadline TIMESTAMP WITH TIME ZONE,
    e_notes_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(academic_year_id, academic_term_id)
);

-- Create indexes for better performance
CREATE INDEX idx_upload_deadlines_academic_year ON upload_deadlines(academic_year_id);
CREATE INDEX idx_upload_deadlines_academic_term ON upload_deadlines(academic_term_id);
