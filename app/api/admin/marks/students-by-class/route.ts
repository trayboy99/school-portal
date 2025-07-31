import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    console.log("Fetching students for class ID:", classId)

    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 })
    }

    // Get the class information first
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("id, class_name, section")
      .eq("id", classId)
      .single()

    if (classError || !classData) {
      console.error("Error fetching class:", classError)
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    console.log("Found class:", classData)

    // Create the full class name format that matches what's in students table
    const fullClassName = `${classData.class_name} ${classData.section}`
    console.log("Looking for students with current_class:", fullClassName)

    // Fetch students using the same logic as classes management section
    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select(`
        id, 
        first_name, 
        middle_name, 
        surname, 
        reg_number, 
        current_class, 
        section,
        username,
        status
      `)
      .eq("current_class", fullClassName)
      .eq("status", "active")
      .order("first_name")

    if (studentsError) {
      console.error("Error fetching students:", studentsError)
      return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
    }

    console.log(`Found ${studentsData?.length || 0} students for class ${fullClassName}`)

    // Process the data to ensure consistent format
    const processedStudents = (studentsData || []).map((student) => ({
      ...student,
      full_name: `${student.first_name || ""} ${student.middle_name || ""} ${student.surname || ""}`.trim(),
      class_name: student.current_class || fullClassName,
      class_id: Number.parseInt(classId),
    }))

    console.log(`Returning ${processedStudents.length} students`)
    if (processedStudents.length > 0) {
      console.log("Sample student:", processedStudents[0])
    }

    return NextResponse.json(processedStudents)
  } catch (error) {
    console.error("Error in students-by-class API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
