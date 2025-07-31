import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const studentId = params.id
    const updateData = await request.json()

    const { data, error } = await supabase
      .from("students")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", studentId)
      .select()

    if (error) {
      console.error("Error updating student:", error)
      return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const studentId = params.id

    const { error } = await supabase.from("students").delete().eq("id", studentId)

    if (error) {
      console.error("Error deleting student:", error)
      return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
