-- Create weeks reference table for consistent week management
CREATE TABLE IF NOT EXISTS academic_weeks (
    id SERIAL PRIMARY KEY,
    week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 12),
    week_name VARCHAR(20) NOT NULL, -- e.g., "Week 1", "Week 2"
    week_description VARCHAR(100), -- e.g., "Introduction to Algebra"
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024-2025',
    term VARCHAR(50) NOT NULL DEFAULT 'Second Term',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique week numbers per term/year
    UNIQUE(week_number, academic_year, term)
);

-- Insert standard 12 weeks for current academic year/term
INSERT INTO academic_weeks (week_number, week_name, academic_year, term) VALUES
(1, 'Week 1', '2024-2025', 'Second Term'),
(2, 'Week 2', '2024-2025', 'Second Term'),
(3, 'Week 3', '2024-2025', 'Second Term'),
(4, 'Week 4', '2024-2025', 'Second Term'),
(5, 'Week 5', '2024-2025', 'Second Term'),
(6, 'Week 6', '2024-2025', 'Second Term'),
(7, 'Week 7', '2024-2025', 'Second Term'),
(8, 'Week 8', '2024-2025', 'Second Term'),
(9, 'Week 9', '2024-2025', 'Second Term'),
(10, 'Week 10', '2024-2025', 'Second Term'),
(11, 'Week 11', '2024-2025', 'Second Term'),
(12, 'Week 12', '2024-2025', 'Second Term')
ON CONFLICT (week_number, academic_year, term) DO NOTHING;

-- Add simple week columns to uploads table
ALTER TABLE uploads 
ADD COLUMN IF NOT EXISTS selected_weeks TEXT DEFAULT NULL; -- Store as comma-separated: "1,3,5"

-- Create index for better week-based queries
CREATE INDEX IF NOT EXISTS idx_uploads_selected_weeks ON uploads (selected_weeks);

-- Verify the setup
SELECT 'Simple weeks system created successfully' as status;
SELECT COUNT(*) as total_weeks FROM academic_weeks WHERE is_active = true;
