import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Get sample students to understand the data structure
    const { data: students, error } = await supabase
      .from("students")
      .select("id, first_name, middle_name, surname, current_class, reg_number, username, status")
      .limit(10)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
    }

    // Get unique class values
    const { data: classData, error: classError } = await supabase
      .from("students")
      .select("current_class")
      .not("current_class", "is", null)

    const uniqueClasses = [...new Set(classData?.map((item) => item.current_class) || [])]

    // Get classes from classes table
    const { data: classesTable, error: classesError } = await supabase.from("classes").select("id, class_name, section")

    return NextResponse.json({
      sample_students: students,
      unique_current_classes: uniqueClasses,
      classes_table: classesTable,
      total_students: students?.length || 0,
    })
  } catch (error) {
    console.error("Error in debug route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
