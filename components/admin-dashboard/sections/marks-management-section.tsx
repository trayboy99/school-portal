"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, BookOpen, GraduationCap, Edit, Check, X } from "lucide-react"

interface Student {
  id: string
  first_name: string
  middle_name?: string
  surname: string
  reg_number: string
  username: string
  full_name: string
}

interface Subject {
  id: string
  subject_name: string
  subject_code: string
}

interface Class {
  id: string
  class_name: string
  section: string
  current_students: number
}

interface AcademicYear {
  id: string
  year_name: string
  is_current: boolean
}

interface AcademicTerm {
  id: string
  term_name: string
  is_current: boolean
}

interface Exam {
  id: string
  name: string
  exam_type: string
  exam_date: string
  end_date: string
  status: string
  academic_year_id: number
  academic_term_id: number
  academic_years?: { name: string }
  academic_terms?: { name: string }
}

interface Score {
  student_id: string
  ca1_score: number
  ca2_score: number
  exam_score: number
  total_score: number
  percentage?: number
  grade: string
}

interface SavedScore extends Score {
  student_name: string
  reg_number: string
  id?: string
}

export function MarksManagementSection() {
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>([])
  const [exams, setExams] = useState<Exam[]>([])

  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [selectedExam, setSelectedExam] = useState("")

  const [midtermScores, setMidtermScores] = useState<Record<string, Score>>({})
  const [terminalScores, setTerminalScores] = useState<Record<string, Score>>({})
  const [savedMidtermScores, setSavedMidtermScores] = useState<SavedScore[]>([])
  const [savedTerminalScores, setSavedTerminalScores] = useState<SavedScore[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("midterm")
  const [academicInfo, setAcademicInfo] = useState<{ year_name: string; term_name: string } | null>(null)
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const [editingScoreData, setEditingScoreData] = useState<SavedScore | null>(null)
  const [hasExistingMidtermScores, setHasExistingMidtermScores] = useState(false)
  const [hasExistingTerminalScores, setHasExistingTerminalScores] = useState(false)

  // Load initial data
  useEffect(() => {
    loadClasses()
    loadSubjects()
    loadAcademicYears()
    loadAcademicTerms()
    loadExams()
  }, [])

  useEffect(() => {
    fetchAcademicInfo()
  }, [academicYears, academicTerms])

  const fetchAcademicInfo = async () => {
    try {
      const response = await fetch("/api/admin/current-academic-info")
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.academic_info) {
          setAcademicInfo(data.academic_info)
          const matchingYear = academicYears.find((y) => y.year_name === data.academic_info.year_name)
          const matchingTerm = academicTerms.find((t) => t.term_name === data.academic_info.term_name)
          if (matchingYear && !selectedYear) setSelectedYear(matchingYear.id)
          if (matchingTerm && !selectedTerm) setSelectedTerm(matchingTerm.id)
        }
      }
    } catch (error) {
      console.log("Academic info not available")
    }
  }

  // Load students and existing scores when all filters are selected
  useEffect(() => {
    if (selectedClass && selectedSubject && selectedYear && selectedTerm && selectedExam) {
      console.log("All filters selected, loading data...")
      loadExistingScores()
      loadStudents()
    } else {
      // Reset states when filters are incomplete
      console.log("Filters incomplete, resetting states...")
      setHasExistingMidtermScores(false)
      setHasExistingTerminalScores(false)
      setSavedMidtermScores([])
      setSavedTerminalScores([])
      setStudents([])
      setMessage("")
      setMidtermScores({})
      setTerminalScores({})
    }
  }, [selectedClass, selectedSubject, selectedYear, selectedTerm, selectedExam])

  // Filter exams based on selected filters
  const filteredExams = exams.filter((exam) => {
    if (!selectedYear || !selectedTerm) return true

    // Get the selected year and term names
    const selectedYearName = academicYears.find((y) => y.id === selectedYear)?.year_name
    const selectedTermName = academicTerms.find((t) => t.id === selectedTerm)?.term_name

    // Check if exam matches the selected academic year and term
    const yearMatch =
      exam.academic_years?.name === selectedYearName || exam.academic_year_id === Number.parseInt(selectedYear)
    const termMatch =
      exam.academic_terms?.name === selectedTermName || exam.academic_term_id === Number.parseInt(selectedTerm)

    return yearMatch && termMatch
  })

  const loadClasses = async () => {
    try {
      const response = await fetch("/api/admin/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (error) {
      console.error("Error loading classes:", error)
    }
  }

  const loadSubjects = async () => {
    try {
      const response = await fetch("/api/admin/subjects")
      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
      }
    } catch (error) {
      console.error("Error loading subjects:", error)
    }
  }

  const loadAcademicYears = async () => {
    try {
      const response = await fetch("/api/admin/academic-years")
      if (response.ok) {
        const data = await response.json()
        setAcademicYears(data)
        const currentYear = data.find((year: AcademicYear) => year.is_current)
        if (currentYear && !selectedYear) {
          setSelectedYear(currentYear.id)
        }
      }
    } catch (error) {
      console.error("Error loading academic years:", error)
    }
  }

  const loadAcademicTerms = async () => {
    try {
      const response = await fetch("/api/admin/academic-terms")
      if (response.ok) {
        const data = await response.json()
        setAcademicTerms(data)
        const currentTerm = data.find((term: AcademicTerm) => term.is_current)
        if (currentTerm && !selectedTerm) {
          setSelectedTerm(currentTerm.id)
        }
      }
    } catch (error) {
      console.error("Error loading academic terms:", error)
    }
  }

  const loadExams = async () => {
    try {
      console.log("Loading exams...")
      const response = await fetch("/api/admin/exams")
      if (response.ok) {
        const data = await response.json()
        console.log("Loaded exams:", data)
        setExams(data)
      } else {
        console.error("Failed to load exams:", response.status)
      }
    } catch (error) {
      console.error("Error loading exams:", error)
    }
  }

  const loadExistingScores = async () => {
    if (!selectedClass || !selectedSubject || !selectedYear || !selectedTerm || !selectedExam) {
      console.log("Missing required parameters for loading existing scores")
      return
    }

    console.log("Loading existing scores with parameters:", {
      selectedClass,
      selectedSubject,
      selectedYear,
      selectedTerm,
      selectedExam,
    })

    try {
      // Build query parameters using exam_id as primary filter
      const midtermParams = new URLSearchParams({
        exam_id: selectedExam,
        subject_id: selectedSubject,
        class_id: selectedClass,
        academic_year: selectedYear,
        academic_term: selectedTerm,
      })

      const terminalParams = new URLSearchParams({
        exam_id: selectedExam,
        subject_id: selectedSubject,
        class_id: selectedClass,
        academic_year: selectedYear,
        academic_term: selectedTerm,
      })

      console.log("Fetching midterm scores with URL:", `/api/admin/marks/midterm?${midtermParams.toString()}`)

      // Load midterm scores
      const midtermResponse = await fetch(`/api/admin/marks/midterm?${midtermParams.toString()}`)
      let midtermData: any[] = []

      if (midtermResponse.ok) {
        midtermData = await midtermResponse.json()
        console.log("Midterm API response:", midtermData)

        if (Array.isArray(midtermData) && midtermData.length > 0) {
          console.log("Found existing midterm scores:", midtermData.length)
          setSavedMidtermScores(midtermData)
          setHasExistingMidtermScores(true)
          setMessage(
            `Found ${midtermData.length} existing midterm scores for ${getSelectedSubjectName()} - ${getSelectedExamName()}`,
          )
        } else {
          console.log("No existing midterm scores found")
          setSavedMidtermScores([])
          setHasExistingMidtermScores(false)
        }
      } else {
        console.error("Failed to fetch midterm scores:", midtermResponse.status)
        setSavedMidtermScores([])
        setHasExistingMidtermScores(false)
      }

      console.log("Fetching terminal scores with URL:", `/api/admin/marks/terminal?${terminalParams.toString()}`)

      // Load terminal scores
      const terminalResponse = await fetch(`/api/admin/marks/terminal?${terminalParams.toString()}`)
      let terminalData: any[] = []

      if (terminalResponse.ok) {
        terminalData = await terminalResponse.json()
        console.log("Terminal API response:", terminalData)

        if (Array.isArray(terminalData) && terminalData.length > 0) {
          console.log("Found existing terminal scores:", terminalData.length)
          setSavedTerminalScores(terminalData)
          setHasExistingTerminalScores(true)
          if (!hasExistingMidtermScores) {
            setMessage(
              `Found ${terminalData.length} existing terminal scores for ${getSelectedSubjectName()} - ${getSelectedExamName()}`,
            )
          }
        } else {
          console.log("No existing terminal scores found")
          setSavedTerminalScores([])
          setHasExistingTerminalScores(false)
        }
      } else {
        console.error("Failed to fetch terminal scores:", terminalResponse.status)
        setSavedTerminalScores([])
        setHasExistingTerminalScores(false)
      }

      // If we have midterm scores but no terminal scores, auto-populate terminal from midterm
      if (midtermData.length > 0 && terminalData.length === 0) {
        autoPopulateTerminalFromMidterm(midtermData)
      }
    } catch (error) {
      console.error("Error loading existing scores:", error)
      setSavedMidtermScores([])
      setSavedTerminalScores([])
      setHasExistingMidtermScores(false)
      setHasExistingTerminalScores(false)
    }
  }

  const autoPopulateTerminalFromMidterm = (midtermData: SavedScore[]) => {
    const terminalScoresFromMidterm: Record<string, Score> = {}

    midtermData.forEach((midtermScore) => {
      terminalScoresFromMidterm[midtermScore.student_id] = {
        student_id: midtermScore.student_id,
        ca1_score: midtermScore.ca1_score + midtermScore.ca2_score, // Midterm CA1 + CA2 -> Terminal CA1
        ca2_score: midtermScore.exam_score, // Midterm Exam -> Terminal CA2
        exam_score: 0, // Terminal exam to be entered manually
        total_score: midtermScore.ca1_score + midtermScore.ca2_score + midtermScore.exam_score, // Will be recalculated when exam score is added
        percentage: 0, // Will be recalculated
        grade: "F", // Will be recalculated
      }
    })

    setTerminalScores(terminalScoresFromMidterm)
    console.log("Auto-populated terminal scores from midterm:", terminalScoresFromMidterm)
  }

  const loadStudents = async () => {
    if (!selectedClass || !selectedSubject) return

    setLoading(true)
    try {
      const classObj = classes.find((c) => c.id === selectedClass)
      if (!classObj) {
        console.error("Class not found:", selectedClass)
        setMessage("Selected class not found")
        return
      }

      const fullClassName = `${classObj.class_name} ${classObj.section}`.trim()

      let studentsData: Student[] = []
      let response = await fetch(`/api/admin/marks/students-by-class?class_name=${encodeURIComponent(fullClassName)}`)

      if (response.ok) {
        studentsData = await response.json()
      }

      if (studentsData.length === 0) {
        response = await fetch(
          `/api/admin/marks/students-by-class?class_name=${encodeURIComponent(classObj.class_name)}&section=${encodeURIComponent(classObj.section)}`,
        )

        if (response.ok) {
          studentsData = await response.json()
        }
      }

      if (studentsData.length === 0) {
        response = await fetch("/api/admin/students")

        if (response.ok) {
          const allStudents = await response.json()
          studentsData = allStudents.filter((student: any) => {
            const studentClass = student.class_name || student.current_class || ""
            return (
              studentClass === fullClassName ||
              studentClass === classObj.class_name ||
              studentClass.includes(classObj.class_name)
            )
          })
        }
      }

      const processedStudents = studentsData.map((student: any) => ({
        ...student,
        full_name: student.full_name || `${student.first_name} ${student.middle_name || ""} ${student.surname}`.trim(),
        reg_number: student.reg_number || student.username || "N/A",
      }))

      setStudents(processedStudents)

      // Initialize scores for each student only if no existing scores
      if (!hasExistingMidtermScores && !hasExistingTerminalScores) {
        const initialMidtermScores: Record<string, Score> = {}
        const initialTerminalScores: Record<string, Score> = {}

        processedStudents.forEach((student) => {
          initialMidtermScores[student.id] = {
            student_id: student.id,
            ca1_score: 0,
            ca2_score: 0,
            exam_score: 0,
            total_score: 0,
            percentage: 0,
            grade: "F",
          }
          initialTerminalScores[student.id] = {
            student_id: student.id,
            ca1_score: 0,
            ca2_score: 0,
            exam_score: 0,
            total_score: 0,
            percentage: 0,
            grade: "F",
          }
        })

        setMidtermScores(initialMidtermScores)
        setTerminalScores(initialTerminalScores)
      }

      if (processedStudents.length === 0) {
        setMessage(`No students found for class: ${fullClassName}`)
      } else if (!hasExistingMidtermScores && !hasExistingTerminalScores) {
        setMessage(`Ready to enter marks for ${processedStudents.length} students in ${fullClassName}`)
      }
    } catch (error) {
      console.error("Error loading students:", error)
      setMessage("Error loading students")
    } finally {
      setLoading(false)
    }
  }

  const updateMidtermScore = (studentId: string, field: keyof Score, value: string | number) => {
    let numValue = Number(value)
    if (field === "ca1_score" && numValue > 10) numValue = 10
    if (field === "ca2_score" && numValue > 10) numValue = 10
    if (field === "exam_score" && numValue > 20) numValue = 20
    if (numValue < 0) numValue = 0

    setMidtermScores((prev) => {
      const updated = { ...prev }
      if (!updated[studentId]) {
        updated[studentId] = {
          student_id: studentId,
          ca1_score: 0,
          ca2_score: 0,
          exam_score: 0,
          total_score: 0,
          percentage: 0,
          grade: "F",
        }
      }

      updated[studentId] = { ...updated[studentId], [field]: numValue }

      const score = updated[studentId]
      const total = score.ca1_score + score.ca2_score + score.exam_score
      const percentage = (total / 40) * 100

      let grade = "F"
      if (percentage >= 80) grade = "A"
      else if (percentage >= 70) grade = "B"
      else if (percentage >= 60) grade = "C"
      else if (percentage >= 50) grade = "D"
      else if (percentage >= 40) grade = "E"

      updated[studentId].total_score = total
      updated[studentId].percentage = Math.round(percentage)
      updated[studentId].grade = grade

      return updated
    })

    // Auto-update terminal scores when midterm scores change
    setTerminalScores((prev) => {
      const updated = { ...prev }
      if (!updated[studentId]) {
        updated[studentId] = {
          student_id: studentId,
          ca1_score: 0,
          ca2_score: 0,
          exam_score: 0,
          total_score: 0,
          percentage: 0,
          grade: "F",
        }
      }

      const currentMidtermScore = midtermScores[studentId] || {
        ca1_score: 0,
        ca2_score: 0,
        exam_score: 0,
        total_score: 0,
        percentage: 0,
        grade: "F",
        student_id: studentId,
      }

      // Apply the current update to get the latest midterm score
      const latestMidtermScore = { ...currentMidtermScore, [field]: numValue }

      // Auto-fill terminal CA1 and CA2 from midterm scores
      updated[studentId].ca1_score = latestMidtermScore.ca1_score + latestMidtermScore.ca2_score // midterm ca1 + ca2 -> terminal ca1
      updated[studentId].ca2_score = latestMidtermScore.exam_score // midterm exam -> terminal ca2
      // Keep existing terminal exam score

      const terminalScore = updated[studentId]
      const total = terminalScore.ca1_score + terminalScore.ca2_score + terminalScore.exam_score
      const percentage = (total / 100) * 100

      let grade = "F"
      if (percentage >= 80) grade = "A"
      else if (percentage >= 70) grade = "B"
      else if (percentage >= 60) grade = "C"
      else if (percentage >= 50) grade = "D"
      else if (percentage >= 40) grade = "E"

      updated[studentId].total_score = total
      updated[studentId].percentage = Math.round(percentage)
      updated[studentId].grade = grade

      return updated
    })
  }

  const updateTerminalScore = (studentId: string, field: keyof Score, value: string | number) => {
    if (field !== "exam_score") return // Only allow editing exam score for terminal

    let numValue = Number(value)
    if (numValue > 60) numValue = 60
    if (numValue < 0) numValue = 0

    setTerminalScores((prev) => {
      const updated = { ...prev }
      if (!updated[studentId]) {
        updated[studentId] = {
          student_id: studentId,
          ca1_score: 0,
          ca2_score: 0,
          exam_score: 0,
          total_score: 0,
          percentage: 0,
          grade: "F",
        }
      }

      updated[studentId] = { ...updated[studentId], [field]: numValue }

      const score = updated[studentId]
      const total = score.ca1_score + score.ca2_score + score.exam_score
      const percentage = (total / 100) * 100

      let grade = "F"
      if (percentage >= 80) grade = "A"
      else if (percentage >= 70) grade = "B"
      else if (percentage >= 60) grade = "C"
      else if (percentage >= 50) grade = "D"
      else if (percentage >= 40) grade = "E"

      updated[studentId].total_score = total
      updated[studentId].percentage = Math.round(percentage)
      updated[studentId].grade = grade

      return updated
    })
  }

  const handleSaveScores = async () => {
    if (!selectedClass || !selectedSubject || !selectedYear || !selectedTerm || !selectedExam) {
      setMessage("Please select class, subject, academic year, term, and exam")
      return
    }

    if (students.length === 0) {
      setMessage("No students to save scores for")
      return
    }

    setSaving(true)
    try {
      const classObj = classes.find((c) => c.id === selectedClass)
      if (!classObj) {
        setMessage("Selected class not found")
        return
      }

      const fullClassName = `${classObj.class_name} ${classObj.section}`.trim()

      const currentScores = activeTab === "midterm" ? midtermScores : terminalScores
      const scoresArray = Object.values(currentScores).filter(
        (score) => score.ca1_score > 0 || score.ca2_score > 0 || score.exam_score > 0,
      )

      if (scoresArray.length === 0) {
        setMessage("No scores entered to save")
        return
      }

      const endpoint = activeTab === "midterm" ? "/api/admin/marks/midterm" : "/api/admin/marks/terminal"

      const payload = {
        scores: scoresArray,
        exam_id: selectedExam,
        subject_id: selectedSubject,
        class_name: fullClassName,
        class_id: selectedClass,
        academic_year: selectedYear,
        academic_term: selectedTerm,
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`${result.message} (${result.count} scores saved)`)

        const savedScores = scoresArray.map((score) => {
          const student = students.find((s) => s.id === score.student_id)
          return {
            ...score,
            student_name: student?.full_name || "Unknown",
            reg_number: student?.reg_number || "N/A",
          }
        })

        if (activeTab === "midterm") {
          setSavedMidtermScores(savedScores)
          setHasExistingMidtermScores(true)
        } else {
          setSavedTerminalScores(savedScores)
          setHasExistingTerminalScores(true)
        }

        // Reload existing scores to get the latest data
        setTimeout(() => {
          loadExistingScores()
        }, 500)
      } else {
        setMessage(`Error: ${result.error}`)
        console.error("Save error:", result)
      }
    } catch (error) {
      console.error("Error saving scores:", error)
      setMessage("Error saving scores")
    } finally {
      setSaving(false)
    }
  }

  const handleEditScore = (studentId: string) => {
    const scores = activeTab === "midterm" ? savedMidtermScores : savedTerminalScores
    const scoreToEdit = scores.find((score) => score.student_id === studentId)
    if (scoreToEdit) {
      setEditingScore(studentId)
      setEditingScoreData({ ...scoreToEdit })
    }
  }

  const handleSaveEdit = async () => {
    if (!editingScoreData || !editingScore) return

    setSaving(true)
    try {
      const classObj = classes.find((c) => c.id === selectedClass)
      if (!classObj) {
        setMessage("Selected class not found")
        return
      }

      const fullClassName = `${classObj.class_name} ${classObj.section}`.trim()
      const endpoint = activeTab === "midterm" ? "/api/admin/marks/midterm" : "/api/admin/marks/terminal"

      const payload = {
        scores: [editingScoreData],
        exam_id: selectedExam,
        subject_id: selectedSubject,
        class_name: fullClassName,
        class_id: selectedClass,
        academic_year: selectedYear,
        academic_term: selectedTerm,
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage("Score updated successfully")

        // Update the saved scores list
        if (activeTab === "midterm") {
          setSavedMidtermScores((prev) =>
            prev.map((score) => (score.student_id === editingScore ? editingScoreData : score)),
          )
        } else {
          setSavedTerminalScores((prev) =>
            prev.map((score) => (score.student_id === editingScore ? editingScoreData : score)),
          )
        }

        setEditingScore(null)
        setEditingScoreData(null)
      } else {
        setMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error updating score:", error)
      setMessage("Error updating score")
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingScore(null)
    setEditingScoreData(null)
  }

  const updateEditingScore = (field: keyof Score, value: string | number) => {
    if (!editingScoreData) return

    let numValue = Number(value)

    // Apply validation based on exam type and field
    if (activeTab === "midterm") {
      if (field === "ca1_score" && numValue > 10) numValue = 10
      if (field === "ca2_score" && numValue > 10) numValue = 10
      if (field === "exam_score" && numValue > 20) numValue = 20
    } else {
      if (field === "ca1_score" && numValue > 20) numValue = 20
      if (field === "ca2_score" && numValue > 20) numValue = 20
      if (field === "exam_score" && numValue > 60) numValue = 60
    }

    if (numValue < 0) numValue = 0

    const updatedScore = { ...editingScoreData, [field]: numValue }

    // Recalculate totals and grade
    const total = updatedScore.ca1_score + updatedScore.ca2_score + updatedScore.exam_score
    const maxTotal = activeTab === "midterm" ? 40 : 100
    const percentage = (total / maxTotal) * 100

    let grade = "F"
    if (percentage >= 80) grade = "A"
    else if (percentage >= 70) grade = "B"
    else if (percentage >= 60) grade = "C"
    else if (percentage >= 50) grade = "D"
    else if (percentage >= 40) grade = "E"

    updatedScore.total_score = total
    updatedScore.percentage = Math.round(percentage)
    updatedScore.grade = grade

    setEditingScoreData(updatedScore)
  }

  const getSelectedClassName = () => {
    const classObj = classes.find((c) => c.id === selectedClass)
    return classObj ? `${classObj.class_name} ${classObj.section}` : ""
  }

  const getSelectedSubjectName = () => {
    const subjectObj = subjects.find((s) => s.id === selectedSubject)
    return subjectObj ? subjectObj.subject_name : ""
  }

  const getSelectedExamName = () => {
    const examObj = exams.find((e) => e.id === selectedExam)
    return examObj ? examObj.name : ""
  }

  const hasAnyExistingScores = hasExistingMidtermScores || hasExistingTerminalScores

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Marks Management</h2>
        {academicInfo && (
          <span className="text-sm text-muted-foreground ml-4">
            • {academicInfo.year_name} - {academicInfo.term_name}
          </span>
        )}
      </div>

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class, Subject and Exam</CardTitle>
          <CardDescription>
            Choose the class, subject, academic year, term, and specific exam to manage marks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.class_name} {cls.section} ({cls.current_students} students)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.subject_name} ({subject.subject_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year_name} {year.is_current && "(Current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Academic Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {academicTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.term_name} {term.is_current && "(Current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam">Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {filteredExams.length > 0 ? (
                    filteredExams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        <div className="flex flex-col">
                          <span>
                            {exam.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(exam.exam_date).toLocaleDateString()} - {exam.status}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-exams" disabled>
                      {selectedYear && selectedTerm
                        ? "No exams found for selected year/term"
                        : "Select year and term first"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Debug info */}
          <div className="text-xs text-muted-foreground">
            Total exams loaded: {exams.length} | Filtered exams: {filteredExams.length}
            {selectedYear && selectedTerm && (
              <span>
                {" "}
                | Selected: {academicYears.find((y) => y.id === selectedYear)?.year_name} -{" "}
                {academicTerms.find((t) => t.id === selectedTerm)?.term_name}
              </span>
            )}
          </div>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Show existing scores or entry form */}
      {selectedClass && selectedSubject && selectedYear && selectedTerm && selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {hasAnyExistingScores ? "Existing Scores" : "Marks Entry"} - {getSelectedClassName()} -{" "}
              {getSelectedSubjectName()} - {getSelectedExamName()}
            </CardTitle>
            <CardDescription>
              {hasAnyExistingScores
                ? "Scores have already been entered for this exam. You can edit them below."
                : `Enter marks for ${students.length} students`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="midterm">
                  Midterm Exam {savedMidtermScores.length > 0 && `(${savedMidtermScores.length} saved)`}
                </TabsTrigger>
                <TabsTrigger value="terminal">
                  Terminal Exam {savedTerminalScores.length > 0 && `(${savedTerminalScores.length} saved)`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="midterm" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Midterm Exam: CA1 (10 marks) + CA2 (10 marks) + Exam (20 marks) = 40 marks total
                </div>

                {hasExistingMidtermScores ? (
                  <SavedScoresTable
                    scores={savedMidtermScores}
                    examType="midterm"
                    onEdit={handleEditScore}
                    editingScore={editingScore}
                    editingScoreData={editingScoreData}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    updateEditingScore={updateEditingScore}
                    saving={saving}
                  />
                ) : students.length > 0 ? (
                  <>
                    <MarksTable
                      students={students}
                      scores={midtermScores}
                      updateScore={updateMidtermScore}
                      examType="midterm"
                    />
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleSaveScores} disabled={saving || students.length === 0}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Midterm Scores
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : null}
              </TabsContent>

              <TabsContent value="terminal" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Terminal Exam: CA1 (20 marks) + CA2 (20 marks) + Exam (60 marks) = 100 marks total
                  <br />
                  <span className="text-xs text-blue-600">
                    CA1 and CA2 are auto-filled from midterm scores (read-only)
                  </span>
                </div>

                {hasExistingTerminalScores ? (
                  <SavedScoresTable
                    scores={savedTerminalScores}
                    examType="terminal"
                    onEdit={handleEditScore}
                    editingScore={editingScore}
                    editingScoreData={editingScoreData}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    updateEditingScore={updateEditingScore}
                    saving={saving}
                  />
                ) : students.length > 0 ? (
                  <>
                    <MarksTable
                      students={students}
                      scores={terminalScores}
                      updateScore={updateTerminalScore}
                      examType="terminal"
                    />
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleSaveScores} disabled={saving || students.length === 0}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Terminal Scores
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : null}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading students...
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface MarksTableProps {
  students: Student[]
  scores: Record<string, Score>
  updateScore: (studentId: string, field: keyof Score, value: string | number) => void
  examType: "midterm" | "terminal"
}

function MarksTable({ students, scores, updateScore, examType }: MarksTableProps) {
  const maxScores =
    examType === "midterm" ? { ca1: 10, ca2: 10, exam: 20, total: 40 } : { ca1: 20, ca2: 20, exam: 60, total: 100 }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Reg Number</TableHead>
            <TableHead className="text-center">CA1 (/{maxScores.ca1})</TableHead>
            <TableHead className="text-center">CA2 (/{maxScores.ca2})</TableHead>
            <TableHead className="text-center">Exam (/{maxScores.exam})</TableHead>
            <TableHead className="text-center">Total (/{maxScores.total})</TableHead>
            <TableHead className="text-center">%</TableHead>
            <TableHead className="text-center">Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => {
            const score = scores[student.id] || {
              student_id: student.id,
              ca1_score: 0,
              ca2_score: 0,
              exam_score: 0,
              total_score: 0,
              percentage: 0,
              grade: "F",
            }

            return (
              <TableRow key={student.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{student.full_name}</TableCell>
                <TableCell>{student.reg_number}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max={maxScores.ca1}
                    value={score.ca1_score}
                    onChange={(e) => updateScore(student.id, "ca1_score", Number(e.target.value))}
                    className="w-16 text-center"
                    readOnly={examType === "terminal"}
                    disabled={examType === "terminal"}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max={maxScores.ca2}
                    value={score.ca2_score}
                    onChange={(e) => updateScore(student.id, "ca2_score", Number(e.target.value))}
                    className="w-16 text-center"
                    readOnly={examType === "terminal"}
                    disabled={examType === "terminal"}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max={maxScores.exam}
                    value={score.exam_score}
                    onChange={(e) => updateScore(student.id, "exam_score", Number(e.target.value))}
                    className="w-16 text-center"
                  />
                </TableCell>
                <TableCell className="text-center font-medium">{score.total_score}</TableCell>
                <TableCell className="text-center">{score.percentage}%</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      score.grade === "A"
                        ? "default"
                        : score.grade === "B"
                          ? "secondary"
                          : score.grade === "C"
                            ? "outline"
                            : "destructive"
                    }
                  >
                    {score.grade}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

interface SavedScoresTableProps {
  scores: SavedScore[]
  examType: string
  onEdit: (studentId: string) => void
  editingScore: string | null
  editingScoreData: SavedScore | null
  onSaveEdit: () => void
  onCancelEdit: () => void
  updateEditingScore: (field: keyof Score, value: string | number) => void
  saving: boolean
}

function SavedScoresTable({
  scores,
  examType,
  onEdit,
  editingScore,
  editingScoreData,
  onSaveEdit,
  onCancelEdit,
  updateEditingScore,
  saving,
}: SavedScoresTableProps) {
  const maxScores =
    examType === "midterm" ? { ca1: 10, ca2: 10, exam: 20, total: 40 } : { ca1: 20, ca2: 20, exam: 60, total: 100 }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Reg Number</TableHead>
            <TableHead className="text-center">CA1 (/{maxScores.ca1})</TableHead>
            <TableHead className="text-center">CA2 (/{maxScores.ca2})</TableHead>
            <TableHead className="text-center">Exam (/{maxScores.exam})</TableHead>
            <TableHead className="text-center">Total (/{maxScores.total})</TableHead>
            <TableHead className="text-center">%</TableHead>
            <TableHead className="text-center">Grade</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scores.map((score, index) => {
            const isEditing = editingScore === score.student_id
            const displayScore = isEditing && editingScoreData ? editingScoreData : score

            return (
              <TableRow key={score.student_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{score.student_name}</TableCell>
                <TableCell>{score.reg_number}</TableCell>
                <TableCell className="text-center">
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max={maxScores.ca1}
                      value={displayScore.ca1_score}
                      onChange={(e) => updateEditingScore("ca1_score", Number(e.target.value))}
                      className="w-16 text-center"
                      disabled={examType === "terminal"}
                    />
                  ) : (
                    displayScore.ca1_score
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max={maxScores.ca2}
                      value={displayScore.ca2_score}
                      onChange={(e) => updateEditingScore("ca2_score", Number(e.target.value))}
                      className="w-16 text-center"
                      disabled={examType === "terminal"}
                    />
                  ) : (
                    displayScore.ca2_score
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max={maxScores.exam}
                      value={displayScore.exam_score}
                      onChange={(e) => updateEditingScore("exam_score", Number(e.target.value))}
                      className="w-16 text-center"
                    />
                  ) : (
                    displayScore.exam_score
                  )}
                </TableCell>
                <TableCell className="text-center font-medium">{displayScore.total_score}</TableCell>
                <TableCell className="text-center">{displayScore.percentage}%</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      displayScore.grade === "A"
                        ? "default"
                        : displayScore.grade === "B"
                          ? "secondary"
                          : displayScore.grade === "C"
                            ? "outline"
                            : "destructive"
                    }
                  >
                    {displayScore.grade}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {isEditing ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={onSaveEdit} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={onCancelEdit} disabled={saving}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(score.student_id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
