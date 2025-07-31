import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: department, error } = await supabase
      .from("departments")
      .select(`
        *,
        teachers:head_of_department (
          id,
          first_name,
          surname
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching department:", error)
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error("Error in department GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, code, description, head_of_department, status } = body

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 })
    }

    // Check if another department with same name or code already exists
    const { data: existing, error: checkError } = await supabase
      .from("departments")
      .select("id, name, code")
      .or(`name.eq.${name},code.eq.${code}`)
      .neq("id", params.id)

    if (checkError) {
      console.error("Error checking existing departments:", checkError)
      return NextResponse.json({ error: "Failed to validate department" }, { status: 500 })
    }

    if (existing && existing.length > 0) {
      const duplicate = existing[0]
      if (duplicate.name === name) {
        return NextResponse.json({ error: "Another department with this name already exists" }, { status: 400 })
      }
      if (duplicate.code === code) {
        return NextResponse.json({ error: "Another department with this code already exists" }, { status: 400 })
      }
    }

    const { data: department, error } = await supabase
      .from("departments")
      .update({
        name,
        code: code.toUpperCase(),
        description,
        head_of_department: head_of_department || null,
        status,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating department:", error)
      return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Department updated successfully",
      department,
    })
  } catch (error) {
    console.error("Error in department PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if department has associated teachers
    const { data: teachers, error: teachersError } = await supabase
      .from("teachers")
      .select("id")
      .eq("department", params.id)
      .limit(1)

    if (teachersError) {
      console.error("Error checking teachers:", teachersError)
      return NextResponse.json({ error: "Failed to check department dependencies" }, { status: 500 })
    }

    if (teachers && teachers.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete department with associated teachers. Please reassign teachers first.",
        },
        { status: 400 },
      )
    }

    // Check if department has associated subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("id")
      .eq("department", params.id)
      .limit(1)

    if (subjectsError) {
      console.error("Error checking subjects:", subjectsError)
      return NextResponse.json({ error: "Failed to check department dependencies" }, { status: 500 })
    }

    if (subjects && subjects.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete department with associated subjects. Please reassign subjects first.",
        },
        { status: 400 },
      )
    }

    const { error } = await supabase.from("departments").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting department:", error)
      return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
    }

    return NextResponse.json({ message: "Department deleted successfully" })
  } catch (error) {
    console.error("Error in department DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
