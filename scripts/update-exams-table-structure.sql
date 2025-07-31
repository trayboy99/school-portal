-- Update exams table structure for midterm and terminal exams with end_date
DO $$ 
BEGIN
    -- First, drop ALL existing check constraints on exam_type and status
    DECLARE
        constraint_record RECORD;
    BEGIN
        -- Drop all check constraints on the exams table
        FOR constraint_record IN 
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'exams' 
            AND constraint_type = 'CHECK'
        LOOP
            EXECUTE 'ALTER TABLE exams DROP CONSTRAINT IF EXISTS "' || constraint_record.constraint_name || '"';
            RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
        END LOOP;
    END;

    -- Add end_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'end_date'
    ) THEN
        ALTER TABLE exams ADD COLUMN end_date DATE;
        RAISE NOTICE 'Added end_date column to exams table';
    ELSE
        RAISE NOTICE 'end_date column already exists in exams table';
    END IF;

    -- Now update existing exam types (no constraints blocking us)
    -- Convert 'final' to 'terminal'
    UPDATE exams SET exam_type = 'terminal' WHERE exam_type = 'final';
    RAISE NOTICE 'Updated final exams to terminal';
    
    -- Convert 'quiz' and 'test' to 'midterm'
    UPDATE exams SET exam_type = 'midterm' WHERE exam_type IN ('quiz', 'test');
    RAISE NOTICE 'Updated quiz and test exams to midterm';
    
    -- Update existing records to set end_date (assuming exams last 1 day by default)
    UPDATE exams SET end_date = exam_date WHERE end_date IS NULL;
    RAISE NOTICE 'Set end_date for existing exams';
    
    -- Now add the new check constraints
    ALTER TABLE exams ADD CONSTRAINT exams_exam_type_check 
    CHECK (exam_type IN ('midterm', 'terminal'));
    RAISE NOTICE 'Added new exam_type check constraint';
    
    ALTER TABLE exams ADD CONSTRAINT exams_status_check 
    CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled'));
    RAISE NOTICE 'Added new status check constraint';
    
    RAISE NOTICE 'Updated exams table structure successfully';
END $$;

-- Create function to automatically update exam status based on dates
CREATE OR REPLACE FUNCTION update_exam_status()
RETURNS void AS $$
BEGIN
    -- Update status to 'completed' for exams where end_date has passed
    UPDATE exams 
    SET status = 'completed', updated_at = NOW()
    WHERE end_date < CURRENT_DATE 
    AND status = 'scheduled';
    
    -- Update status to 'ongoing' for exams that started today but haven't ended
    UPDATE exams 
    SET status = 'ongoing', updated_at = NOW()
    WHERE exam_date = CURRENT_DATE 
    AND end_date >= CURRENT_DATE 
    AND status = 'scheduled';
    
    RAISE NOTICE 'Updated exam statuses based on current date';
END;
$$ LANGUAGE plpgsql;

-- Verify the changes
SELECT id, name, exam_type, exam_date, end_date, status, created_at, updated_at 
FROM exams 
ORDER BY exam_date;

-- Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exams'
ORDER BY ordinal_position;
