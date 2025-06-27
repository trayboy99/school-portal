-- Create sample assignments for JSS 2 class
-- First, let's check what teachers and subjects we have available

-- Insert sample assignments for JSS 2
INSERT INTO assignments (
    title, 
    description, 
    instructions,
    subject_name, 
    class_name, 
    teacher_id, 
    teacher_name, 
    due_date, 
    total_marks, 
    assignment_type,
    status,
    created_at,
    updated_at
) VALUES 
-- English Language Assignment
(
    'Essay Writing: My Future Career',
    'Write a comprehensive essay about your future career aspirations',
    'Write a 300-word essay about what you want to become in the future. Include: 1) What career you want, 2) Why you chose it, 3) What steps you will take to achieve it. Use proper grammar and spelling.',
    'English Language',
    'JSS 2',
    2, -- Assuming teacher ID 2 exists (Mary Johnson from our previous data)
    'Mary Johnson',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    50,
    'essay',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Mathematics Assignment  
(
    'Algebra Practice Set 3',
    'Solve algebraic equations and word problems',
    'Complete problems 1-15 from Chapter 8 of your mathematics textbook. Show all working steps clearly. Submit your solutions on paper with your name and class written clearly.',
    'Mathematics',
    'JSS 2',
    1, -- Assuming teacher ID 1 exists
    'John Smith',
    CURRENT_TIMESTAMP + INTERVAL '5 days',
    40,
    'homework',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Basic Science Assignment
(
    'Plant Structure Diagram',
    'Draw and label the parts of a flowering plant',
    'Draw a detailed diagram of a flowering plant showing: roots, stem, leaves, flowers, and fruits. Label each part clearly and write one function for each part. Use colored pencils and submit on A4 paper.',
    'Basic Science',
    'JSS 2',
    3, -- Assuming teacher ID 3 exists
    'David Wilson',
    CURRENT_TIMESTAMP + INTERVAL '10 days',
    30,
    'project',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Social Studies Assignment
(
    'Nigerian Independence Research',
    'Research and write about Nigeria\'s independence',
    'Research and write a 2-page report about Nigeria\'s independence in 1960. Include: 1) Key leaders involved, 2) Important events leading to independence, 3) Challenges faced after independence. Use at least 3 sources.',
    'Social Studies',
    'JSS 2',
    4, -- Assuming teacher ID 4 exists
    'Sarah Williams',
    CURRENT_TIMESTAMP + INTERVAL '14 days',
    60,
    'project',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- French Assignment
(
    'French Vocabulary Quiz Preparation',
    'Study French vocabulary for upcoming quiz',
    'Study the French vocabulary words from Lessons 1-5. Practice pronunciation and spelling. The quiz will cover: greetings, family members, colors, numbers 1-20, and days of the week.',
    'French',
    'JSS 2',
    5, -- Assuming teacher ID 5 exists
    'Pierre Dubois',
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    25,
    'homework',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Computer Studies Assignment
(
    'Microsoft Word Document Creation',
    'Create a formatted document using Microsoft Word',
    'Create a 1-page document about "The Importance of Computers in Education" using Microsoft Word. Include: title, at least 3 paragraphs, bullet points, and proper formatting (bold headings, different fonts). Save as "YourName_Computer_Assignment.docx"',
    'Computer Studies',
    'JSS 2',
    6, -- Assuming teacher ID 6 exists
    'Michael Tech',
    CURRENT_TIMESTAMP + INTERVAL '8 days',
    35,
    'project',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- One overdue assignment for testing
(
    'History Timeline Project',
    'Create a timeline of major events in Nigerian history',
    'Create a visual timeline showing 10 major events in Nigerian history from 1960 to present. Include dates, brief descriptions, and illustrations. Present on poster paper.',
    'Social Studies',
    'JSS 2',
    4,
    'Sarah Williams',
    CURRENT_TIMESTAMP - INTERVAL '3 days', -- This makes it overdue
    45,
    'project',
    'active',
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    CURRENT_TIMESTAMP - INTERVAL '10 days'
);

-- Verify the assignments were created
SELECT 'verification' as check_type, 
       COUNT(*) as total_assignments_created,
       MIN(due_date) as earliest_due_date,
       MAX(due_date) as latest_due_date
FROM assignments 
WHERE class_name = 'JSS 2';

-- Show all JSS 2 assignments
SELECT 'jss2_assignments_created' as check_type,
       id, title, subject_name, teacher_name, due_date, total_marks, status
FROM assignments 
WHERE class_name = 'JSS 2'
ORDER BY due_date;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ SAMPLE ASSIGNMENTS CREATED FOR JSS 2!';
    RAISE NOTICE '📚 Created 7 assignments across different subjects';
    RAISE NOTICE '📅 Mix of due dates - some pending, one overdue';
    RAISE NOTICE '👩‍🎓 Chioma should now see assignments in her dashboard';
    RAISE NOTICE '🔍 Check the Assignments section to verify';
END $$;
