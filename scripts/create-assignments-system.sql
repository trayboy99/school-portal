-- =====================================================
-- COMPLETE ASSIGNMENT SYSTEM DATABASE SCRIPT
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

-- =====================================================
-- 7. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample assignments
INSERT INTO assignments (title, description, instructions, subject_name, class_name, teacher_id, teacher_name, due_date, total_marks, assignment_type) VALUES
-- English assignments
('Essay on Shakespeare', 'Write a comprehensive essay on Shakespeare''s impact on literature', 'Write a 500-word essay discussing Shakespeare''s influence on modern literature. Include at least 3 references.', 'English', 'JSS 2A', 2, 'Mary Johnson', CURRENT_TIMESTAMP + INTERVAL '7 days', 50, 'essay'),
('Grammar Exercise Set 1', 'Complete grammar exercises on tenses', 'Complete all exercises in Chapter 5 of your grammar book. Focus on past and present tenses.', 'English', 'JSS 1A', 2, 'Mary Johnson', CURRENT_TIMESTAMP + INTERVAL '3 days', 30, 'homework'),

-- Literature assignments  
('Poetry Analysis', 'Analyze the poem "The Road Not Taken"', 'Write a detailed analysis of Robert Frost''s poem. Discuss themes, literary devices, and personal interpretation.', 'Literature', 'JSS 3A', 2, 'Mary Johnson', CURRENT_TIMESTAMP + INTERVAL '10 days', 40, 'essay'),
('Book Report - Things Fall Apart', 'Write a comprehensive book report', 'Read "Things Fall Apart" by Chinua Achebe and write a 3-page report covering plot, characters, and themes.', 'Literature', 'JSS 2B', 2, 'Mary Johnson', CURRENT_TIMESTAMP + INTERVAL '14 days', 60, 'project'),

-- Mathematics assignments (if we have math teacher)
('Algebra Problem Set', 'Solve quadratic equations', 'Complete problems 1-20 from Chapter 8. Show all working steps clearly.', 'Mathematics', 'JSS 2A', 1, 'John Smith', CURRENT_TIMESTAMP + INTERVAL '5 days', 40, 'homework'),

-- Physics assignments
('Lab Report - Motion', 'Write lab report on motion experiment', 'Document your findings from the motion experiment conducted in class. Include data, analysis, and conclusions.', 'Physics', 'JSS 3A', 3, 'David Wilson', CURRENT_TIMESTAMP + INTERVAL '8 days', 45, 'lab_report');

-- Insert sample submissions (some students have submitted)
INSERT INTO assignment_submissions (assignment_id, student_id, student_name, class_name, submission_text, submitted_at, is_late, marks_obtained, feedback, graded_at, graded_by, grader_name, status) VALUES
-- Submissions for Essay on Shakespeare (assignment_id = 1)
(1, 1, 'Ahmed Bello', 'JSS 2A', 'Shakespeare has had a profound impact on literature...', CURRENT_TIMESTAMP - INTERVAL '1 day', false, 42, 'Good analysis but needs more examples', CURRENT_TIMESTAMP - INTERVAL '2 hours', 2, 'Mary Johnson', 'graded'),
(1, 2, 'Chioma Okoro', 'JSS 2A', 'William Shakespeare revolutionized English literature...', CURRENT_TIMESTAMP - INTERVAL '2 days', false, 45, 'Excellent work with good references', CURRENT_TIMESTAMP - INTERVAL '1 hour', 2, 'Mary Johnson', 'graded'),

-- Submissions for Grammar Exercise (assignment_id = 2)  
(2, 3, 'Kemi Adebayo', 'JSS 1A', 'Completed all grammar exercises as requested...', CURRENT_TIMESTAMP - INTERVAL '1 day', false, NULL, NULL, NULL, NULL, NULL, 'submitted'),
(2, 4, 'Tunde Okafor', 'JSS 1A', 'Grammar exercises completed with examples...', CURRENT_TIMESTAMP - INTERVAL '3 hours', false, NULL, NULL, NULL, NULL, NULL, 'submitted');

-- Insert sample assignment files
INSERT INTO assignment_files (assignment_id, file_name, file_url, file_type, file_size, uploaded_by) VALUES
(1, 'Shakespeare_Essay_Guidelines.pdf', '/uploads/assignments/shakespeare_guidelines.pdf', 'pdf', 245760, 2),
(1, 'Sample_Essay_Format.docx', '/uploads/assignments/essay_format.docx', 'docx', 156432, 2),
(2, 'Grammar_Exercise_Sheet.pdf', '/uploads/assignments/grammar_exercises.pdf', 'pdf', 189234, 2),
(3, 'Poetry_Analysis_Template.docx', '/uploads/assignments/poetry_template.docx', 'docx', 123456, 2),
(5, 'Algebra_Formula_Sheet.pdf', '/uploads/assignments/algebra_formulas.pdf', 'pdf', 298765, 1);

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 'assignments' as table_name, COUNT(*) as record_count FROM assignments
UNION ALL
SELECT 'assignment_submissions', COUNT(*) FROM assignment_submissions  
UNION ALL
SELECT 'assignment_files', COUNT(*) FROM assignment_files;

-- Show assignment statistics
SELECT * FROM assignment_statistics ORDER BY due_date;

-- Show teacher dashboard data
SELECT * FROM teacher_assignment_dashboard;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ ASSIGNMENT SYSTEM CREATED SUCCESSFULLY!';
    RAISE NOTICE '📊 Tables: assignments, assignment_submissions, assignment_files';
    RAISE NOTICE '📈 Views: assignment_statistics, teacher_assignment_dashboard';
    RAISE NOTICE '🔧 Triggers: Auto status updates, late submission detection';
    RAISE NOTICE '📝 Sample Data: 6 assignments, 4 submissions, 5 files';
    RAISE NOTICE '🚀 Ready for testing!';
END $$;
