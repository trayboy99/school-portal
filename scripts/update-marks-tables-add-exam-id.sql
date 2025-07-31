-- Add exam_id column to midterm_scores table
ALTER TABLE midterm_scores 
ADD COLUMN IF NOT EXISTS exam_id INTEGER REFERENCES exams(id);

-- Add exam_id column to terminal_scores table  
ALTER TABLE terminal_scores 
ADD COLUMN IF NOT EXISTS exam_id INTEGER REFERENCES exams(id);

-- Add exam_name column for easier querying
ALTER TABLE midterm_scores 
ADD COLUMN IF NOT EXISTS exam_name TEXT;

ALTER TABLE terminal_scores 
ADD COLUMN IF NOT EXISTS exam_name TEXT;

-- Add foreign key constraints to link to exams table
DO $$
BEGIN
    -- Add foreign key for midterm_scores if exams table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exams') THEN
        -- Drop existing constraint if it exists
        ALTER TABLE midterm_scores DROP CONSTRAINT IF EXISTS fk_midterm_exam;
        
        -- Add new foreign key constraint
        ALTER TABLE midterm_scores ADD CONSTRAINT fk_midterm_exam 
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE;
        
        -- Drop existing constraint if it exists
        ALTER TABLE terminal_scores DROP CONSTRAINT IF EXISTS fk_terminal_exam;
        
        -- Add new foreign key constraint
        ALTER TABLE terminal_scores ADD CONSTRAINT fk_terminal_exam 
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Foreign keys already exist, ignore
        NULL;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_midterm_scores_exam_id ON midterm_scores(exam_id);
CREATE INDEX IF NOT EXISTS idx_terminal_scores_exam_id ON terminal_scores(exam_id);

-- Update the unique constraint to include exam_id
DO $$
BEGIN
    -- Drop existing unique constraints if they exist
    ALTER TABLE midterm_scores DROP CONSTRAINT IF EXISTS midterm_scores_student_id_subject_id_class_id_academic_year_academic_term_key;
    ALTER TABLE terminal_scores DROP CONSTRAINT IF EXISTS terminal_scores_student_id_subject_id_class_id_academic_year_academic_term_key;
    
    -- Add new unique constraints with exam_id
    ALTER TABLE midterm_scores ADD CONSTRAINT unique_midterm_score 
    UNIQUE(student_id, exam_id, subject_id, class_id, academic_year_id, academic_term_id);
    
    ALTER TABLE terminal_scores ADD CONSTRAINT unique_terminal_score 
    UNIQUE(student_id, exam_id, subject_id, class_id, academic_year_id, academic_term_id);
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraints already exist, ignore
        NULL;
END $$;

-- Update existing records to have a default exam_id (optional, for existing data)
-- You may want to create a default exam first or handle this manually
