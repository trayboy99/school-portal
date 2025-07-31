-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS academic_terms CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;

-- Create academic_years table
CREATE TABLE academic_years (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academic_terms table
CREATE TABLE academic_terms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, academic_year_id)
);

-- Create triggers to ensure only one current academic year and term
CREATE OR REPLACE FUNCTION ensure_single_current_academic_year()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = true THEN
        UPDATE academic_years SET is_current = false WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_single_current_academic_term()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = true THEN
        UPDATE academic_terms SET is_current = false WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_single_current_academic_year
    BEFORE INSERT OR UPDATE ON academic_years
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_current_academic_year();

CREATE TRIGGER trigger_single_current_academic_term
    BEFORE INSERT OR UPDATE ON academic_terms
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_current_academic_term();

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_academic_years_updated_at
    BEFORE UPDATE ON academic_years
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_terms_updated_at
    BEFORE UPDATE ON academic_terms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO academic_years (name, start_date, end_date, is_current, is_active) VALUES
('2023-2024', '2023-09-01', '2024-06-30', true, true),
('2024-2025', '2024-09-01', '2025-06-30', false, true);

INSERT INTO academic_terms (name, academic_year_id, start_date, end_date, is_current, is_active, description) VALUES
('First Term', (SELECT id FROM academic_years WHERE name = '2023-2024'), '2023-09-01', '2023-12-15', true, true, 'First term of the academic year'),
('Second Term', (SELECT id FROM academic_years WHERE name = '2023-2024'), '2024-01-08', '2024-04-15', false, true, 'Second term of the academic year'),
('Third Term', (SELECT id FROM academic_years WHERE name = '2023-2024'), '2024-04-22', '2024-06-30', false, true, 'Final term of the academic year');
