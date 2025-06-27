-- Create admin deadlines table for upload deadlines
CREATE TABLE IF NOT EXISTS admin_deadlines (
    id SERIAL PRIMARY KEY,
    deadline_type VARCHAR(50) NOT NULL UNIQUE, -- 'exam_questions', 'e_notes'
    deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(50) NOT NULL,
    created_by INTEGER, -- admin user id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_deadlines_type ON admin_deadlines(deadline_type);
CREATE INDEX IF NOT EXISTS idx_admin_deadlines_active ON admin_deadlines(is_active);

-- Insert sample deadlines for current academic year
INSERT INTO admin_deadlines (deadline_type, deadline_date, academic_year, term, created_by) VALUES
('exam_questions', '2024-12-31 23:59:59', '2024-2025', 'First Term', 1),
('e_notes', '2024-12-25 23:59:59', '2024-2025', 'First Term', 1)
ON CONFLICT (deadline_type) DO UPDATE SET
    deadline_date = EXCLUDED.deadline_date,
    academic_year = EXCLUDED.academic_year,
    term = EXCLUDED.term,
    updated_at = CURRENT_TIMESTAMP;

-- Update uploads table to remove deadline field (it will come from admin_deadlines)
ALTER TABLE uploads DROP COLUMN IF EXISTS deadline;

-- Add deadline_type to uploads to link with admin deadlines
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS deadline_type VARCHAR(50);

-- Update existing uploads to have deadline_type
UPDATE uploads SET deadline_type = file_type WHERE deadline_type IS NULL;

-- Verify the changes
SELECT 'Admin deadlines table created successfully' as status;
SELECT * FROM admin_deadlines;
