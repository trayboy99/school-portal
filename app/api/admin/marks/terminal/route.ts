import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function enforceTerminalConstraints(score: any) {
  // Terminal scores constraints: CA1 (0-20), CA2 (0-20), Exam (0-60), Total (0-100)
  const ca1 = Number.parseFloat(score.ca1_score) || 0
  const ca2 = Number.parseFloat(score.ca2_score) || 0
  const exam = Number.parseFloat(score.exam_score) || 0
  const total = Number.parseFloat(score.total_score) || 0
  const percentage = Number.parseFloat(score.percentage) || 0

  return {
    ca1_score: Math.max(0, Math.min(20, ca1)),
    ca2_score: Math.max(0, Math.min(20, ca2)),
    exam_score: Math.max(0, Math.min(60, exam)),
    total_score: Math.max(0, Math.min(100, total)),
    percentage: Math.max(0, Math.min(100, percentage)),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scores, exam_id, subject_id, class_name, class_id, academic_year, academic_term } = body

    console.log("Received terminal scores data:", body)

    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      return NextResponse.json({ error: "Scores array is required" }, { status: 400 })
    }

    if (!subject_id || (!class_name && !class_id) || !academic_year || !academic_term) {
      return NextResponse.json(
        { error: "Missing required fields: subject_id, class info, academic_year, academic_term" },
        { status: 400 },
      )
    }

    let finalClassId = class_id

    // If class_id is provided, use it directly. Otherwise, look up by class_name
    if (!finalClassId && class_name) {
      console.log("Looking up class by name:", class_name)

      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id, class_name, section")
        .or(`class_name.eq.${class_name},class_name.ilike.%${class_name}%`)

      console.log("Class lookup result:", classData, classError)

      if (classError) {
        console.error("Class lookup error:", classError)
        return NextResponse.json({ error: "Error looking up class" }, { status: 400 })
      }

      if (!classData || classData.length === 0) {
        console.error("No class found for name:", class_name)
        return NextResponse.json({ error: `Class not found: ${class_name}` }, { status: 400 })
      }

      let selectedClass = classData[0]
      if (classData.length > 1) {
        const exactMatch = classData.find(
          (c) => `${c.class_name} ${c.section}` === class_name || c.class_name === class_name,
        )
        if (exactMatch) {
          selectedClass = exactMatch
        }
      }

      finalClassId = selectedClass.id
      console.log("Using class ID:", finalClassId)
    }

    if (!finalClassId) {
      return NextResponse.json({ error: "Could not determine class ID" }, { status: 400 })
    }

    // Get midterm scores to auto-populate terminal CA1 and CA2
    const { data: midtermScores, error: midtermError } = await supabase
      .from("midterm_scores")
      .select("student_id, ca1_score, ca2_score, exam_score")
      .eq("subject_id", Number.parseInt(subject_id))
      .eq("class_id", finalClassId)
      .eq("academic_year_id", Number.parseInt(academic_year))
      .eq("academic_term_id", Number.parseInt(academic_term))

    if (midtermError) {
      console.log("Could not fetch midterm scores:", midtermError)
    }

    // Delete existing records for the students being updated to prevent unique constraint violations
    const studentIds = scores.map((s) => s.student_id)

    const { error: deleteError } = await supabase
      .from("terminal_scores")
      .delete()
      .in("student_id", studentIds)
      .eq("subject_id", Number.parseInt(subject_id))
      .eq("class_id", finalClassId)
      .eq("academic_year_id", Number.parseInt(academic_year))
      .eq("academic_term_id", Number.parseInt(academic_term))

    if (deleteError) {
      console.log("No existing records to delete or delete failed:", deleteError)
    }

    // Get students data to include student names and reg_number
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, first_name, middle_name, surname, reg_number")
      .in("id", studentIds)

    if (studentsError) {
      console.error("Error fetching students:", studentsError)
      return NextResponse.json({ error: "Error fetching student data" }, { status: 500 })
    }

    // Get subject name
    const { data: subjectData, error: subjectError } = await supabase
      .from("subjects")
      .select("subject_name")
      .eq("id", subject_id)
      .single()

    if (subjectError) {
      console.error("Error fetching subject:", subjectError)
      return NextResponse.json({ error: "Error fetching subject data" }, { status: 500 })
    }

    // Prepare scores for insertion - matching the actual table structure
    const scoresData = scores.map((score) => {
      // Find the student to get their name and reg_number
      const student = students?.find((s) => s.id === score.student_id)
      const studentName = student
        ? `${student.first_name} ${student.middle_name || ""} ${student.surname}`.trim()
        : "Unknown Student"

      // Find corresponding midterm scores for this student
      const midtermScore = midtermScores?.find((ms) => ms.student_id === score.student_id)

      let terminalCA1 = Number.parseFloat(score.ca1_score) || 0
      let terminalCA2 = Number.parseFloat(score.ca2_score) || 0

      // Auto-populate from midterm if midterm scores exist and terminal scores are not manually entered
      if (midtermScore && terminalCA1 === 0 && terminalCA2 === 0) {
        // Midterm CA1 + CA2 -> Terminal CA1
        terminalCA1 = (midtermScore.ca1_score || 0) + (midtermScore.ca2_score || 0)
        // Midterm Exam -> Terminal CA2
        terminalCA2 = midtermScore.exam_score || 0
      }

      const terminalExam = Number.parseFloat(score.exam_score) || 0 // Default to 0, will be entered later

      // Apply constraints before calculating totals
      const constrainedCA1 = Math.max(0, Math.min(20, terminalCA1))
      const constrainedCA2 = Math.max(0, Math.min(20, terminalCA2))
      const constrainedExam = Math.max(0, Math.min(60, terminalExam))

      const total = constrainedCA1 + constrainedCA2 + constrainedExam
      const percentage = total > 0 ? (total / 100) * 100 : 0

      let grade = "F"
      if (percentage >= 80) grade = "A"
      else if (percentage >= 70) grade = "B"
      else if (percentage >= 60) grade = "C"
      else if (percentage >= 50) grade = "D"
      else if (percentage >= 40) grade = "E"

      return {
        student_id: score.student_id,
        student_name: studentName,
        reg_number: student?.reg_number || "N/A",
        exam_id: exam_id ? Number.parseInt(exam_id) : null,
        subject_id: Number.parseInt(subject_id),
        subject_name: subjectData?.subject_name || "Unknown Subject",
        class_id: finalClassId,
        class_name: class_name || "",
        academic_year_id: Number.parseInt(academic_year),
        academic_term_id: Number.parseInt(academic_term),
        ca1_score: constrainedCA1,
        ca2_score: constrainedCA2,
        exam_score: constrainedExam,
        total_score: total,
        percentage: Math.round(percentage),
        grade: grade,
      }
    })

    console.log("Prepared terminal scores data:", scoresData)

    // Insert the scores
    const { data, error } = await supabase.from("terminal_scores").insert(scoresData)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save scores", details: error.message }, { status: 500 })
    }

    console.log("Terminal scores saved successfully:", data)

    return NextResponse.json({
      message: "Terminal scores saved successfully",
      count: scoresData.length,
    })
  } catch (error) {
    console.error("Error saving terminal scores:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exam_id = searchParams.get("exam_id")
    const subject_id = searchParams.get("subject_id")
    const class_name = searchParams.get("class_name")
    const class_id = searchParams.get("class_id")
    const academic_year = searchParams.get("academic_year")
    const academic_term = searchParams.get("academic_term")

    console.log("GET terminal scores with params:", {
      exam_id,
      subject_id,
      class_name,
      class_id,
      academic_year,
      academic_term,
    })

    // All required parameters must be provided for exact filtering
    if (!subject_id || !academic_year || !academic_term || (!class_id && !class_name)) {
      console.log("Missing required parameters for exact filtering")
      return NextResponse.json([])
    }

    let finalClassId = class_id

    // If class_id not provided, look up by class_name
    if (!finalClassId && class_name) {
      const { data: classData } = await supabase
        .from("classes")
        .select("id, class_name, section")
        .or(`class_name.eq.${class_name},class_name.ilike.%${class_name}%`)

      if (classData && classData.length > 0) {
        // Find exact match for class name
        let selectedClass = classData[0]
        if (classData.length > 1) {
          const exactMatch = classData.find(
            (c) => `${c.class_name} ${c.section}` === class_name || c.class_name === class_name,
          )
          if (exactMatch) {
            selectedClass = exactMatch
          }
        }
        finalClassId = selectedClass.id
      } else {
        console.log("No matching class found for:", class_name)
        return NextResponse.json([])
      }
    }

    if (!finalClassId) {
      console.log("Could not determine class ID")
      return NextResponse.json([])
    }

    let query = supabase
      .from("terminal_scores")
      .select("*")
      .eq("subject_id", Number.parseInt(subject_id))
      .eq("class_id", finalClassId)
      .eq("academic_year_id", Number.parseInt(academic_year))
      .eq("academic_term_id", Number.parseInt(academic_term))

    // Add exam_id filter only if provided
    if (exam_id) {
      query = query.eq("exam_id", Number.parseInt(exam_id))
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 })
    }

    console.log("Found terminal scores:", data?.length || 0, "records")
    console.log("Sample record:", data?.[0])

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching terminal scores:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
