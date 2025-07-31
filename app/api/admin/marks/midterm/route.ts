import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scores, exam_id, subject_id, class_name, class_id, academic_year, academic_term } = body

    console.log("Received midterm scores data:", body)

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

    // Delete existing records for the students being updated to prevent unique constraint violations
    const studentIds = scores.map((s) => s.student_id)

    const { error: deleteError } = await supabase
      .from("midterm_scores")
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

      // Enforce midterm constraints: CA1 (0-10), CA2 (0-10), Exam (0-20)
      const ca1 = Math.max(0, Math.min(10, Number.parseFloat(score.ca1_score) || 0))
      const ca2 = Math.max(0, Math.min(10, Number.parseFloat(score.ca2_score) || 0))
      const exam = Math.max(0, Math.min(20, Number.parseFloat(score.exam_score) || 0))
      const total = ca1 + ca2 + exam
      const percentage = total > 0 ? (total / 40) * 100 : 0

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
        ca1_score: ca1,
        ca2_score: ca2,
        exam_score: exam,
        total_score: total,
        percentage: Math.round(percentage),
        grade: grade,
      }
    })

    console.log("Prepared midterm scores data:", scoresData)

    // Insert the scores
    const { data, error } = await supabase.from("midterm_scores").insert(scoresData)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save scores", details: error.message }, { status: 500 })
    }

    console.log("Midterm scores saved successfully:", data)

    return NextResponse.json({
      message: "Midterm scores saved successfully",
      count: scoresData.length,
    })
  } catch (error) {
    console.error("Error saving midterm scores:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const exam_id = searchParams.get("exam_id")
    const subject_id = searchParams.get("subject_id")
    const class_id = searchParams.get("class_id") || searchParams.get("classId")
    const class_name = searchParams.get("class_name")
    const academic_year = searchParams.get("academic_year") || searchParams.get("academicYearId")
    const academic_term = searchParams.get("academic_term") || searchParams.get("academicTermId")
    const getStudentsList = searchParams.get("getStudentsList") === "true"

    console.log("GET midterm scores with params:", {
      exam_id,
      subject_id,
      class_id,
      class_name,
      academic_year,
      academic_term,
      getStudentsList,
    })

    let finalClassId = class_id

    // If class_id not provided, try to find it by class_name
    if (!finalClassId && class_name) {
      const { data: classData } = await supabase
        .from("classes")
        .select("id, class_name, section")
        .or(`class_name.eq.${class_name},class_name.ilike.%${class_name}%`)

      if (classData && classData.length > 0) {
        let selectedClass = classData[0]
        if (classData.length > 1) {
          const exactMatch = classData.find(
            (c) => `${c.class_name} ${c.section}` === class_name || c.class_name === class_name
          )
          if (exactMatch) selectedClass = exactMatch
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

    // ✅ Handle student list fetch (for frontend)
    if (getStudentsList) {
      const { data: students, error } = await supabase
        .from("midterm_scores")
        .select("student_id, student_name, reg_number, class_id, class_name, academic_year_id, academic_term_id")
        .eq("class_id", Number(finalClassId))
        .eq("academic_year_id", Number(academic_year))
        .eq("academic_term_id", Number(academic_term))

      if (error) {
        console.error("Error fetching students from midterm_scores:", error)
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
      }

      // Return unique students
      const uniqueStudentsMap = new Map()
      for (const s of students) {
        if (!uniqueStudentsMap.has(s.student_id)) {
          uniqueStudentsMap.set(s.student_id, {
            id: s.student_id,
            student_name: s.student_name,
            reg_number: s.reg_number,
            class_id: s.class_id,
            class_name: s.class_name,
          })
        }
      }

      return NextResponse.json(Array.from(uniqueStudentsMap.values()))
    }

    // ✅ Fallback to full score fetch if not student list
    if (!subject_id || !academic_year || !academic_term) {
      console.log("Missing required parameters for score query")
      return NextResponse.json([])
    }

    let query = supabase
      .from("midterm_scores")
      .select("*")
      .eq("subject_id", Number(subject_id))
      .eq("class_id", Number(finalClassId))
      .eq("academic_year_id", Number(academic_year))
      .eq("academic_term_id", Number(academic_term))

    if (exam_id) {
      query = query.eq("exam_id", Number(exam_id))
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching midterm scores:", error)
      return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Unexpected error in GET midterm_scores:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
