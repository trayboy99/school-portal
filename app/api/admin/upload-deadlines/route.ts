import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Fetch upload deadlines
    const { data: deadlines, error: deadlinesError } = await supabase
      .from("upload_deadlines")
      .select("*")
      .order("created_at", { ascending: false })

    if (deadlinesError) {
      console.error("Error fetching upload deadlines:", deadlinesError)
      return NextResponse.json({ error: deadlinesError.message }, { status: 500 })
    }

    // Fetch academic years and terms separately to avoid relationship issues
    const { data: academicYears, error: yearsError } = await supabase.from("academic_years").select("id, name")

    const { data: academicTerms, error: termsError } = await supabase.from("academic_terms").select("id, name")

    if (yearsError || termsError) {
      console.error("Error fetching academic data:", { yearsError, termsError })
      return NextResponse.json({ error: "Failed to fetch academic data" }, { status: 500 })
    }

    // Manually join the data
    const enrichedDeadlines = deadlines?.map((deadline) => {
      const year = academicYears?.find((y) => y.id === deadline.academic_year_id)
      const term = academicTerms?.find((t) => t.id === deadline.academic_term_id)

      return {
        ...deadline,
        year_name: year?.name || "Unknown Year",
        term_name: term?.name || "Unknown Term",
      }
    })

    return NextResponse.json(enrichedDeadlines || [])
  } catch (error) {
    console.error("Error in upload-deadlines GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { deadline_type, academic_year_id, academic_term_id, deadline_date } = body

    console.log("Setting deadline:", { deadline_type, academic_year_id, academic_term_id, deadline_date })

    if (!deadline_type || !academic_year_id || !academic_term_id || !deadline_date) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Convert deadline_date to proper ISO timestamp
    const deadlineTimestamp = new Date(deadline_date).toISOString()

    // Check if deadline already exists for this combination
    const { data: existingDeadline, error: checkError } = await supabase
      .from("upload_deadlines")
      .select("id")
      .eq("deadline_type", deadline_type)
      .eq("academic_year_id", academic_year_id)
      .eq("academic_term_id", academic_term_id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing deadline:", checkError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    const deadlineData = {
      deadline_type,
      academic_year_id: Number.parseInt(academic_year_id.toString()),
      academic_term_id: Number.parseInt(academic_term_id.toString()),
      deadline_date: deadlineTimestamp,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (existingDeadline) {
      // Update existing deadline
      const { data, error } = await supabase
        .from("upload_deadlines")
        .update({
          ...deadlineData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingDeadline.id)
        .select()

      if (error) {
        console.error("Error updating deadline:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, deadline: data?.[0], updated: true })
    } else {
      // Create new deadline
      const { data, error } = await supabase.from("upload_deadlines").insert(deadlineData).select()

      if (error) {
        console.error("Error creating deadline:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, deadline: data?.[0], updated: false })
    }
  } catch (error) {
    console.error("Error in upload-deadlines POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
