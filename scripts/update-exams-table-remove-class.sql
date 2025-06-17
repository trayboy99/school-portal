-- Remove class column from exams table and update constraints
-- Since exams should be system-wide, not class-specific

-- Drop the existing unique constraint that includes class
ALTER TABLE exams DROP CONSTRAINT IF EXISTS exams_exam_name_class_year_term_mark_type_session_key;

-- Remove the class column
ALTER TABLE exams DROP COLUMN IF EXISTS class;

-- Add new unique constraint without class
ALTER TABLE exams ADD CONSTRAINT exams_unique_system_wide 
    UNIQUE(exam_name, year, term, mark_type, session);

-- Add comment to clarify the table purpose
COMMENT ON TABLE exams IS 'System-wide exams that apply to all classes. Class-specific data is handled in student_exams table.';
