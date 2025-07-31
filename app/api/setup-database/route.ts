import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

export async function POST() {
  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const results = {
      success: false,
      steps: [],
    }

    // Create students table
    try {
      const { error: createStudentsError } = await supabaseAdmin.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS students (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255),
            custom_password VARCHAR(255),
            first_name VARCHAR(100),
            middle_name VARCHAR(100),
            surname VARCHAR(100),
            email VARCHAR(255),
            current_class VARCHAR(50),
            section VARCHAR(10),
            roll_number VARCHAR(20),
            date_of_birth DATE,
            gender VARCHAR(10),
            phone VARCHAR(20),
            address TEXT,
            parent_name VARCHAR(200),
            parent_phone VARCHAR(20),
            parent_email VARCHAR(255),
            admission_date DATE DEFAULT CURRENT_DATE,
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `,
      })

      if (createStudentsError) {
        results.steps.push({
          success: false,
          message: `Failed to create students table: ${createStudentsError.message}`,
        })
      } else {
        results.steps.push({ success: true, message: "Students table created successfully" })
      }
    } catch (error) {
      results.steps.push({ success: false, message: `Error creating students table: ${error.message}` })
    }

    // Create teachers table
    try {
      const { error: createTeachersError } = await supabaseAdmin.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS teachers (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            custom_password VARCHAR(255),
            first_name VARCHAR(100),
            middle_name VARCHAR(100),
            surname VARCHAR(100),
            email VARCHAR(255),
            department VARCHAR(100),
            subjects TEXT[],
            phone VARCHAR(20),
            address TEXT,
            hire_date DATE DEFAULT CURRENT_DATE,
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `,
      })

      if (createTeachersError) {
        results.steps.push({
          success: false,
          message: `Failed to create teachers table: ${createTeachersError.message}`,
        })
      } else {
        results.steps.push({ success: true, message: "Teachers table created successfully" })
      }
    } catch (error) {
      results.steps.push({ success: false, message: `Error creating teachers table: ${error.message}` })
    }

    // Insert sample student
    try {
      const { error: insertStudentError } = await supabaseAdmin.from("students").upsert(
        [
          {
            username: "student1",
            password_hash: "student123",
            custom_password: "student123",
            first_name: "John",
            surname: "Doe",
            email: "john.doe@student.westminster.edu",
            current_class: "Grade 10",
            section: "A",
            roll_number: "001",
            gender: "Male",
            phone: "123-456-7890",
            parent_name: "Jane Doe",
            parent_phone: "123-456-7891",
            parent_email: "jane.doe@email.com",
          },
        ],
        { onConflict: "username" },
      )

      if (insertStudentError) {
        results.steps.push({
          success: false,
          message: `Failed to insert sample student: ${insertStudentError.message}`,
        })
      } else {
        results.steps.push({ success: true, message: "Sample student added (student1/student123)" })
      }
    } catch (error) {
      results.steps.push({ success: false, message: `Error inserting sample student: ${error.message}` })
    }

    // Insert sample teacher
    try {
      const { error: insertTeacherError } = await supabaseAdmin.from("teachers").upsert(
        [
          {
            username: "teacher1",
            custom_password: "teacher123",
            first_name: "Sarah",
            surname: "Smith",
            email: "sarah.smith@westminster.edu",
            department: "Mathematics",
            subjects: ["Mathematics", "Statistics"],
            phone: "123-456-7892",
          },
        ],
        { onConflict: "username" },
      )

      if (insertTeacherError) {
        results.steps.push({
          success: false,
          message: `Failed to insert sample teacher: ${insertTeacherError.message}`,
        })
      } else {
        results.steps.push({ success: true, message: "Sample teacher added (teacher1/teacher123)" })
      }
    } catch (error) {
      results.steps.push({ success: false, message: `Error inserting sample teacher: ${error.message}` })
    }

    // Check if all steps were successful
    results.success = results.steps.every((step) => step.success)

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        steps: [{ success: false, message: `Setup failed: ${error.message}` }],
      },
      { status: 500 },
    )
  }
}
