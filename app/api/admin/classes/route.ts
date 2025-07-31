import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching classes...")

    // Fetch all classes with teacher information
    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .select(`
        id,
        class_name,
        section,
        class_teacher_id,
        academic_year,
        max_students,
        current_students,
        room_number,
        status,
        created_at,
        updated_at,
        category,
        teacher_name,
        subjects_count,
        description
      `)
      .order("class_name")

    if (classesError) {
      console.error("Error fetching classes:", classesError)
      return NextResponse.json({ error: `Failed to fetch classes: ${classesError.message}` }, { status: 500 })
    }

    console.log(`Found ${classes?.length || 0} classes`)

    // Process classes data to ensure all fields are present
    const processedClasses = (classes || []).map((classItem) => ({
      id: classItem.id,
      class_name: classItem.class_name || "",
      category: classItem.category || "Unknown",
      section: classItem.section || "",
      academic_year: classItem.academic_year || "",
      class_teacher_id: classItem.class_teacher_id || "",
      teacher_name: classItem.teacher_name || "Unassigned",
      max_students: classItem.max_students || 0,
      current_students: classItem.current_students || 0,
      subjects_count: classItem.subjects_count || 0,
      status: classItem.status || "active",
      description: classItem.description || "",
      created_at: classItem.created_at || "",
      updated_at: classItem.updated_at || "",
    }))

    return NextResponse.json(processedClasses)
  } catch (error) {
    console.error("Unexpected error in classes GET API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Creating new class with data:", body)

    const { name, category, section, academic_year, selected_teacher_id, max_students, status, description } = body

    // Validate required fields
    if (!name || !category || !section || !academic_year || !selected_teacher_id || !max_students) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get teacher name for the selected teacher
    const { data: teacher, error: teacherError } = await supabase
      .from("teachers")
      .select("first_name, middle_name, surname")
      .eq("id", selected_teacher_id)
      .single()

    if (teacherError) {
      console.error("Error fetching teacher:", teacherError)
      return NextResponse.json({ error: "Failed to fetch teacher information" }, { status: 500 })
    }

    const teacher_name = [teacher.first_name, teacher.middle_name, teacher.surname]
      .filter((part) => part && part.trim() !== "")
      .join(" ")

    // Insert new class
    const { data: newClass, error: insertError } = await supabase
      .from("classes")
      .insert({
        class_name: name,
        category,
        section,
        academic_year,
        class_teacher_id: selected_teacher_id,
        teacher_name,
        max_students: Number.parseInt(max_students),
        current_students: 0,
        subjects_count: 0,
        status: status.toLowerCase(),
        description: description || null,
        room_number: null, // Can be set later
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating class:", insertError)
      return NextResponse.json({ error: `Failed to create class: ${insertError.message}` }, { status: 500 })
    }

    console.log("Class created successfully:", newClass)
    return NextResponse.json(newClass)
  } catch (error) {
    console.error("Unexpected error in classes POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
