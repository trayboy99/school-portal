-- Add is_elective column to subjects table
DO $$ 
BEGIN
    -- Check if the column doesn't exist and add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subjects' 
        AND column_name = 'is_elective'
    ) THEN
        ALTER TABLE subjects ADD COLUMN is_elective BOOLEAN DEFAULT false;
        
        -- Update existing records to set appropriate elective values
        -- Core subjects should not be elective
        UPDATE subjects SET is_elective = false WHERE is_core = true;
        
        -- Set some non-core subjects as elective
        UPDATE subjects SET is_elective = true WHERE subject_code IN ('GEO', 'HIST', 'ECON', 'CS', 'ART');
        
        RAISE NOTICE 'Added is_elective column to subjects table';
    ELSE
        RAISE NOTICE 'is_elective column already exists in subjects table';
    END IF;
END $$;

-- Verify the changes
SELECT subject_name, subject_code, is_core, is_elective, department 
FROM subjects 
ORDER BY subject_name;
