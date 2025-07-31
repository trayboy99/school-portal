import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: exams, error } = await supabase
      .from("exams")
      .select(`
        *,
        academic_years!inner(name),
        academic_terms!inner(name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 })
    }

    return NextResponse.json(exams)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, academic_year_id, academic_term_id, start_date, end_date, status } = body

    // Validate required fields
    if (!name || !academic_year_id || !academic_term_id || !start_date || !end_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: exam, error } = await supabase
      .from("exams")
      .insert([
        {
          name,
          academic_year_id,
          academic_term_id,
          start_date,
          end_date,
          status: status || "scheduled",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create exam" }, { status: 500 })
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
