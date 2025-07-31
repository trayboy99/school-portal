-- Create midterm_scores table
CREATE TABLE IF NOT EXISTS midterm_scores (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    academic_term VARCHAR(50) NOT NULL,
    ca1_score DECIMAL(5,2) DEFAULT 0 CHECK (ca1_score >= 0 AND ca1_score <= 10),
    ca2_score DECIMAL(5,2) DEFAULT 0 CHECK (ca2_score >= 0 AND ca2_score <= 10),
    exam_score DECIMAL(5,2) DEFAULT 0 CHECK (exam_score >= 0 AND exam_score <= 20),
    total_score DECIMAL(5,2) DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 40),
    percentage INTEGER DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
    grade VARCHAR(2) DEFAULT 'F' CHECK (grade IN ('A', 'B', 'C', 'D', 'E', 'F')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, subject_id, class_id, academic_year, academic_term)
);

-- Create terminal_scores table
CREATE TABLE IF NOT EXISTS terminal_scores (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    academic_term VARCHAR(50) NOT NULL,
    ca1_score DECIMAL(5,2) DEFAULT 0 CHECK (ca1_score >= 0 AND ca1_score <= 20),
    ca2_score DECIMAL(5,2) DEFAULT 0 CHECK (ca2_score >= 0 AND ca2_score <= 20),
    exam_score DECIMAL(5,2) DEFAULT 0 CHECK (exam_score >= 0 AND exam_score <= 60),
    total_score DECIMAL(5,2) DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
    grade VARCHAR(2) DEFAULT 'F' CHECK (grade IN ('A', 'B', 'C', 'D', 'E', 'F')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, subject_id, class_id, academic_year, academic_term)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_midterm_scores_student_id ON midterm_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_midterm_scores_subject_id ON midterm_scores(subject_id);
CREATE INDEX IF NOT EXISTS idx_midterm_scores_class_id ON midterm_scores(class_id);
CREATE INDEX IF NOT EXISTS idx_midterm_scores_academic ON midterm_scores(academic_year, academic_term);

CREATE INDEX IF NOT EXISTS idx_terminal_scores_student_id ON terminal_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_terminal_scores_subject_id ON terminal_scores(subject_id);
CREATE INDEX IF NOT EXISTS idx_terminal_scores_class_id ON terminal_scores(class_id);
CREATE INDEX IF NOT EXISTS idx_terminal_scores_academic ON terminal_scores(academic_year, academic_term);

-- Add foreign key constraints if the referenced tables exist
DO $$
BEGIN
    -- Add foreign key for students table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
        ALTER TABLE midterm_scores ADD CONSTRAINT fk_midterm_student 
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
        
        ALTER TABLE terminal_scores ADD CONSTRAINT fk_terminal_student 
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for subjects table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subjects') THEN
        ALTER TABLE midterm_scores ADD CONSTRAINT fk_midterm_subject 
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;
        
        ALTER TABLE terminal_scores ADD CONSTRAINT fk_terminal_subject 
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for classes table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'classes') THEN
        ALTER TABLE midterm_scores ADD CONSTRAINT fk_midterm_class 
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;
        
        ALTER TABLE terminal_scores ADD CONSTRAINT fk_terminal_class 
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Foreign keys already exist, ignore
        NULL;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_midterm_scores_updated_at ON midterm_scores;
CREATE TRIGGER update_midterm_scores_updated_at 
    BEFORE UPDATE ON midterm_scores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_terminal_scores_updated_at ON terminal_scores;
CREATE TRIGGER update_terminal_scores_updated_at 
    BEFORE UPDATE ON terminal_scores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
