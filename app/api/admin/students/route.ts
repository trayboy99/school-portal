import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Valid status values that EXACTLY match the database constraint
const VALID_STATUS_VALUES = ["Active", "Inactive", "Suspended", "Graduated", "Transferred", "Withdrawn"]

export async function GET() {
  try {
    // Fetch from students table only - this is our primary and only source
    const { data: students, error } = await supabase
      .from("students")
      .select("*")
      .order("first_name", { ascending: true })

    if (error) {
      console.error("Error fetching students:", error)
      return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
    }

    return NextResponse.json(students || [])
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const studentData = await request.json()
    console.log("Received student data:", studentData)

    // Validate required fields
    if (!studentData.first_name || !studentData.surname) {
      return NextResponse.json({ error: "First name and surname are required" }, { status: 400 })
    }

    if (!studentData.current_class || !studentData.section) {
      return NextResponse.json({ error: "Class and section are required" }, { status: 400 })
    }

    // Ensure status is exactly one of the valid values (case-sensitive)
    let status = studentData.status || "Active"

    // Normalize status to proper case if needed
    const statusLower = status.toLowerCase()
    const validStatusMap = {
      active: "Active",
      inactive: "Inactive",
      suspended: "Suspended",
      graduated: "Graduated",
      transferred: "Transferred",
      withdrawn: "Withdrawn",
    }

    if (validStatusMap[statusLower]) {
      status = validStatusMap[statusLower]
    }

    // Final validation
    if (!VALID_STATUS_VALUES.includes(status)) {
      console.error(`Invalid status value: "${status}". Valid values are:`, VALID_STATUS_VALUES)
      return NextResponse.json(
        {
          error: `Invalid status value "${status}". Must be one of: ${VALID_STATUS_VALUES.join(", ")}`,
        },
        { status: 400 },
      )
    }

    console.log(`Using status: "${status}"`)

    // Generate credentials based on method
    let finalUsername = ""
    let finalPassword = ""

    if (studentData.credential_method === "custom") {
      // Use custom credentials provided by user
      finalUsername = studentData.custom_username || ""
      finalPassword = studentData.custom_password || ""

      if (!finalUsername || !finalPassword) {
        return NextResponse.json(
          { error: "Custom username and password are required when using custom credential method" },
          { status: 400 },
        )
      }
    } else {
      // Auto-generate credentials from first name and surname
      const firstName = (studentData.first_name || "").toLowerCase().replace(/\s+/g, "")
      const surname = (studentData.surname || "").toLowerCase().replace(/\s+/g, "")

      finalUsername = `${firstName}.${surname}`
      finalPassword = "student123" // Default password for auto-generated accounts
    }

    // Check if username already exists and make it unique
    const { data: existingUser } = await supabase
      .from("students")
      .select("username")
      .eq("username", finalUsername)
      .single()

    if (existingUser) {
      // If username exists, append a number
      let counter = 1
      const baseUsername = finalUsername

      do {
        finalUsername = `${baseUsername}${counter}`
        const { data: checkUser } = await supabase
          .from("students")
          .select("username")
          .eq("username", finalUsername)
          .single()

        if (!checkUser) break
        counter++
      } while (counter < 100) // Prevent infinite loop
    }

    // Generate reg number if not provided (this should already be generated on frontend)
    let regNumber = studentData.reg_number
    if (!regNumber) {
      const currentYear = new Date().getFullYear()
      const { data: lastStudent } = await supabase
        .from("students")
        .select("reg_number")
        .order("created_at", { ascending: false })
        .limit(1)

      const lastRegNumber = lastStudent?.[0]?.reg_number
      if (lastRegNumber && lastRegNumber.startsWith(`REG${currentYear}`)) {
        const lastNumber = Number.parseInt(lastRegNumber.replace(`REG${currentYear}`, ""))
        regNumber = `REG${currentYear}${String(lastNumber + 1).padStart(3, "0")}`
      } else {
        regNumber = `REG${currentYear}001`
      }
    }

    // Prepare the complete student data object with ALL fields (no roll number fields)
    const newStudent = {
      // Personal Information
      first_name: studentData.first_name,
      middle_name: studentData.middle_name || null,
      surname: studentData.surname,
      email: studentData.email || null,
      phone: studentData.phone || null,
      date_of_birth: studentData.date_of_birth || null,
      gender: studentData.gender || null,
      address: studentData.home_address || null,
      home_address: studentData.home_address || null,

      // Academic Information
      current_class: studentData.current_class,
      class: studentData.current_class, // Set both class and current_class to same value
      section: studentData.section,
      reg_number: regNumber, // Only registration number, no roll numbers
      status: status, // Use the validated and normalized status
      admission_date: new Date().toISOString().split("T")[0],

      // Parent/Guardian Information
      parent_name: studentData.parent_name || null,
      parent_phone: studentData.parent_phone || null,
      parent_email: studentData.parent_email || null,

      // Emergency Contact Information
      emergency_contact: studentData.emergency_contact || null,
      emergency_phone: studentData.emergency_phone || null,

      // Login Credentials - Store final generated/custom credentials
      username: finalUsername,
      password_hash: finalPassword, // In production, this should be hashed

      // Credential tracking fields
      credential_method: studentData.credential_method || "auto",
      custom_username: studentData.credential_method === "custom" ? studentData.custom_username : null,
      custom_password: studentData.credential_method === "custom" ? studentData.custom_password : null,
      send_credentials_to: studentData.send_credentials_to || "parent",
      credentials_sent_to: studentData.send_credentials_to || "parent",

      // Additional Information
      medical_info: studentData.medical_info || null,
      notes: studentData.notes || null,
      avatar: studentData.avatar || "/placeholder.svg?height=40&width=40",

      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Prepared student data for insertion:", {
      ...newStudent,
      password_hash: "[HIDDEN]", // Don't log passwords
      custom_password: "[HIDDEN]",
      status: newStudent.status, // Log the actual status being used
    })

    // Insert into students table
    const { data, error } = await supabase.from("students").insert([newStudent]).select()

    if (error) {
      console.error("Error creating student:", error)
      console.error("Error details:", error.details)
      console.error("Error hint:", error.hint)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)

      // Provide more specific error messages
      let errorMessage = `Failed to create student: ${error.message}`

      if (error.code === "23514") {
        // Check constraint violation
        if (error.message.includes("students_status_check")) {
          errorMessage = `Invalid status value "${status}". Status must be one of: ${VALID_STATUS_VALUES.join(", ")}`
        } else {
          errorMessage = `Data validation failed. Please check all field values.`
        }
      } else if (error.code === "23505") {
        // Unique constraint violation
        if (error.message.includes("username")) {
          errorMessage = `Username "${finalUsername}" already exists. Please try again.`
        } else if (error.message.includes("reg_number")) {
          errorMessage = `Registration number "${regNumber}" already exists.`
        } else {
          errorMessage = `A student with this information already exists.`
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: error.details,
          hint: error.hint,
          code: error.code,
          attempted_status: status,
          valid_statuses: VALID_STATUS_VALUES,
        },
        { status: 500 },
      )
    }

    console.log("Student created successfully with ID:", data[0].id)

    // Return success response without sensitive data
    const responseData = {
      ...data[0],
      password_hash: "[HIDDEN]", // Don't return password in response
      custom_password: "[HIDDEN]",
    }

    return NextResponse.json({
      ...responseData,
      message: `Student created successfully. Username: ${finalUsername}. Credentials will be sent to ${studentData.send_credentials_to}.`,
    })
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
