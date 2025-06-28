"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Plus, FileSpreadsheet, Calendar, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Interfaces
interface Exam {
  id: number
  exam_name: string
  class: string
  year: string
  term: string
  mark_type: string
  session: string
  start_date: string
  end_date: string
  status: string
}

interface Student {
  id: number
  roll_no: string
  first_name: string
  middle_name?: string
  surname: string
  full_name: string
  class: string
}

interface Subject {
  id: number
  name: string
  code: string
  teacher_name?: string
}

interface StudentScore {
  student_id: number
  ca1: number
  ca2: number
  exam: number
  total: number
  grade: string
}

interface StudentScores {
  [studentId: number]: StudentScore
}

// Academic Calendar
const academicCalendarData = {
  currentSession: "2024-2025",
  currentTerm: "second",
  currentTermName: "Second Term",
  academicYearStart: "2024-09-01",
  academicYearEnd: "2025-08-31",
  get currentYear() {
    const [startYear, endYear] = this.currentSession.split("-")
    return this.currentTerm === "first" ? startYear : endYear
  },
}

export default function ExamManagement() {
  // State variables
  const [selectedMarkType, setSelectedMarkType] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedExam, setSelectedExam] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [selectedTerm, setSelectedTerm] = useState<string>("")
  const [showScoresSheet, setShowScoresSheet] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [studentScores, setStudentScores] = useState<StudentScores>({})
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveMessage, setSaveMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Data states
  const [exams, setExams] = useState<Exam[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [academicCalendar] = useState(academicCalendarData)

  // Form data for creating exam
  const [examFormData, setExamFormData] = useState({
    exam_name: "",
    start_date: "",
    end_date: "",
    mark_type: "",
  })

  // Load data on component mount
  useEffect(() => {
    loadExams()
    loadClasses()
    loadSubjects()
  }, [])

  // Load exams from database
  const loadExams = async () => {
    try {
      const { data, error } = await supabase.from("exams").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading exams:", error)
        return
      }

      if (data) {
        const formattedExams = data.map((exam) => ({
          ...exam,
          status:
            new Date(exam.end_date) < new Date()
              ? "Completed"
              : new Date(exam.start_date) <= new Date()
                ? "In Progress"
                : "Scheduled",
        }))
        setExams(formattedExams)
      }
    } catch (error) {
      console.error("Error loading exams:", error)
    }
  }

  // Load classes from database
  const loadClasses = async () => {
    try {
      const { data, error } = await supabase.from("students").select("class").not("class", "is", null)

      if (error) {
        console.error("Error loading classes:", error)
        return
      }

      if (data) {
        const uniqueClasses = Array.from(new Set(data.map((item) => item.class)))
        setClasses(uniqueClasses.sort())
      }
    } catch (error) {
      console.error("Error loading classes:", error)
    }
  }

  // Load subjects from database
  const loadSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, code, teacher_name")
        .eq("status", "Active")

      if (error) {
        console.error("Error loading subjects:", error)
        return
      }

      if (data) {
        setSubjects(data)
      }
    } catch (error) {
      console.error("Error loading subjects:", error)
    }
  }

  // Load students by class
  const loadStudentsByClass = async (className: string) => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, roll_no, first_name, middle_name, surname, class")
        .eq("class", className)
        .eq("status", "Active")
        .order("roll_no", { ascending: true })

      if (error) {
        console.error("Error loading students:", error)
        return
      }

      if (data) {
        const formattedStudents = data.map((student) => ({
          ...student,
          full_name: `${student.first_name} ${student.middle_name || ""} ${student.surname}`.trim(),
        }))
        setStudents(formattedStudents)
      }
    } catch (error) {
      console.error("Error loading students:", error)
    }
  }

  // Get max marks based on mark type
  const getMaxMarks = () => {
    if (selectedMarkType === "midterm") {
      return { ca1: 10, ca2: 10, exam: 20, total: 40 }
    } else if (selectedMarkType === "terminal") {
      return { ca1: 20, ca2: 20, exam: 60, total: 100 }
    }
    return { ca1: 0, ca2: 0, exam: 0, total: 0 }
  }

  // Handle exam creation - FIXED to include class field
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const examData = {
        exam_name: examFormData.exam_name,
        class: "ALL", // Use "ALL" for system-wide exams
        year: academicCalendar.currentYear,
        term: academicCalendar.currentTerm,
        mark_type: examFormData.mark_type,
        session: academicCalendar.currentSession,
        start_date: examFormData.start_date,
        end_date: examFormData.end_date,
      }

      const { data, error } = await supabase.from("exams").insert([examData]).select().single()

      if (error) {
        console.error("Error creating exam:", error)
        alert(`Error creating exam: ${error.message}`)
        return
      }

      alert("System-wide exam created successfully! This exam is now available for all classes.")
      setIsDialogOpen(false)

      // Reset form
      setExamFormData({
        exam_name: "",
        start_date: "",
        end_date: "",
        mark_type: "",
      })

      // Reload exams
      await loadExams()
    } catch (error) {
      console.error("Error creating exam:", error)
      alert("Failed to create exam. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle exam selection for marks entry
  const handleExamSelection = async (examId: string) => {
    const selectedExamData = exams.find((exam) => exam.id.toString() === examId)

    if (selectedExamData) {
      setSelectedExam(examId)
      setSelectedMarkType(selectedExamData.mark_type)
      setSelectedYear(selectedExamData.year)
      setSelectedSession(selectedExamData.session)
      setSelectedTerm(selectedExamData.term)

      // Reset class selection since exam is now system-wide
      setSelectedClass("")
      setStudents([])
      setShowScoresSheet(false)
    }
  }

  // Handle class selection for marks entry
  const handleClassSelection = async (className: string) => {
    setSelectedClass(className)
    await loadStudentsByClass(className)
  }

  // Handle score change
  const handleScoreChange = (studentId: number, field: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    const maxMarks = getMaxMarks()

    // Validate score limits
    let maxForField = 0
    if (field === "ca1") maxForField = maxMarks.ca1
    else if (field === "ca2") maxForField = maxMarks.ca2
    else if (field === "exam") maxForField = maxMarks.exam

    if (numValue > maxForField) {
      alert(`Score cannot exceed ${maxForField} for ${field.toUpperCase()}`)
      return
    }

    setStudentScores((prev) => {
      const currentScores = prev[studentId] || { student_id: studentId, ca1: 0, ca2: 0, exam: 0, total: 0, grade: "F" }

      const updatedScores = {
        ...currentScores,
        [field]: numValue,
      }

      // Calculate total
      const total = updatedScores.ca1 + updatedScores.ca2 + updatedScores.exam
      updatedScores.total = total

      // Calculate grade
      const percentage = (total / maxMarks.total) * 100
      if (percentage >= 80) updatedScores.grade = "A"
      else if (percentage >= 70) updatedScores.grade = "B"
      else if (percentage >= 60) updatedScores.grade = "C"
      else if (percentage >= 50) updatedScores.grade = "D"
      else if (percentage >= 40) updatedScores.grade = "E"
      else updatedScores.grade = "F"

      return {
        ...prev,
        [studentId]: updatedScores,
      }
    })
  }

  // Save all marks to database
  const handleSaveAllMarks = async () => {
    if (!selectedExam || !selectedSubject || !selectedClass) {
      alert("Please select exam, class, and subject")
      return
    }

    setIsSaving(true)
    setSaveMessage("")

    try {
      const marksToSave = Object.values(studentScores).map((score) => ({
        exam_id: Number.parseInt(selectedExam),
        student_id: score.student_id,
        subject_id: Number.parseInt(selectedSubject),
        ca1: score.ca1,
        ca2: score.ca2,
        exam: score.exam,
      }))

      const { error } = await supabase.from("student_exams").upsert(marksToSave, {
        onConflict: "exam_id,student_id,subject_id",
        ignoreDuplicates: false,
      })

      if (error) {
        console.error("Error saving marks:", error)
        setSaveMessage("Error saving marks. Please try again.")
        return
      }

      setSaveMessage("All marks saved successfully!")
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      console.error("Error saving marks:", error)
      setSaveMessage("Error saving marks. Please try again.")
      setTimeout(() => setSaveMessage(""), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  // Generate scores sheet
  const handleGenerateScoresSheet = () => {
    if (selectedExam && selectedSubject && selectedClass) {
      setShowScoresSheet(true)
      // Reset scores when generating new sheet
      setStudentScores({})
    }
  }

  const maxMarks = getMaxMarks()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-600">Manage System-wide Examinations</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create System-wide Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New System-wide Exam</DialogTitle>
                <DialogDescription>
                  Set up a new examination that will be available for all classes in the system.
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="text-sm">
                  <p className="font-medium text-green-800">📚 System-wide Exam</p>
                  <p className="text-green-600">
                    This exam will be created for all classes. Teachers can then enter marks for their specific
                    class-subject combinations.
                  </p>
                </div>
              </div>
              <form onSubmit={handleCreateExam}>
                <div className="grid gap-4 py-4 px-1">
                  <div className="space-y-2">
                    <Label htmlFor="exam-name">Exam Name *</Label>
                    <Input
                      id="exam-name"
                      placeholder={`${academicCalendar.currentTermName} Examination`}
                      className="w-full"
                      required
                      value={examFormData.exam_name}
                      onChange={(e) => setExamFormData((prev) => ({ ...prev, exam_name: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500">
                      💡 <strong>Tip:</strong> Use descriptive names like "First Term Midterm Exam 2024/2025" or "Second
                      Term Terminal Exam 2024/2025"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mark-type">Mark Type *</Label>
                    <Select
                      value={examFormData.mark_type}
                      onValueChange={(value) => setExamFormData((prev) => ({ ...prev, mark_type: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mark type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="midterm">Midterm (CA1:10, CA2:10, Exam:20 = Total:40)</SelectItem>
                        <SelectItem value="terminal">Terminal (CA1:20, CA2:20, Exam:60 = Total:100)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date *</Label>
                      <Input
                        id="start-date"
                        type="date"
                        className="w-full"
                        required
                        value={examFormData.start_date}
                        onChange={(e) => setExamFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date *</Label>
                      <Input
                        id="end-date"
                        type="date"
                        className="w-full"
                        required
                        value={examFormData.end_date}
                        onChange={(e) => setExamFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm font-medium mb-2">Auto-filled from Academic Calendar:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Session: {academicCalendar.currentSession.replace("-", "/")}</li>
                      <li>• Term: {academicCalendar.currentTermName}</li>
                      <li>• Year: {academicCalendar.currentYear}</li>
                      <li>• Class: ALL (System-wide)</li>
                    </ul>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full sm:w-auto bg-transparent"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                    {isLoading ? "Creating System-wide Exam..." : "Create System-wide Exam"}
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
          <TabsTrigger value="broadsheet">Broadsheet</TabsTrigger>
        </TabsList>

        {/* Exam Management Tab */}
        <TabsContent value="exams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System-wide Scheduled Exams</CardTitle>
              <CardDescription>View and manage all system-wide examinations available for all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Mark Type</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scope</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No system-wide exams found. Create your first exam to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.exam_name}</TableCell>
                        <TableCell>
                          <Badge variant={exam.mark_type === "midterm" ? "default" : "secondary"}>
                            {exam.mark_type === "midterm" ? "Midterm" : "Terminal"}
                          </Badge>
                        </TableCell>
                        <TableCell>{exam.session.replace("-", "/")}</TableCell>
                        <TableCell className="capitalize">{exam.term} Term</TableCell>
                        <TableCell>{new Date(exam.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(exam.end_date).toLocaleDateString()}</TableCell>
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
                          <Badge variant="outline" className="text-blue-600">
                            {exam.class === "ALL" ? "All Classes" : exam.class}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
              <CardDescription>Enter marks for specific class-subject combinations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exam-select">System-wide Exam *</Label>
                  <Select value={selectedExam} onValueChange={handleExamSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id.toString()}>
                          {exam.exam_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class-select">Class *</Label>
                  <Select value={selectedClass} onValueChange={handleClassSelection} disabled={!selectedExam}>
                    <SelectTrigger className={!selectedExam ? "bg-gray-100 cursor-not-allowed" : ""}>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedExam && <p className="text-xs text-gray-500">Select an exam first</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject-select">Subject *</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                    <SelectTrigger className={!selectedClass ? "bg-gray-100 cursor-not-allowed" : ""}>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedClass && <p className="text-xs text-gray-500">Select a class first</p>}
                </div>
              </div>

              {/* Auto-filled Details */}
              {selectedExam && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Auto-filled Exam Details:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Mark Type:</span>
                      <p className="text-blue-800">{selectedMarkType || "Not selected"}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Session:</span>
                      <p className="text-blue-800">{selectedSession?.replace("-", "/") || "Not selected"}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Term:</span>
                      <p className="text-blue-800 capitalize">{selectedTerm || "Not selected"}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Year:</span>
                      <p className="text-blue-800">{selectedYear || "Not selected"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Scores Sheet Button */}
              {selectedExam && selectedClass && selectedSubject && (
                <div className="flex justify-center">
                  <Button onClick={handleGenerateScoresSheet} className="w-full sm:w-auto">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Generate Scores Sheet for {selectedClass}
                  </Button>
                </div>
              )}

              {/* Scores Sheet */}
              {showScoresSheet && students.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedMarkType === "midterm" ? "Midterm" : "Terminal"} Scores Sheet - {selectedClass}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Mark Distribution: CA1 ({maxMarks.ca1}), CA2 ({maxMarks.ca2}), Exam ({maxMarks.exam}), Total (
                        {maxMarks.total})
                      </p>
                    </div>
                    <Button onClick={handleSaveAllMarks} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save All Marks"}
                    </Button>
                  </div>

                  {saveMessage && (
                    <div
                      className={`text-sm p-2 rounded ${saveMessage.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                    >
                      {saveMessage}
                    </div>
                  )}

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>CA1 ({maxMarks.ca1})</TableHead>
                        <TableHead>CA2 ({maxMarks.ca2})</TableHead>
                        <TableHead>Exam ({maxMarks.exam})</TableHead>
                        <TableHead>Total ({maxMarks.total})</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const currentScores = studentScores[student.id] || {
                          ca1: 0,
                          ca2: 0,
                          exam: 0,
                          total: 0,
                          grade: "F",
                        }

                        return (
                          <TableRow key={student.id}>
                            <TableCell>{student.roll_no}</TableCell>
                            <TableCell className="font-medium">{student.full_name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max={maxMarks.ca1}
                                value={currentScores.ca1}
                                onChange={(e) => handleScoreChange(student.id, "ca1", e.target.value)}
                                placeholder="0"
                                className="w-20"
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
                                      : "destructive"
                                }
                              >
                                {currentScores.grade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {showScoresSheet && students.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No students found for the selected class.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Broadsheet Tab */}
        <TabsContent value="broadsheet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Broadsheet</CardTitle>
              <CardDescription>View comprehensive score reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Broadsheet functionality will be implemented here.</p>
                <p className="text-sm text-gray-500 mt-2">
                  This will show subjects with entered scores, students with &lt;50% total, and teachers who haven't
                  entered scores.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
