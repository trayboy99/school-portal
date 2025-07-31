import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log("Login attempt:", { username, password: "***" })

    // Check admin credentials first
    if (username === "admin" && password === "admin123") {
      console.log("Admin login successful")
      return NextResponse.json({
        success: true,
        role: "admin",
        id: "admin",
        username: "admin",
        name: "Administrator",
      })
    }

    // Check teachers table - now using the standardized 'password' column
    console.log("Checking teachers table...")
    const { data: teachers, error: teacherError } = await supabase.from("teachers").select("*").eq("username", username)

    if (teacherError) {
      console.error("Teacher query error:", teacherError)
    } else {
      console.log("Teachers found:", teachers?.length || 0)

      if (teachers && teachers.length > 0) {
        const teacher = teachers[0]
        console.log("Teacher data:", {
          id: teacher.id,
          username: teacher.username,
          hasPassword: !!teacher.password,
          hasCustomPassword: !!teacher.custom_password,
          hasPasswordHash: !!teacher.password_hash,
        })

        // Check password - prioritize the new 'password' column, then fallback to old columns
        const isValidPassword =
          teacher.password === password || teacher.custom_password === password || teacher.password_hash === password

        if (isValidPassword) {
          console.log("Teacher login successful")
          return NextResponse.json({
            success: true,
            role: "teacher",
            id: teacher.id,
            username: teacher.username,
            name: `${teacher.first_name || ""} ${teacher.surname || ""}`.trim() || teacher.username,
            department: teacher.department,
            subjects: teacher.subjects,
          })
        } else {
          console.log("Teacher password mismatch")
        }
      }
    }

    // Check students table
    console.log("Checking students table...")
    const { data: students, error: studentError } = await supabase.from("students").select("*").eq("username", username)

    if (studentError) {
      console.error("Student query error:", studentError)
    } else {
      console.log("Students found:", students?.length || 0)

      if (students && students.length > 0) {
        const student = students[0]
        console.log("Student data:", {
          id: student.id,
          username: student.username,
          hasPassword: !!student.password,
          hasCustomPassword: !!student.custom_password,
          hasPasswordHash: !!student.password_hash,
        })

        // Check password - try all possible password columns
        const isValidPassword =
          student.password === password || student.custom_password === password || student.password_hash === password

        if (isValidPassword) {
          console.log("Student login successful")
          return NextResponse.json({
            success: true,
            role: "student",
            id: student.id,
            username: student.username,
            name: `${student.first_name || ""} ${student.surname || ""}`.trim() || student.username,
            class: student.current_class,
            section: student.section,
            roll_number: student.roll_number,
          })
        } else {
          console.log("Student password mismatch")
        }
      }
    }

    console.log("Login failed - invalid credentials")
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
