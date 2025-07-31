import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase configuration")
}

const supabase = createClient(supabaseUrl!, supabaseKey!)

// Function to generate employee ID
const generateEmployeeId = async () => {
  // Get the count of existing teachers to generate next employee ID
  const { count, error } = await supabase.from("teachers").select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error getting teacher count:", error)
    // Fallback to timestamp-based ID if count fails
    return `TCH${Date.now().toString().slice(-6)}`
  }

  // Generate employee ID like TCH001, TCH002, etc.
  const nextNumber = (count || 0) + 1
  return `TCH${nextNumber.toString().padStart(3, "0")}`
}

// Function to check and get valid status values
const getValidStatusValue = (inputStatus: string): string => {
  // Convert to lowercase and trim
  const normalizedStatus = inputStatus.toLowerCase().trim()

  // Map common status variations to database-accepted values
  const statusMap: { [key: string]: string } = {
    active: "active",
    inactive: "inactive",
    suspended: "suspended",
    pending: "active", // Default pending to active
    enabled: "active",
    disabled: "inactive",
    blocked: "suspended",
  }

  // Return mapped status or default to 'active'
  return statusMap[normalizedStatus] || "active"
}

export async function GET() {
  try {
    const { data: teachers, error } = await supabase
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching teachers:", error)
      return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 })
    }

    return NextResponse.json(teachers || [])
  } catch (error) {
    console.error("Error in GET /api/admin/teachers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received teacher data:", JSON.stringify(body, null, 2))

    // Generate employee ID
    const employeeId = await generateEmployeeId()
    console.log("Generated employee ID:", employeeId)

    // Get valid status value
    const validStatus = getValidStatusValue(body.status || "active")
    console.log("Original status:", body.status, "-> Valid status:", validStatus)

    // Prepare data for database insertion - mapping to existing columns only
    const teacherData = {
      // Basic identification fields
      employee_id: employeeId,
      username: body.username || "",
      password: body.password || body.custom_password || "teacher123",

      // Personal information fields
      first_name: body.first_name || "",
      middle_name: body.middle_name || "",
      surname: body.surname || "",
      email: body.email || "",
      phone: body.phone || "",
      address: body.address || "",
      date_of_birth: body.date_of_birth || null,
      gender: body.gender || null,

      // Professional information fields
      department: body.department || "",
      subjects: body.subjects || [], // Now properly handled from form
      qualification: body.qualification || null,
      experience: body.experience || null,

      // Employment information fields
      employment_type: body.employment_type || null,
      salary: body.salary || null,
      hire_date: body.hire_date || new Date().toISOString().split("T")[0],
      status: validStatus,

      // Emergency contact fields
      emergency_contact: body.emergency_contact || null,
      emergency_phone: body.emergency_phone || null,
    }

    // Handle credential generation
    if (!teacherData.username && body.first_name && body.surname) {
      teacherData.username = `${body.first_name.toLowerCase()}.${body.surname.toLowerCase()}`
    }

    // Validate required fields
    if (!teacherData.username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    if (!teacherData.first_name) {
      return NextResponse.json({ error: "First name is required" }, { status: 400 })
    }

    if (!teacherData.surname) {
      return NextResponse.json({ error: "Surname is required" }, { status: 400 })
    }

    console.log("Final teacher data to insert:", JSON.stringify(teacherData, null, 2))

    // Insert teacher into database
    const { data: teacher, error } = await supabase.from("teachers").insert([teacherData]).select().single()

    if (error) {
      console.error("Detailed error creating teacher:", {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      // Handle specific database errors
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json({ error: "Username or Employee ID already exists" }, { status: 409 })
      }

      if (error.code === "23514" || error.message.includes("check constraint")) {
        // Check constraint violation - likely the status constraint
        console.error("Status constraint violation. Attempted status:", validStatus)

        // Try with just 'active' as a fallback
        const fallbackData = { ...teacherData, status: "active" }
        console.log("Trying fallback with status 'active'")

        const { data: fallbackTeacher, error: fallbackError } = await supabase
          .from("teachers")
          .insert([fallbackData])
          .select()
          .single()

        if (fallbackError) {
          console.error("Fallback also failed:", fallbackError)
          return NextResponse.json(
            {
              error: `Status constraint error. Tried: ${validStatus}, then 'active'. Error: ${fallbackError.message}`,
            },
            { status: 500 },
          )
        }

        console.log("Fallback teacher created successfully:", fallbackTeacher)
        return NextResponse.json(fallbackTeacher)
      }

      return NextResponse.json({ error: "Failed to create teacher: " + error.message }, { status: 500 })
    }

    console.log("Teacher created successfully:", teacher)
    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error in POST /api/admin/teachers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
