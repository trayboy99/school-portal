import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase configuration")
}

const supabase = createClient(supabaseUrl!, supabaseKey!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: teacher, error } = await supabase.from("teachers").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching teacher:", error)
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error in GET /api/admin/teachers/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const { data: teacher, error } = await supabase.from("teachers").update(body).eq("id", params.id).select().single()

    if (error) {
      console.error("Error updating teacher:", error)
      return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error in PUT /api/admin/teachers/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("teachers").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting teacher:", error)
      return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 })
    }

    return NextResponse.json({ message: "Teacher deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/admin/teachers/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
