import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("academic_sessions").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting academic session:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in academic session DELETE API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, academic_year_id, start_date, end_date, is_active } = body

    const { data, error } = await supabase
      .from("academic_sessions")
      .update({
        name,
        academic_year_id,
        start_date,
        end_date,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select(`
        *,
        academic_years (
          id,
          name
        )
      `)

    if (error) {
      console.error("Error updating academic session:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error in academic session PUT API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
