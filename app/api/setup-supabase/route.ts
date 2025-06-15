import { NextResponse } from "next/server"
import { supabaseAdmin } from "../../../lib/supabase"

export async function POST() {
  try {
    console.log("🚀 Setting up Supabase database tables...")

    // Create students table
    const { error: studentsError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "students")
      .single()

    if (!studentsError || studentsError.code === "PGRST116") {
      // Table doesn't exist, create it
      const { error: createStudentsError } = await supabaseAdmin.rpc("create_students_table")
      if (createStudentsError) {
        console.log("Creating students table via direct SQL...")
        // Fallback: we'll create tables via SQL editor instead
      }
    }

    // Let's use a simpler approach - direct table creation
    const tables = [
      {
        name: "students",
        sql: `
          CREATE TABLE IF NOT EXISTS students (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            roll_no TEXT UNIQUE NOT NULL,
            class TEXT NOT NULL,
            section TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            status TEXT DEFAULT 'Active',
            avatar TEXT,
            admission_date DATE,
            date_of_birth DATE,
            gender TEXT,
            address TEXT,
            parent_name TEXT,
            parent_phone TEXT,
            parent_email TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "teachers",
        sql: `
          CREATE TABLE IF NOT EXISTS teachers (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            employee_id TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            subjects TEXT[],
            experience TEXT,
            status TEXT DEFAULT 'Active',
            avatar TEXT,
            department TEXT,
            qualification TEXT,
            hire_date DATE,
            employment_type TEXT,
            salary TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "classes",
        sql: `
          CREATE TABLE IF NOT EXISTS classes (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            teacher TEXT,
            teacher_id TEXT,
            students INTEGER DEFAULT 0,
            max_students INTEGER DEFAULT 40,
            subjects INTEGER DEFAULT 0,
            room TEXT,
            section TEXT,
            academic_year TEXT,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "subjects",
        sql: `
          CREATE TABLE IF NOT EXISTS subjects (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            department TEXT,
            credits INTEGER DEFAULT 1,
            description TEXT,
            status TEXT DEFAULT 'Active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "exams",
        sql: `
          CREATE TABLE IF NOT EXISTS exams (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT,
            session TEXT,
            year TEXT,
            term TEXT,
            start_date DATE,
            end_date DATE,
            status TEXT DEFAULT 'Scheduled',
            exam_type TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "student_scores",
        sql: `
          CREATE TABLE IF NOT EXISTS student_scores (
            id BIGSERIAL PRIMARY KEY,
            student_id BIGINT REFERENCES students(id),
            exam_id BIGINT REFERENCES exams(id),
            subject TEXT,
            class TEXT,
            ca1 INTEGER DEFAULT 0,
            ca2 INTEGER DEFAULT 0,
            exam INTEGER DEFAULT 0,
            total INTEGER DEFAULT 0,
            grade TEXT,
            session TEXT,
            term TEXT,
            year TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "settings",
        sql: `
          CREATE TABLE IF NOT EXISTS settings (
            id BIGSERIAL PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            category TEXT,
            description TEXT,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
    ]

    // Try to create tables using the SQL editor approach
    const results = []
    for (const table of tables) {
      try {
        // We'll return the SQL for manual execution
        results.push({
          table: table.name,
          sql: table.sql,
          status: "ready_for_manual_creation",
        })
      } catch (error) {
        results.push({
          table: table.name,
          error: error instanceof Error ? error.message : "Unknown error",
          status: "error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database setup prepared! Please run the SQL manually in Supabase.",
      tables: results,
      instructions: "Copy the SQL from the response and run it in your Supabase SQL Editor",
    })
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
