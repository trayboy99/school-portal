"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Eye, FileSpreadsheet, Calendar } from "lucide-react"

// Add these interfaces after the imports
interface Student {
  id: number
  name: string
  rollNo: string
  ca1: number
  ca2: number
  exam: number
  total: number
}

interface SubjectScore {
  ca1: number
  ca2: number
  exam: number
  total: number
  grade: string
  hasScore: boolean
}

interface StudentSubjects {
  [key: string]: SubjectScore
}

interface ReportStudent {
  sn: number
  rollNo: string
  name: string
  subjects: StudentSubjects
  subjectsNeedingAttention?: SubjectNeedingAttention[]
}

interface SubjectNeedingAttention {
  subject: string
  score: number
  percentage: string
  grade: string
}

interface StudentScore {
  ca1: number
  ca2: number
  exam: number
  total: number
  grade: string
}

interface StudentScores {
  [studentId: number]: StudentScore
}

interface Exam {
  id: number
  name: string
  type: string
  session: string
  year: string
  term: string
  startDate: string
  endDate: string
  status: string
  examType: string
  yearValue: string
  sessionValue: string
  termValue: string
}

interface AcademicCalendar {
  currentSession: string
  currentTerm: string
  currentTermName: string
  academicYearStart: string
  academicYearEnd: string
  currentYear: string
}

// Academic Calendar Integration - Auto-fill from settings
const academicCalendarData = {
  currentSession: "2024-2025",
  currentTerm: "second", // This would come from settings
  currentTermName: "Second Term",
  academicYearStart: "2024-09-01",
  academicYearEnd: "2025-08-31",
  // Calculate the correct year based on session and term
  get currentYear() {
    const [startYear, endYear] = this.currentSession.split("-")
    // First term uses start year, second and third terms use end year
    return this.currentTerm === "first" ? startYear : endYear
  },
}

export default function ExamManagement() {
  const [selectedMarkType, setSelectedMarkType] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedExam, setSelectedExam] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [showScoresSheet, setShowScoresSheet] = useState<boolean>(false)
  const [createdExams, setCreatedExams] = useState<Exam[]>([])
  const [isNewExam, setIsNewExam] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [studentScores, setStudentScores] = useState<StudentScores>({})
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveMessage, setSaveMessage] = useState<string>("")

  // Add these new state variables after the existing state declarations
  const [selectedExamType, setSelectedExamType] = useState<string>("")
  const [reportGenerated, setReportGenerated] = useState<boolean>(false)
  const [reportData, setReportData] = useState<ReportStudent[]>([])
  const [allSubjects] = useState<string[]>([
    "Mathematics",
    "English Language",
    "Physics",
    "Chemistry",
    "Biology",
    "Geography",
    "History",
    "Economics",
    "Literature in English",
    "Government",
    "French",
    "Computer Science",
    "Further Mathematics",
    "Civic Education",
    "Agricultural Science",
  ])

  const [academicCalendar] = useState(academicCalendarData)

  // Sample data
  const exams = [
    {
      id: 1,
      name: "First Term Mathematics Examination",
      type: "Mid Term",
      session: "2024/2025",
      year: "2024",
      term: "First Term",
      startDate: "2024-01-15",
      endDate: "2024-01-25",
      status: "Completed",
      examType: "midterm",
      yearValue: "2024",
      sessionValue: "2024-2025",
      termValue: "first",
    },
    {
      id: 2,
      name: "Second Term English Examination",
      type: "Terminal",
      session: "2024/2025",
      year: "2024",
      term: "Second Term",
      startDate: "2024-04-10",
      endDate: "2024-04-20",
      status: "Scheduled",
      examType: "terminal",
      yearValue: "2024",
      sessionValue: "2024-2025",
      termValue: "second",
    },
    {
      id: 3,
      name: "First Term Science Examination",
      type: "Mid Term",
      session: "2024/2025",
      year: "2024",
      term: "First Term",
      startDate: "2024-01-18",
      endDate: "2024-01-28",
      status: "In Progress",
      examType: "midterm",
      yearValue: "2024",
      sessionValue: "2024-2025",
      termValue: "first",
    },
  ]

  const students = [
    { id: 1, name: "John Doe", rollNo: "2024001", ca1: 8, ca2: 9, exam: 18, total: 35 },
    { id: 2, name: "Jane Smith", rollNo: "2024002", ca1: 7, ca2: 8, exam: 16, total: 31 },
    { id: 3, name: "Mike Johnson", rollNo: "2024003", ca1: 9, ca2: 10, exam: 19, total: 38 },
    { id: 4, name: "Sarah Wilson", rollNo: "2024004", ca1: 6, ca2: 7, exam: 15, total: 28 },
    { id: 5, name: "David Brown", rollNo: "2024005", ca1: 8, ca2: 8, exam: 17, total: 33 },
  ]

  const getMaxMarks = () => {
    if (selectedMarkType === "midterm") {
      return { ca1: 10, ca2: 10, exam: 20, total: 40 }
    } else if (selectedMarkType === "terminal") {
      return { ca1: 20, ca2: 20, exam: 60, total: 100 }
    }
    return { ca1: 0, ca2: 0, exam: 0, total: 0 }
  }

  const calculateTotal = (ca1: number, ca2: number, exam: number): number => {
    return (ca1 || 0) + (ca2 || 0) + (exam || 0)
  }

  const handleCreateExam = (formData: FormData) => {
    const examType = formData.get("exam-type") as string
    const examName = formData.get("exam-name") as string
    const startDate = formData.get("start-date") as string
    const endDate = formData.get("end-date") as string

    // Use academic calendar values directly instead of form data
    const session = academicCalendar.currentSession
    const year = academicCalendar.currentYear
    const term = academicCalendar.currentTerm

    // Map term value to display text
    const termText = academicCalendar.currentTermName

    const newExam: Exam = {
      id: Date.now(),
      name: examName,
      type: examType === "midterm" ? "Mid Term" : "Terminal",
      session: session.replace("-", "/"),
      year: year,
      term: termText,
      startDate: startDate,
      endDate: endDate,
      status: "Scheduled",
      examType: examType,
      yearValue: year,
      sessionValue: session,
      termValue: term,
    }

    setCreatedExams((prev) => [...prev, newExam])
    setIsNewExam(true)
    setIsDialogOpen(false)

    // Auto-select the newly created exam in marks entry
    const examKey = examName.toLowerCase().replace(/\s+/g, "-")
    setSelectedExam(examKey)
    setSelectedMarkType(examType)
    setSelectedYear(year)
    setSelectedSession(session)
    setSelectedTerm(term)
  }

  const handleExamSelection = (examValue: string) => {
    setSelectedExam(examValue)

    // Find the exam and auto-set the mark type, year, session, and term
    const allExams = [...exams, ...createdExams]
    const selectedExamData = allExams.find(
      (exam) => exam.name.toLowerCase().replace(/\s+/g, "-") === examValue || exam.id.toString() === examValue,
    )

    if (selectedExamData) {
      setSelectedMarkType(selectedExamData.examType)
      setSelectedYear(selectedExamData.yearValue)
      setSelectedSession(selectedExamData.sessionValue)
      setSelectedTerm(selectedExamData.termValue)

      // Check if this is a newly created exam
      const isNewlyCreated = createdExams.some((exam) => exam.id === selectedExamData.id)
      setIsNewExam(isNewlyCreated)
    }
  }

  const handleGenerateScoresSheet = () => {
    if (
      selectedExam &&
      selectedMarkType &&
      selectedClass &&
      selectedSubject &&
      selectedYear &&
      selectedSession &&
      selectedTerm
    ) {
      setShowScoresSheet(true)
    }
  }

  const maxMarks = getMaxMarks()

  // Get all available exams (existing + created)
  const allExams = [...exams, ...createdExams]

  const handleScoreChange = (studentId: number, field: string, value: string | number) => {
    setStudentScores((prev) => {
      // Get current student scores or initialize if not exists
      const currentStudentScores = prev[studentId] || { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-" }

      // Update the specific field
      const updatedScores = {
        ...currentStudentScores,
        [field]: Number.parseInt(value as string) || 0,
      }

      // Calculate total
      const total = updatedScores.ca1 + updatedScores.ca2 + updatedScores.exam
      updatedScores.total = total

      // Calculate grade
      if (total >= maxMarks.total * 0.8) {
        updatedScores.grade = "A"
      } else if (total >= maxMarks.total * 0.6) {
        updatedScores.grade = "B"
      } else if (total >= maxMarks.total * 0.5) {
        updatedScores.grade = "C"
      } else if (total >= maxMarks.total * 0.4) {
        updatedScores.grade = "D"
      } else {
        updatedScores.grade = "F"
      }

      return {
        ...prev,
        [studentId]: updatedScores,
      }
    })
  }

  const handleSaveAllMarks = async () => {
    setIsSaving(true)
    setSaveMessage("")

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Here you would typically send the data to your backend
      const marksData = {
        exam: selectedExam,
        markType: selectedMarkType,
        class: selectedClass,
        subject: selectedSubject,
        year: selectedYear,
        session: selectedSession,
        term: selectedTerm,
        scores: studentScores,
      }

      console.log("Saving marks data:", marksData)

      setSaveMessage("All marks saved successfully!")
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      setSaveMessage("Error saving marks. Please try again.")
      setTimeout(() => setSaveMessage(""), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  React.useEffect(() => {
    // Reset student scores when a new exam is selected
    setStudentScores({})
  }, [selectedExam, selectedClass, selectedSubject])

  // Add this function before the return statement
  const handleGenerateReport = () => {
    if (!selectedExam || !selectedClass) {
      return
    }

    // Don't reset created exams - preserve them
    // setCreatedExams([]) // Remove this line if it exists

    // Sample comprehensive report data - in real app, this would come from API
    const sampleReportData = [
      {
        sn: 1,
        rollNo: "2024001",
        name: "John Doe",
        subjects: {
          Mathematics: { ca1: 9, ca2: 8, exam: 18, total: 35, grade: "A", hasScore: true },
          "English Language": { ca1: 8, ca2: 7, exam: 16, total: 31, grade: "B", hasScore: true },
          Physics: { ca1: 9, ca2: 9, exam: 19, total: 37, grade: "A", hasScore: true },
          Chemistry: { ca1: 7, ca2: 8, exam: 15, total: 30, grade: "B", hasScore: true },
          Biology: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Geography: { ca1: 8, ca2: 7, exam: 17, total: 32, grade: "B", hasScore: true },
          History: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Economics: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Literature in English": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Government: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          French: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Computer Science": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Further Mathematics": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Civic Education": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Agricultural Science": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
        },
      },
      {
        sn: 2,
        rollNo: "2024002",
        name: "Jane Smith",
        subjects: {
          Mathematics: { ca1: 10, ca2: 9, exam: 19, total: 38, grade: "A", hasScore: true },
          "English Language": { ca1: 9, ca2: 8, exam: 18, total: 35, grade: "A", hasScore: true },
          Physics: { ca1: 8, ca2: 9, exam: 17, total: 34, grade: "A", hasScore: true },
          Chemistry: { ca1: 9, ca2: 8, exam: 18, total: 35, grade: "A", hasScore: true },
          Biology: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Geography: { ca1: 7, ca2: 8, exam: 16, total: 31, grade: "B", hasScore: true },
          History: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Economics: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Literature in English": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Government: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          French: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Computer Science": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Further Mathematics": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Civic Education": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Agricultural Science": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
        },
      },
      {
        sn: 3,
        rollNo: "2024003",
        name: "Mike Johnson",
        subjects: {
          Mathematics: { ca1: 8, ca2: 7, exam: 16, total: 31, grade: "B", hasScore: true },
          "English Language": { ca1: 7, ca2: 6, exam: 14, total: 27, grade: "C", hasScore: true },
          Physics: { ca1: 7, ca2: 8, exam: 15, total: 30, grade: "B", hasScore: true },
          Chemistry: { ca1: 6, ca2: 7, exam: 13, total: 26, grade: "C", hasScore: true },
          Biology: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Geography: { ca1: 6, ca2: 6, exam: 12, total: 24, grade: "C", hasScore: true },
          History: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Economics: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Literature in English": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Government: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          French: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Computer Science": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Further Mathematics": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Civic Education": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Agricultural Science": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
        },
      },
      {
        sn: 4,
        rollNo: "2024004",
        name: "Sarah Wilson",
        subjects: {
          Mathematics: { ca1: 6, ca2: 5, exam: 12, total: 23, grade: "C", hasScore: true },
          "English Language": { ca1: 5, ca2: 6, exam: 11, total: 22, grade: "C", hasScore: true },
          Physics: { ca1: 5, ca2: 5, exam: 10, total: 20, grade: "D", hasScore: true },
          Chemistry: { ca1: 4, ca2: 5, exam: 9, total: 18, grade: "F", hasScore: true },
          Biology: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Geography: { ca1: 5, ca2: 4, exam: 8, total: 17, grade: "F", hasScore: true },
          History: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Economics: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Literature in English": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Government: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          French: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Computer Science": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Further Mathematics": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Civic Education": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "F", hasScore: true },
          "Agricultural Science": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "F", hasScore: true },
        },
      },
      {
        sn: 5,
        rollNo: "2024005",
        name: "David Brown",
        subjects: {
          Mathematics: { ca1: 9, ca2: 8, exam: 19, total: 36, grade: "A", hasScore: true },
          "English Language": { ca1: 8, ca2: 9, exam: 17, total: 34, grade: "A", hasScore: true },
          Physics: { ca1: 8, ca2: 8, exam: 16, total: 32, grade: "B", hasScore: true },
          Chemistry: { ca1: 8, ca2: 7, exam: 16, total: 31, grade: "B", hasScore: true },
          Biology: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Geography: { ca1: 7, ca2: 7, exam: 15, total: 29, grade: "B", hasScore: true },
          History: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Economics: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Literature in English": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          Government: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          French: { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Computer Science": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Further Mathematics": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Civic Education": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
          "Agricultural Science": { ca1: 0, ca2: 0, exam: 0, total: 0, grade: "-", hasScore: false },
        },
      },
    ]

    setReportData(sampleReportData)
    setReportGenerated(true)
  }

  // Add function to get subjects with missing scores
  const getSubjectsWithMissingScores = (): { [key: string]: string[] } => {
    const missingSubjects: { [key: string]: string[] } = {}

    reportData.forEach((student) => {
      allSubjects.forEach((subject) => {
        if (!student.subjects[subject]?.hasScore) {
          if (!missingSubjects[subject]) {
            missingSubjects[subject] = []
          }
          missingSubjects[subject].push(student.name)
        }
      })
    })

    return missingSubjects
  }

  // Add function to get subjects with entered scores
  const getSubjectsWithScores = () => {
    return allSubjects.filter((subject) => reportData.some((student) => student.subjects[subject]?.hasScore))
  }

  // Add this function before the return statement, after getSubjectsWithScores function
  const getStudentsNeedingAttention = (): ReportStudent[] => {
    const studentsNeedingAttention: ReportStudent[] = []

    reportData.forEach((student) => {
      const subjectsNeedingAttention: SubjectNeedingAttention[] = []
      const subjectsWithScores = getSubjectsWithScores()

      subjectsWithScores.forEach((subject) => {
        const subjectData = student.subjects[subject]
        if (subjectData.hasScore) {
          const maxMarks = selectedMarkType === "midterm" ? 40 : 100
          const percentage = (subjectData.total / maxMarks) * 100
          if (percentage < 50) {
            subjectsNeedingAttention.push({
              subject,
              score: subjectData.total,
              percentage: percentage.toFixed(1),
              grade: subjectData.grade,
            })
          }
        }
      })

      if (subjectsNeedingAttention.length > 0) {
        studentsNeedingAttention.push({
          ...student,
          subjectsNeedingAttention,
        })
      }
    })

    return studentsNeedingAttention
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-600">Manage Examinations</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>
                  Set up a new examination with basic details and notify stakeholders.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Academic Calendar Integration</p>
                    <p className="text-blue-600">
                      Current: {academicCalendar.currentTermName} • {academicCalendar.currentSession.replace("-", "/")}{" "}
                      • Year {academicCalendar.currentYear}
                    </p>
                  </div>
                </div>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target as HTMLFormElement)
                  handleCreateExam(formData)
                }}
              >
                <div className="grid gap-4 py-4 px-1">
                  <div className="space-y-2">
                    <Label htmlFor="exam-name">Exam Name *</Label>
                    <Input
                      id="exam-name"
                      name="exam-name"
                      placeholder={`${academicCalendar.currentTermName} Examination`}
                      defaultValue={`${academicCalendar.currentTermName} `}
                      className="w-full"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      💡 <strong>Tip:</strong> Use descriptive names like "Midterm Exam 2024/2025" or "Terminal Exam
                      2024/2025" to easily identify exams
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exam-type">Exam Type *</Label>
                    <Select name="exam-type" value={selectedExamType} onValueChange={setSelectedExamType} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="midterm">Mid Term Marks</SelectItem>
                        <SelectItem value="terminal">Terminal Exam Marks</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      {selectedExamType === "midterm"
                        ? "Mid-term exams typically occur in the middle of the term"
                        : selectedExamType === "terminal"
                          ? "Terminal exams occur at the end of the term"
                          : "Select exam type to see suggested dates"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session">Session *</Label>
                      <div className="relative">
                        <Input
                          name="session"
                          value={academicCalendar.currentSession.replace("-", "/")}
                          readOnly
                          className="w-full bg-blue-50 border-blue-200 cursor-not-allowed"
                        />
                        <div className="absolute -top-6 right-0">
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600">Auto-filled from academic calendar (read-only)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <div className="relative">
                        <Input
                          name="year"
                          value={academicCalendar.currentYear}
                          readOnly
                          className="w-full bg-blue-50 border-blue-200 cursor-not-allowed"
                        />
                        <div className="absolute -top-6 right-0">
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600">Auto-filled from academic calendar (read-only)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="term">Term *</Label>
                    <div className="relative">
                      <Input
                        name="term"
                        value={academicCalendar.currentTermName}
                        readOnly
                        className="w-full bg-blue-50 border-blue-200 cursor-not-allowed"
                      />
                      <div className="absolute -top-6 right-0">
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600">Auto-filled from academic calendar (read-only)</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date *</Label>
                      <Input
                        id="start-date"
                        name="start-date"
                        type="date"
                        className="w-full"
                        defaultValue={
                          academicCalendar.currentTerm === "first"
                            ? selectedExamType === "midterm" || !selectedExamType
                              ? "2024-10-15"
                              : "2024-11-20"
                            : academicCalendar.currentTerm === "second"
                              ? selectedExamType === "midterm" || !selectedExamType
                                ? "2025-02-15"
                                : "2025-04-01"
                              : selectedExamType === "midterm" || !selectedExamType
                                ? "2025-06-15"
                                : "2025-07-20"
                        }
                        min={
                          academicCalendar.currentTerm === "first"
                            ? "2024-09-01"
                            : academicCalendar.currentTerm === "second"
                              ? "2025-01-08"
                              : "2025-05-01"
                        }
                        max={
                          academicCalendar.currentTerm === "first"
                            ? "2024-12-15"
                            : academicCalendar.currentTerm === "second"
                              ? "2025-04-15"
                              : "2025-08-31"
                        }
                        required
                      />
                      <p className="text-xs text-blue-600">
                        Suggested for {academicCalendar.currentTermName}. Must be within:{" "}
                        {academicCalendar.currentTerm === "first"
                          ? "Sep 1 - Dec 15, 2024"
                          : academicCalendar.currentTerm === "second"
                            ? "Jan 8 - Apr 15, 2025"
                            : "May 1 - Aug 31, 2025"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date *</Label>
                      <Input
                        id="end-date"
                        name="end-date"
                        type="date"
                        className="w-full"
                        defaultValue={
                          academicCalendar.currentTerm === "first"
                            ? selectedExamType === "midterm" || !selectedExamType
                              ? "2024-10-25"
                              : "2024-12-05"
                            : academicCalendar.currentTerm === "second"
                              ? selectedExamType === "midterm" || !selectedExamType
                                ? "2025-02-25"
                                : "2025-04-15"
                              : selectedExamType === "midterm" || !selectedExamType
                                ? "2025-06-25"
                                : "2025-08-05"
                        }
                        min={
                          academicCalendar.currentTerm === "first"
                            ? "2024-09-01"
                            : academicCalendar.currentTerm === "second"
                              ? "2025-01-08"
                              : "2025-05-01"
                        }
                        max={
                          academicCalendar.currentTerm === "first"
                            ? "2024-12-15"
                            : academicCalendar.currentTerm === "second"
                              ? "2025-04-15"
                              : "2025-08-31"
                        }
                        required
                      />
                      <p className="text-xs text-blue-600">
                        Exam duration typically 1-2 weeks. Adjust as needed for your schedule.
                      </p>
                    </div>
                  </div>

                  {/* Notification Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold">Send Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notify-teachers" className="rounded" defaultChecked />
                        <Label htmlFor="notify-teachers" className="text-sm">
                          Notify Teachers
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notify-students" className="rounded" defaultChecked />
                        <Label htmlFor="notify-students" className="text-sm">
                          Notify Students
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notify-parents" className="rounded" defaultChecked />
                        <Label htmlFor="notify-parents" className="text-sm">
                          Notify Parents
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    Create Exam & Send Notifications
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="exams" className="space-y-6">
        <TabsList>
          <TabsTrigger value="exams">Exam Management</TabsTrigger>
          <TabsTrigger value="marks">Marks Entry</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Exam Management Tab */}
        <TabsContent value="exams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Exams</CardTitle>
              <CardDescription>View and manage all examinations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.name}</TableCell>
                      <TableCell>
                        <Badge variant={exam.type === "Mid Term" ? "default" : "secondary"}>{exam.type}</Badge>
                      </TableCell>
                      <TableCell>{exam.session}</TableCell>
                      <TableCell>{exam.year}</TableCell>
                      <TableCell>{exam.term}</TableCell>
                      <TableCell>{exam.startDate}</TableCell>
                      <TableCell>{exam.endDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            exam.status === "Completed"
                              ? "default"
                              : exam.status === "In Progress"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {exam.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marks Entry Tab */}
        <TabsContent value="marks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marks Entry</CardTitle>
              <CardDescription>Enter and manage student marks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exam-name-select">Exam Name</Label>
                  <Select value={selectedExam} onValueChange={handleExamSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {allExams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.name.toLowerCase().replace(/\s+/g, "-")}>
                          {exam.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mark-type">Mark Type</Label>
                  <Select value={selectedMarkType} onValueChange={setSelectedMarkType} disabled={!!selectedExam}>
                    <SelectTrigger className={selectedExam ? "bg-gray-100 cursor-not-allowed" : ""}>
                      <SelectValue placeholder="Select mark type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midterm">Mid Term Marks</SelectItem>
                      <SelectItem value="terminal">Terminal Exam Marks</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedExam && (
                    <p className="text-xs text-gray-500">Mark type is automatically set based on the selected exam</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class-select">Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grade-10a">Grade 10A</SelectItem>
                      <SelectItem value="grade-10b">Grade 10B</SelectItem>
                      <SelectItem value="grade-9a">Grade 9A</SelectItem>
                      <SelectItem value="grade-9b">Grade 9B</SelectItem>
                      <SelectItem value="grade-11a">Grade 11A</SelectItem>
                      <SelectItem value="grade-11b">Grade 11B</SelectItem>
                      <SelectItem value="grade-12a">Grade 12A</SelectItem>
                      <SelectItem value="grade-12b">Grade 12B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject-select">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="english">English Language</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="economics">Economics</SelectItem>
                      <SelectItem value="literature">Literature in English</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="further-mathematics">Further Mathematics</SelectItem>
                      <SelectItem value="civic-education">Civic Education</SelectItem>
                      <SelectItem value="agricultural-science">Agricultural Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year-select">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear} disabled={!!selectedExam}>
                    <SelectTrigger className={selectedExam ? "bg-gray-100 cursor-not-allowed" : ""}>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedExam && (
                    <p className="text-xs text-gray-500">Year is automatically set based on the selected exam</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-select">Session</Label>
                  <Select value={selectedSession} onValueChange={setSelectedSession} disabled={!!selectedExam}>
                    <SelectTrigger className={selectedExam ? "bg-gray-100 cursor-not-allowed" : ""}>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-2024">2023/2024</SelectItem>
                      <SelectItem value="2024-2025">2024/2025</SelectItem>
                      <SelectItem value="2025-2026">2025/2026</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedExam && (
                    <p className="text-xs text-gray-500">Session is automatically set based on the selected exam</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term-select">Term</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm} disabled={!!selectedExam}>
                    <SelectTrigger className={selectedExam ? "bg-gray-100 cursor-not-allowed" : ""}>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First Term</SelectItem>
                      <SelectItem value="second">Second Term</SelectItem>
                      <SelectItem value="third">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedExam && (
                    <p className="text-xs text-gray-500">Term is automatically set based on the selected exam</p>
                  )}
                </div>
              </div>

              {/* Generate Scores Sheet Button */}
              {selectedExam &&
                selectedMarkType &&
                selectedClass &&
                selectedSubject &&
                selectedYear &&
                selectedSession &&
                selectedTerm && (
                  <div className="flex justify-center">
                    <Button onClick={handleGenerateScoresSheet} className="w-full sm:w-auto">
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Generate Scores Sheet
                    </Button>
                  </div>
                )}

              {/* Scores Sheet */}
              {showScoresSheet && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedMarkType === "midterm" ? "Mid Term" : "Terminal"} Scores Sheet -{" "}
                        {selectedClass === "grade-10a"
                          ? "Grade 10A"
                          : selectedClass === "grade-10b"
                            ? "Grade 10B"
                            : selectedClass === "grade-9a"
                              ? "Grade 9A"
                              : selectedClass === "grade-9b"
                                ? "Grade 9B"
                                : selectedClass === "grade-11a"
                                  ? "Grade 11A"
                                  : selectedClass === "grade-11b"
                                    ? "Grade 11B"
                                    : selectedClass === "grade-12a"
                                      ? "Grade 12A"
                                      : "Grade 12B"}{" "}
                        -{" "}
                        {selectedSubject === "mathematics"
                          ? "Mathematics"
                          : selectedSubject === "english"
                            ? "English Language"
                            : selectedSubject === "physics"
                              ? "Physics"
                              : selectedSubject === "chemistry"
                                ? "Chemistry"
                                : selectedSubject === "biology"
                                  ? "Biology"
                                  : selectedSubject === "geography"
                                    ? "Geography"
                                    : selectedSubject === "history"
                                      ? "History"
                                      : selectedSubject === "economics"
                                        ? "Economics"
                                        : selectedSubject === "literature"
                                          ? "Literature in English"
                                          : selectedSubject === "government"
                                            ? "Government"
                                            : selectedSubject === "french"
                                              ? "French"
                                              : selectedSubject === "computer-science"
                                                ? "Computer Science"
                                                : selectedSubject === "further-mathematics"
                                                  ? "Further Mathematics"
                                                  : selectedSubject === "civic-education"
                                                    ? "Civic Education"
                                                    : selectedSubject === "agricultural-science"
                                                      ? "Agricultural Science"
                                                      : "Subject"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Mark Distribution: 1CA ({maxMarks.ca1}), 2CA ({maxMarks.ca2}), Exam ({maxMarks.exam}), Total (
                        {maxMarks.total})
                      </p>
                    </div>
                    <Button onClick={handleSaveAllMarks} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save All Marks"}
                    </Button>
                    {saveMessage && (
                      <div
                        className={`text-sm mt-2 ${saveMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}
                      >
                        {saveMessage}
                      </div>
                    )}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>1CA ({maxMarks.ca1})</TableHead>
                        <TableHead>2CA ({maxMarks.ca2})</TableHead>
                        <TableHead>Exam ({maxMarks.exam})</TableHead>
                        <TableHead>Total ({maxMarks.total})</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      
{students.map((student) => {
  let initialCA1 = 0,
      initialCA2 = 0,
      initialExam = 0,
      isCAReadOnly = false;

  const midtermResults = {
    1: { year: "2024", term: "second", session: "2024-2025", scores: { ca1: 8, ca2: 9, exam: 18 } },
    2: { year: "2024", term: "second", session: "2024-2025", scores: { ca1: 7, ca2: 8, exam: 16 } },
    3: { year: "2024", term: "second", session: "2024-2025", scores: { ca1: 9, ca2: 10, exam: 19 } },
  };

  const midterm = midtermResults[student.id];
  const isMidtermMatch =
    midterm &&
    midterm.year === selectedYear &&
    midterm.term === selectedTerm &&
    midterm.session === selectedSession;

  if (selectedMarkType === "terminal" && isMidtermMatch) {
    initialCA1 = midterm.scores.ca1 + midterm.scores.ca2;
    initialCA2 = midterm.scores.exam;
    isCAReadOnly = true;
  } else {
    initialCA1 = isNewExam ? 0 : selectedMarkType === "midterm" ? student.ca1 : student.ca1 * 2;
    initialCA2 = isNewExam ? 0 : selectedMarkType === "midterm" ? student.ca2 : student.ca2 * 2;
  }

  if (selectedMarkType === "terminal") {
  initialExam = 0; // always empty for terminal exams
} else {
  initialExam = isNewExam ? 0 : student.exam;
}



  if (!studentScores[student.id]) {
    handleScoreChange(student.id, "ca1", initialCA1);
    handleScoreChange(student.id, "ca2", initialCA2);
    handleScoreChange(student.id, "exam", initialExam);
  }

  const currentScores = studentScores[student.id] || {
    ca1: initialCA1,
    ca2: initialCA2,
    exam: initialExam,
    total: initialCA1 + initialCA2 + initialExam,
    grade: "-",
  };

  return (
    <TableRow key={student.id}>
      <TableCell>{student.rollNo}</TableCell>
      <TableCell className="font-medium">{student.name}</TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          max={maxMarks.ca1}
          value={currentScores.ca1}
          onChange={(e) => handleScoreChange(student.id, "ca1", e.target.value)}
          placeholder="0"
          className="w-20"
          readOnly={isCAReadOnly}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          max={maxMarks.ca2}
          value={currentScores.ca2}
          onChange={(e) => handleScoreChange(student.id, "ca2", e.target.value)}
          placeholder="0"
          className="w-20"
          readOnly={isCAReadOnly}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          max={maxMarks.exam}
          value={currentScores.exam}
          onChange={(e) => handleScoreChange(student.id, "exam", e.target.value)}
          placeholder="0"
          className="w-20"
        />
      </TableCell>
      <TableCell className="font-medium">{currentScores.total}</TableCell>
      <TableCell>
        <Badge
          variant={
            currentScores.grade === "A"
              ? "default"
              : currentScores.grade === "B" || currentScores.grade === "C"
              ? "secondary"
              : currentScores.grade === "D" || currentScores.grade === "F"
              ? "destructive"
              : "secondary"
          }
        >
          {currentScores.grade}
        </Badge>
      </TableCell>
    </TableRow>
  );
})}

                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Filter Section for Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Score Reports</CardTitle>
              <CardDescription>View comprehensive score broadsheets and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="report-exam">Exam Name</Label>
                  <Select value={selectedExam} onValueChange={handleExamSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {allExams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.name.toLowerCase().replace(/\s+/g, "-")}>
                          {exam.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-class">Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grade-10a">Grade 10A</SelectItem>
                      <SelectItem value="grade-10b">Grade 10B</SelectItem>
                      <SelectItem value="grade-9a">Grade 9A</SelectItem>
                      <SelectItem value="grade-9b">Grade 9B</SelectItem>
                      <SelectItem value="grade-11a">Grade 11A</SelectItem>
                      <SelectItem value="grade-11b">Grade 11B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-term">Term</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm} disabled={!!selectedExam}>
                    <SelectTrigger className={selectedExam ? "bg-gray-100 cursor-not-allowed" : ""}>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First Term</SelectItem>
                      <SelectItem value="second">Second Term</SelectItem>
                      <SelectItem value="third">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedExam && (
                    <p className="text-xs text-gray-500">Term is automatically set based on the selected exam</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-session">Session</Label>
                  <Select value={selectedSession} onValueChange={setSelectedSession} disabled={!!selectedExam}>
                    <SelectTrigger className={selectedExam ? "bg-gray-100 cursor-not-allowed" : ""}>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-2024">2023/2024</SelectItem>
                      <SelectItem value="2024-2025">2024/2025</SelectItem>
                      <SelectItem value="2025-2026">2025/2026</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedExam && (
                    <p className="text-xs text-gray-500">Session is automatically set based on the selected exam</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-year">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear} disabled={!!selectedExam}>
                    <SelectTrigger className={selectedExam ? "bg-gray-100 cursor-not-allowed" : ""}>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedExam && (
                    <p className="text-xs text-gray-500">Year is automatically set based on the selected exam</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <Button onClick={handleGenerateReport}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Report Display */}
          {reportGenerated && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Comprehensive Score Report -{" "}
                  {selectedClass === "grade-10a"
                    ? "Grade 10A"
                    : selectedClass === "grade-10b"
                      ? "Grade 10B"
                      : selectedClass === "grade-9a"
                        ? "Grade 9A"
                        : selectedClass === "grade-9b"
                          ? "Grade 9B"
                          : selectedClass === "grade-11a"
                            ? "Grade 11A"
                            : "Grade 11B"}
                  ({selectedTerm === "first" ? "First Term" : selectedTerm === "second" ? "Second Term" : "Third Term"}{" "}
                  {selectedSession?.replace("-", "/")})
                </CardTitle>
                <CardDescription>All subjects with entered scores and follow-up tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{reportData.length}</div>
                    <div className="text-sm text-blue-800">Total Students</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{getSubjectsWithScores().length}</div>
                    <div className="text-sm text-green-800">Subjects with Scores</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {allSubjects.length - getSubjectsWithScores().length}
                    </div>
                    <div className="text-sm text-yellow-800">Subjects Pending</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{getStudentsNeedingAttention().length}</div>
                    <div className="text-sm text-orange-800">Students Need Attention</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{allSubjects.length}</div>
                    <div className="text-sm text-purple-800">Total Subjects</div>
                  </div>
                </div>

                {/* Comprehensive Score Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">S/N</TableHead>
                        <TableHead className="w-24">Roll No.</TableHead>
                        <TableHead className="min-w-[200px]">Student Name</TableHead>
                        {getSubjectsWithScores().map((subject) => (
                          <TableHead key={subject} className="text-center min-w-[120px]">
                            {subject}
                            <div className="text-xs text-gray-500 font-normal">
                              ({selectedMarkType === "midterm" ? "40" : "100"})
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="text-center">Overall</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.map((student) => {
                        const subjectsWithScores = getSubjectsWithScores()
                        const totalMarks = subjectsWithScores.reduce(
                          (sum, subject) => sum + (student.subjects[subject]?.total || 0),
                          0,
                        )

                        const averagePercentage =
                          subjectsWithScores.length > 0
                            ? (
                                (totalMarks /
                                  (subjectsWithScores.length * (selectedMarkType === "midterm" ? 40 : 100))) *
                                100
                              ).toFixed(1)
                            : "0"

                        const percentageNum = Number.parseFloat(averagePercentage)

                        return (
                          <TableRow key={student.sn}>
                            <TableCell className="text-center font-medium">{student.sn}</TableCell>
                            <TableCell className="text-center">{student.rollNo}</TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            {subjectsWithScores.map((subject) => {
                              const subjectData = student.subjects[subject]
                              return (
                                <TableCell key={subject} className="text-center">
                                  <div className="space-y-1">
                                    <div className="font-medium">{subjectData.total}</div>
                                    <Badge
                                      variant={
                                        subjectData.grade === "A"
                                          ? "default"
                                          : subjectData.grade === "B"
                                            ? "secondary"
                                            : subjectData.grade === "C"
                                              ? "outline"
                                              : "destructive"
                                      }
                                      className="text-xs"
                                    >
                                      {subjectData.grade}
                                    </Badge>
                                  </div>
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center">
                              <div className="space-y-1">
                                <div className="font-medium">{averagePercentage}%</div>
                                <Badge
                                  variant={
                                    percentageNum >= 80
                                      ? "default"
                                      : percentageNum >= 60
                                        ? "secondary"
                                        : percentageNum >= 40
                                          ? "outline"
                                          : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {percentageNum >= 80
                                    ? "A"
                                    : percentageNum >= 60
                                      ? "B"
                                      : percentageNum >= 40
                                        ? "C"
                                        : "F"}
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Analysis Section */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Subjects with Entered Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getSubjectsWithScores().map((subject) => (
                          <div
                            key={subject}
                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <span className="text-sm font-medium text-green-800">{subject}</span>
                            <Badge variant="default">Complete</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Follow-up Required - Missing Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(getSubjectsWithMissingScores()).map(
                          ([subject, students]: [string, string[]]) => (
                            <div key={subject} className="p-3 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-red-800">{subject}</span>
                                <Badge variant="destructive">{students.length} students</Badge>
                              </div>
                              <p className="text-xs text-red-600">Missing scores for: {students.join(", ")}</p>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Students Needing Attention (Below 50%)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getStudentsNeedingAttention().length === 0 ? (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <span className="text-sm font-medium text-green-800">All students performing well!</span>
                          </div>
                        ) : (
                          getStudentsNeedingAttention().map((student) => (
                            <div key={student.sn} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-orange-800">
                                  {student.name} ({student.rollNo})
                                </span>
                                <Badge variant="outline" className="text-orange-600">
                                  {student.subjectsNeedingAttention?.length || 0} subject
                                  {(student.subjectsNeedingAttention?.length || 0) > 1 ? "s" : ""}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                {student.subjectsNeedingAttention?.map((subjectInfo, index) => (
                                  <p key={index} className="text-xs text-orange-600">
                                    {subjectInfo.subject}: {subjectInfo.score} ({subjectInfo.percentage}%) - Grade{" "}
                                    {subjectInfo.grade}
                                  </p>
                                )) || null}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
