-- Create admin deadlines table for upload deadlines
DROP TABLE IF EXISTS admin_deadlines CASCADE;

CREATE TABLE admin_deadlines (
    id SERIAL PRIMARY KEY,
    deadline_type VARCHAR(50) NOT NULL, -- 'exam_questions', 'e_notes'
    deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(50) NOT NULL,
    created_by INTEGER, -- admin user id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes
CREATE INDEX idx_admin_deadlines_type ON admin_deadlines(deadline_type);
CREATE INDEX idx_admin_deadlines_active ON admin_deadlines(is_active);
CREATE INDEX idx_admin_deadlines_year_term ON admin_deadlines(academic_year, term);

-- Insert sample deadlines for current academic year
INSERT INTO admin_deadlines (deadline_type, deadline_date, academic_year, term, created_by, is_active) VALUES
('exam_questions', '2025-01-15 23:59:59+00', '2024-2025', 'Second Term', 1, true),
('e_notes', '2025-01-20 23:59:59+00', '2024-2025', 'Second Term', 1, true);

-- Verify the data
SELECT 
    id,
    deadline_type,
    deadline_date,
    academic_year,
    term,
    is_active,
    CASE 
        WHEN deadline_date > NOW() THEN 'Active'
        ELSE 'Expired'
    END as status
FROM admin_deadlines 
ORDER BY deadline_type;
