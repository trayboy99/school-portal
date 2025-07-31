import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("id, department_name, department_code, description, status")
      .order("department_name", { ascending: true })

    if (error) {
      console.error("Error fetching departments:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedData = (data || []).map((dept) => ({
      id: dept.id,
      name: dept.department_name,
      code: dept.department_code,
      description: dept.description,
      status: dept.status === "active" ? "Active" : "Inactive",
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error in departments API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, code, description, status = "active" } = body

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("departments")
      .insert([
        {
          department_name: name,
          department_code: code,
          description,
          status: status.toLowerCase(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select("id, department_name, department_code, description, status")

    if (error) {
      console.error("Error creating department:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform response
    const transformedData = {
      id: data[0].id,
      name: data[0].department_name,
      code: data[0].department_code,
      description: data[0].description,
      status: data[0].status === "active" ? "Active" : "Inactive",
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error in departments POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
