-- This script will be run after the main table creation
-- Insert sample academic years
INSERT INTO academic_years (name, start_date, end_date, is_current, is_active) VALUES
('2023-2024', '2023-09-01', '2024-06-30', true, true),
('2024-2025', '2024-09-01', '2025-06-30', false, true),
('2022-2023', '2022-09-01', '2023-06-30', false, false),
('2025-2026', '2025-09-01', '2026-06-30', false, true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample academic terms
-- First, get the academic year IDs
DO $$
DECLARE
    year_2023_id UUID;
    year_2024_id UUID;
    year_2022_id UUID;
    year_2025_id UUID;
BEGIN
    SELECT id INTO year_2023_id FROM academic_years WHERE name = '2023-2024';
    SELECT id INTO year_2024_id FROM academic_years WHERE name = '2024-2025';
    SELECT id INTO year_2022_id FROM academic_years WHERE name = '2022-2023';
    SELECT id INTO year_2025_id FROM academic_years WHERE name = '2025-2026';
    
    -- Insert terms for 2023-2024 (current year)
    INSERT INTO academic_terms (name, academic_year_id, start_date, end_date, is_current, is_active, description) VALUES
    ('First Term', year_2023_id, '2023-09-01', '2023-12-15', true, true, 'First term of the 2023-2024 academic year'),
    ('Second Term', year_2023_id, '2024-01-08', '2024-04-15', false, true, 'Second term of the 2023-2024 academic year'),
    ('Third Term', year_2023_id, '2024-04-22', '2024-06-30', false, true, 'Third term of the 2023-2024 academic year');
    
    -- Insert terms for 2024-2025 (next year)
    INSERT INTO academic_terms (name, academic_year_id, start_date, end_date, is_current, is_active, description) VALUES
    ('First Term', year_2024_id, '2024-09-01', '2024-12-15', false, true, 'First term of the 2024-2025 academic year'),
    ('Second Term', year_2024_id, '2025-01-08', '2025-04-15', false, true, 'Second term of the 2024-2025 academic year'),
    ('Third Term', year_2024_id, '2025-04-22', '2025-06-30', false, true, 'Final term of 2024-2025')
    ON CONFLICT (name, academic_year_id) DO NOTHING;
    
    -- Insert terms for 2022-2023 (previous year - inactive)
    INSERT INTO academic_terms (name, academic_year_id, start_date, end_date, is_current, is_active, description) VALUES
    ('First Term', year_2022_id, '2022-09-01', '2022-12-15', false, false, 'First term of the 2022-2023 academic year'),
    ('Second Term', year_2022_id, '2023-01-08', '2023-04-15', false, false, 'Second term of the 2022-2023 academic year'),
    ('Third Term', year_2022_id, '2023-04-22', '2023-06-30', false, false, 'Third term of the 2022-2023 academic year');
END $$;
