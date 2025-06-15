import { supabaseAdmin } from "../lib/supabase"

export async function setupSupabaseDatabase() {
  try {
    console.log("🚀 Setting up Supabase database tables...")

    // Students table
    const { error: studentsError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS students (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          roll_no VARCHAR(50) UNIQUE NOT NULL,
          class VARCHAR(100) NOT NULL,
          section VARCHAR(50) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20),
          status VARCHAR(20) DEFAULT 'Active',
          avatar TEXT,
          admission_date DATE,
          date_of_birth DATE,
          gender VARCHAR(10),
          address TEXT,
          parent_name VARCHAR(255),
          parent_phone VARCHAR(20),
          parent_email VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `,
    })

    if (studentsError) throw studentsError
    console.log("✅ Students table created")

    // Teachers table
    const { error: teachersError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS teachers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          employee_id VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20),
          subjects TEXT[],
          experience VARCHAR(50),
          status VARCHAR(20) DEFAULT 'Active',
          avatar TEXT,
          department VARCHAR(100),
          qualification VARCHAR(255),
          hire_date DATE,
          employment_type VARCHAR(50),
          salary VARCHAR(100),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `,
    })

    if (teachersError) throw teachersError
    console.log("✅ Teachers table created")

    // Classes table
    const { error: classesError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS classes (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          teacher VARCHAR(255),
          teacher_id VARCHAR(50),
          students INTEGER DEFAULT 0,
          max_students INTEGER DEFAULT 40,
          subjects INTEGER DEFAULT 0,
          room VARCHAR(100),
          section VARCHAR(50),
          academic_year VARCHAR(20),
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `,
    })

    if (classesError) throw classesError
    console.log("✅ Classes table created")

    // Subjects table
    const { error: subjectsError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS subjects (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          code VARCHAR(50) UNIQUE NOT NULL,
          department VARCHAR(100),
          credits INTEGER DEFAULT 1,
          description TEXT,
          status VARCHAR(20) DEFAULT 'Active',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `,
    })

    if (subjectsError) throw subjectsError
    console.log("✅ Subjects table created")

    // Exams table
    const { error: examsError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS exams (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50),
          session VARCHAR(20),
          year VARCHAR(10),
          term VARCHAR(50),
          start_date DATE,
          end_date DATE,
          status VARCHAR(50) DEFAULT 'Scheduled',
          exam_type VARCHAR(20),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `,
    })

    if (examsError) throw examsError
    console.log("✅ Exams table created")

    // Student scores table
    const { error: scoresError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS student_scores (
          id SERIAL PRIMARY KEY,
          student_id INTEGER REFERENCES students(id),
          exam_id INTEGER REFERENCES exams(id),
          subject VARCHAR(100),
          class VARCHAR(100),
          ca1 INTEGER DEFAULT 0,
          ca2 INTEGER DEFAULT 0,
          exam INTEGER DEFAULT 0,
          total INTEGER DEFAULT 0,
          grade VARCHAR(2),
          session VARCHAR(20),
          term VARCHAR(50),
          year VARCHAR(10),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `,
    })

    if (scoresError) throw scoresError
    console.log("✅ Student scores table created")

    // Settings table
    const { error: settingsError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(100) UNIQUE NOT NULL,
          value TEXT,
          category VARCHAR(100),
          description TEXT,
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `,
    })

    if (settingsError) throw settingsError
    console.log("✅ Settings table created")

    console.log("🎉 Supabase database setup complete!")
    return { success: true }
  } catch (error) {
    console.error("❌ Supabase database setup failed:", error)
    return { success: false, error }
  }
}
