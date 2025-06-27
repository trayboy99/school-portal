-- =====================================================
-- ASSIGNMENT SYSTEM DATABASE SCRIPT (NO DUMMY DATA)
-- =====================================================

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS assignment_files CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;

-- =====================================================
-- 1. ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    subject_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    teacher_id INTEGER NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    total_marks INTEGER DEFAULT 100,
    assignment_type VARCHAR(50) DEFAULT 'homework', -- homework, project, essay, lab_report
    status VARCHAR(20) DEFAULT 'active', -- active, completed, draft, cancelled
    allow_late_submission BOOLEAN DEFAULT true,
    late_penalty_percent INTEGER DEFAULT 10, -- percentage deduction for late submissions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_total_marks CHECK (total_marks > 0),
    CONSTRAINT chk_late_penalty CHECK (late_penalty_percent >= 0 AND late_penalty_percent <= 100),
    CONSTRAINT chk_assignment_status CHECK (status IN ('active', 'completed', 'draft', 'cancelled')),
    CONSTRAINT chk_assignment_type CHECK (assignment_type IN ('homework', 'project', 'essay', 'lab_report', 'quiz', 'presentation'))
);

-- =====================================================
-- 2. ASSIGNMENT SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE assignment_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    submission_text TEXT,
    submission_file_url VARCHAR(500),
    submission_file_name VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN DEFAULT false,
    marks_obtained INTEGER,
    feedback TEXT,
    graded_at TIMESTAMP,
    graded_by INTEGER, -- teacher_id who graded
    grader_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'submitted', -- submitted, graded, returned, resubmitted
    
    -- Constraints
    UNIQUE(assignment_id, student_id), -- One submission per student per assignment
    CONSTRAINT chk_marks_obtained CHECK (marks_obtained >= 0),
    CONSTRAINT chk_submission_status CHECK (status IN ('submitted', 'graded', 'returned', 'resubmitted'))
);

-- =====================================================
-- 3. ASSIGNMENT FILES TABLE (for teacher uploads)
-- =====================================================
CREATE TABLE assignment_files (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50), -- pdf, doc, docx, ppt, etc.
    file_size INTEGER, -- in bytes
    uploaded_by INTEGER NOT NULL, -- teacher_id
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_file_size CHECK (file_size > 0)
);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX idx_assignments_class_name ON assignments(class_name);
CREATE INDEX idx_assignments_subject_name ON assignments(subject_name);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignments_status ON assignments(status);

CREATE INDEX idx_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX idx_submissions_status ON assignment_submissions(status);
CREATE INDEX idx_submissions_submitted_at ON assignment_submissions(submitted_at);

CREATE INDEX idx_assignment_files_assignment_id ON assignment_files(assignment_id);

-- =====================================================
-- 5. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update assignment status based on submissions
CREATE OR REPLACE FUNCTION update_assignment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update assignment status to completed if all students have submitted and been graded
    UPDATE assignments 
    SET status = 'completed',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.assignment_id 
    AND status = 'active'
    AND NOT EXISTS (
        SELECT 1 FROM students s 
        WHERE s.class = (SELECT class_name FROM assignments WHERE id = NEW.assignment_id)
        AND NOT EXISTS (
            SELECT 1 FROM assignment_submissions sub 
            WHERE sub.assignment_id = NEW.assignment_id 
            AND sub.student_id = s.id 
            AND sub.status = 'graded'
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update assignment status when submissions are graded
CREATE TRIGGER trigger_update_assignment_status
    AFTER UPDATE ON assignment_submissions
    FOR EACH ROW
    WHEN (NEW.status = 'graded' AND OLD.status != 'graded')
    EXECUTE FUNCTION update_assignment_status();

-- Function to check if submission is late
CREATE OR REPLACE FUNCTION check_late_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if submission is after due date
    NEW.is_late := (
        SELECT NEW.submitted_at > a.due_date 
        FROM assignments a 
        WHERE a.id = NEW.assignment_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically mark late submissions
CREATE TRIGGER trigger_check_late_submission
    BEFORE INSERT OR UPDATE ON assignment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION check_late_submission();

-- =====================================================
-- 6. VIEWS FOR EASY DATA RETRIEVAL
-- =====================================================

-- View for assignment statistics
CREATE OR REPLACE VIEW assignment_statistics AS
SELECT 
    a.id,
    a.title,
    a.class_name,
    a.subject_name,
    a.teacher_name,
    a.due_date,
    a.total_marks,
    a.status,
    -- Count total students in class
    (SELECT COUNT(*) FROM students s WHERE s.class = a.class_name) as total_students,
    -- Count submissions
    COUNT(sub.id) as total_submissions,
    -- Count graded submissions
    COUNT(CASE WHEN sub.status = 'graded' THEN 1 END) as graded_submissions,
    -- Count late submissions
    COUNT(CASE WHEN sub.is_late = true THEN 1 END) as late_submissions,
    -- Calculate average marks
    ROUND(AVG(sub.marks_obtained), 2) as average_marks,
    -- Calculate submission percentage
    CASE 
        WHEN (SELECT COUNT(*) FROM students s WHERE s.class = a.class_name) > 0 THEN
            ROUND((COUNT(sub.id)::DECIMAL / (SELECT COUNT(*) FROM students s WHERE s.class = a.class_name)::DECIMAL) * 100, 2)
        ELSE 0 
    END as submission_percentage
FROM assignments a
LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id
GROUP BY a.id, a.title, a.class_name, a.subject_name, a.teacher_name, a.due_date, a.total_marks, a.status
ORDER BY a.due_date DESC;

-- View for teacher assignment dashboard
CREATE OR REPLACE VIEW teacher_assignment_dashboard AS
SELECT 
    t.id as teacher_id,
    t.first_name || ' ' || COALESCE(t.middle_name || ' ', '') || t.surname as teacher_name,
    COUNT(a.id) as total_assignments,
    COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_assignments,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_assignments,
    COUNT(CASE WHEN a.due_date < CURRENT_TIMESTAMP AND a.status = 'active' THEN 1 END) as overdue_assignments,
    COUNT(sub.id) as total_submissions,
    COUNT(CASE WHEN sub.status = 'graded' THEN 1 END) as graded_submissions
FROM teachers t
LEFT JOIN assignments a ON t.id = a.teacher_id
LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id
GROUP BY t.id, t.first_name, t.middle_name, t.surname
ORDER BY t.first_name, t.surname;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ CLEAN ASSIGNMENT SYSTEM CREATED SUCCESSFULLY!';
    RAISE NOTICE '📊 Tables: assignments, assignment_submissions, assignment_files';
    RAISE NOTICE '📈 Views: assignment_statistics, teacher_assignment_dashboard';
    RAISE NOTICE '🔧 Triggers: Auto status updates, late submission detection';
    RAISE NOTICE '🧹 NO DUMMY DATA - Ready for production!';
    RAISE NOTICE '🚀 Ready for real assignments!';
END $$;
