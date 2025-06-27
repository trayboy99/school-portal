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

-- Update uploads table to store weeks as JSON array for better querying
ALTER TABLE uploads 
ADD COLUMN IF NOT EXISTS week_numbers INTEGER[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS week_range_start INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS week_range_end INTEGER DEFAULT NULL;

-- Create index for better week-based queries
CREATE INDEX IF NOT EXISTS idx_uploads_week_numbers ON uploads USING GIN (week_numbers);
CREATE INDEX IF NOT EXISTS idx_uploads_week_range ON uploads (week_range_start, week_range_end);

-- Create function to update week arrays when weeks column is updated
CREATE OR REPLACE FUNCTION update_week_numbers()
RETURNS TRIGGER AS $$
BEGIN
    -- Parse weeks string and extract numbers
    IF NEW.weeks IS NOT NULL AND NEW.weeks != '' THEN
        -- Extract week numbers from strings like "Week 1-4", "Week 5,7,9", etc.
        NEW.week_numbers := ARRAY(
            SELECT DISTINCT unnest(
                CASE 
                    -- Handle ranges like "Week 1-4" or "1-4"
                    WHEN NEW.weeks ~ '\d+-\d+' THEN
                        (SELECT array_agg(generate_series(
                            (regexp_match(NEW.weeks, '(\d+)-\d+'))[1]::integer,
                            (regexp_match(NEW.weeks, '\d+-(\d+)'))[1]::integer
                        )))
                    -- Handle comma-separated like "Week 1,3,5" or "1,3,5"
                    WHEN NEW.weeks ~ '\d+(,\s*\d+)+' THEN
                        (SELECT array_agg((regexp_split_to_table(
                            regexp_replace(NEW.weeks, '[^\d,]', '', 'g'), 
                            ','
                        ))::integer))
                    -- Handle single week like "Week 5" or "5"
                    ELSE
                        ARRAY[(regexp_match(NEW.weeks, '(\d+)'))[1]::integer]
                END
            )
            ORDER BY 1
        );
        
        -- Set range start and end
        IF array_length(NEW.week_numbers, 1) > 0 THEN
            NEW.week_range_start := NEW.week_numbers[1];
            NEW.week_range_end := NEW.week_numbers[array_length(NEW.week_numbers, 1)];
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update week numbers
DROP TRIGGER IF EXISTS trigger_update_week_numbers ON uploads;
CREATE TRIGGER trigger_update_week_numbers
    BEFORE INSERT OR UPDATE ON uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_week_numbers();

-- Update existing records to populate week numbers
UPDATE uploads 
SET weeks = weeks 
WHERE upload_type = 'e_notes' AND weeks IS NOT NULL;

-- Verify the setup
SELECT 'Weeks system created successfully' as status;
SELECT COUNT(*) as total_weeks FROM academic_weeks WHERE is_active = true;
SELECT COUNT(*) as e_notes_with_weeks FROM uploads WHERE upload_type = 'e_notes' AND week_numbers IS NOT NULL;
