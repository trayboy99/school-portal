"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Loader2, AlertCircle, BookOpen, Users, Lock, GraduationCap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TeacherSubject {
  id: number
  name: string
  code: string
  target_class: string
  department: string
  teacher_id: number
  teacher_name: string
}

interface Student {
  id: number
  first_name: string
  surname: string
  reg_number: string
  current_class: string
  section: string
}

interface Exam {
  id: number
  exam_name: string
  class: string
  year: string
  term: string
  mark_type: string
  session: string
  start_date?: string
  end_date?: string
  status?: string
}

export function MarksEntrySection() {
  const { user } = useAuth()
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedExam, setSelectedExam] = useState("")

  // Auto-filled fields from selected exam
  const [examTerm, setExamTerm] = useState("")
  const [examMarkType, setExamMarkType] = useState("")
  const [examSession, setExamSession] = useState("")
  const [examYear, setExamYear] = useState("")

  // Data states
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([])
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [classSubjects, setClassSubjects] = useState<TeacherSubject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [exams, setExams] = useState<Exam[]>([])

  // Loading states
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingExams, setLoadingExams] = useState(true)
  const [submittingMarks, setSubmittingMarks] = useState(false)

  // Error states
  const [error, setError] = useState<string | null>(null)

  // Marks state
  const [marks, setMarks] = useState<{ [studentId: number]: { ca1: string; ca2: string; exam: string } }>({})

  // Fetch teacher's subjects and classes from subjects table
  useEffect(() => {
    const fetchTeacherSubjects = async () => {
      if (!user?.dbId) return

      setLoadingSubjects(true)
      try {
        // Fetch from subjects table where teacher_id matches
        const { data: subjectsData, error } = await supabase
          .from("subjects")
          .select("id, name, code, target_class, department, teacher_id")
          .eq("teacher_id", user.dbId)

        if (error) throw error

        if (!subjectsData || subjectsData.length === 0) {
          setError("No subjects assigned to this teacher. Please contact admin to assign subjects.")
          return
        }

        // Get teacher name for display
        const { data: teacherData } = await supabase
          .from("teachers")
          .select("first_name, surname")
          .eq("id", user.dbId)
          .single()

        const teacherName = teacherData ? `${teacherData.first_name} ${teacherData.surname}` : "Unknown Teacher"

        // Format subjects data
        const formattedSubjects: TeacherSubject[] = subjectsData.map((subject) => ({
          id: subject.id,
          name: subject.name,
          code: subject.code,
          target_class: subject.target_class,
          department: subject.department,
          teacher_id: subject.teacher_id,
          teacher_name: teacherName,
        }))

        setTeacherSubjects(formattedSubjects)

        // Extract unique classes
        const uniqueClasses = [...new Set(subjectsData.map((s) => s.target_class))]
        setAvailableClasses(uniqueClasses)

        setError(null)
      } catch (err) {
        console.error("Error fetching teacher subjects:", err)
        setError(`Failed to load teacher subjects: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setLoadingSubjects(false)
      }
    }

    fetchTeacherSubjects()
  }, [user?.dbId])

  // Update class subjects when class is selected
  useEffect(() => {
    if (selectedClass) {
      const subjectsForClass = teacherSubjects.filter((subject) => subject.target_class === selectedClass)
      setClassSubjects(subjectsForClass)
    } else {
      setClassSubjects([])
    }
  }, [selectedClass, teacherSubjects])

  // Fetch all available exams when component mounts (system-wide exams)
  useEffect(() => {
    const fetchExams = async () => {
      setLoadingExams(true)
      try {
        console.log("Fetching all exams from database...")

        const { data: examsData, error } = await supabase
          .from("exams")
          .select("id, exam_name, year, term, mark_type, session, start_date, end_date, status")
          .order("year", { ascending: false })
          .order("term", { ascending: true })
          .order("exam_name", { ascending: true })

        if (error) {
          console.error("Error fetching exams:", error)
          throw error
        }

        console.log("Fetched exams data:", examsData)

        // Show all exams regardless of status - teachers can enter marks for any exam
        const allExams = examsData || []

        console.log("All available exams (regardless of status):", allExams)

        setExams(allExams)
        setError(null)
      } catch (err) {
        console.error("Error fetching exams:", err)
        setError("Failed to load exams")
      } finally {
        setLoadingExams(false)
      }
    }

    fetchExams()
  }, []) // Remove selectedClass dependency - load exams on component mount

  // Auto-fill exam details when exam is selected
  useEffect(() => {
    if (selectedExam) {
      const examData = exams.find((e) => e.id.toString() === selectedExam)
      if (examData) {
        setExamTerm(examData.term)
        setExamMarkType(examData.mark_type)
        setExamSession(examData.session)
        setExamYear(examData.year)
      }
    } else {
      setExamTerm("")
      setExamMarkType("")
      setExamSession("")
      setExamYear("")
    }
  }, [selectedExam, exams])

  // Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return

      setLoadingStudents(true)
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("current_class", selectedClass)
          .eq("status", "Active")
          .order("surname", { ascending: true })

        if (error) throw error

        setStudents(data || [])
        // Initialize marks state
        const initialMarks: { [studentId: number]: { ca1: string; ca2: string; exam: string } } = {}
        data?.forEach((student) => {
          initialMarks[student.id] = { ca1: "", ca2: "", exam: "" }
        })
        setMarks(initialMarks)
      } catch (err) {
        console.error("Error fetching students:", err)
        setError("Failed to load students")
      } finally {
        setLoadingStudents(false)
      }
    }

    fetchStudents()
  }, [selectedClass])

  // Load existing marks if they exist
  useEffect(() => {
    const loadExistingMarks = async () => {
      if (!selectedExam || !selectedSubject || students.length === 0) return

      try {
        const { data: existingMarks, error } = await supabase
          .from("student_exams")
          .select("student_id, ca1, ca2, exam")
          .eq("exam_id", selectedExam)
          .eq("subject_id", selectedSubject)

        if (error) {
          console.warn("No existing marks found or error loading:", error)
          return
        }

        if (existingMarks && existingMarks.length > 0) {
          const existingMarksMap: { [studentId: number]: { ca1: string; ca2: string; exam: string } } = {}

          existingMarks.forEach((mark) => {
            existingMarksMap[mark.student_id] = {
              ca1: mark.ca1?.toString() || "",
              ca2: mark.ca2?.toString() || "",
              exam: mark.exam?.toString() || "",
            }
          })

          // Merge with existing marks state
          setMarks((prev) => {
            const newMarks = { ...prev }
            Object.keys(existingMarksMap).forEach((studentId) => {
              newMarks[Number.parseInt(studentId)] = existingMarksMap[Number.parseInt(studentId)]
            })
            return newMarks
          })
        }
      } catch (err) {
        console.warn("Error loading existing marks:", err)
      }
    }

    loadExistingMarks()
  }, [selectedExam, selectedSubject, students])

  // Handle mark input change
  const handleMarkChange = (studentId: number, field: "ca1" | "ca2" | "exam", value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }))
  }

  // Calculate total and grade based on mark type
  const calculateTotalAndGrade = (ca1: string, ca2: string, exam: string, markType: string) => {
    const ca1Score = Number.parseFloat(ca1) || 0
    const ca2Score = Number.parseFloat(ca2) || 0
    const examScore = Number.parseFloat(exam) || 0
    const total = ca1Score + ca2Score + examScore

    let grade = "F"

    if (markType === "midterm") {
      // Midterm grading (out of 40)
      if (total >= 32) grade = "A"
      else if (total >= 28) grade = "B"
      else if (total >= 24) grade = "C"
      else if (total >= 20) grade = "D"
      else if (total >= 16) grade = "E"
    } else {
      // Terminal grading (out of 100)
      if (total >= 80) grade = "A"
      else if (total >= 70) grade = "B"
      else if (total >= 60) grade = "C"
      else if (total >= 50) grade = "D"
      else if (total >= 40) grade = "E"
    }

    return { total, grade }
  }

  // Get max scores based on mark type
  const getMaxScores = (markType: string) => {
    if (markType === "midterm") {
      return { ca1Max: 10, ca2Max: 10, examMax: 20, totalMax: 40 }
    } else {
      return { ca1Max: 20, ca2Max: 20, examMax: 60, totalMax: 100 }
    }
  }

  // Submit marks
  const handleSubmitMarks = async () => {
    if (!selectedClass || !selectedSubject || !selectedExam) {
      setError("Please select class, subject, and exam")
      return
    }

    setSubmittingMarks(true)
    try {
      // Prepare marks data
      const marksToSubmit = Object.entries(marks)
        .filter(([_, mark]) => mark.ca1 || mark.ca2 || mark.exam)
        .map(([studentId, mark]) => {
          return {
            exam_id: Number.parseInt(selectedExam),
            student_id: Number.parseInt(studentId),
            subject_id: Number.parseInt(selectedSubject),
            ca1: Number.parseFloat(mark.ca1) || null,
            ca2: Number.parseFloat(mark.ca2) || null,
            exam: Number.parseFloat(mark.exam) || null,
            teacher_id: user?.dbId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        })

      if (marksToSubmit.length === 0) {
        setError("Please enter at least one mark")
        return
      }

      // Insert/update marks in student_exams table
      const { error } = await supabase.from("student_exams").upsert(marksToSubmit, {
        onConflict: "exam_id,student_id,subject_id",
      })

      if (error) throw error

      alert(`Marks submitted successfully for ${marksToSubmit.length} students!`)
      setError(null)
    } catch (err) {
      console.error("Error submitting marks:", err)
      setError("Failed to submit marks")
    } finally {
      setSubmittingMarks(false)
    }
  }

  const maxScores = examMarkType ? getMaxScores(examMarkType) : null
  const selectedExamData = exams.find((e) => e.id.toString() === selectedExam)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marks Entry</h1>
        <p className="text-gray-600">Enter student marks for your assigned classes and subjects</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Teacher Assignment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Your Subject Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Teacher ID</Label>
              <p className="text-sm">{user?.dbId || "Not found"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Assigned Classes</Label>
              <p className="text-sm">{availableClasses.length} classes</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Total Subjects</Label>
              <p className="text-sm">{teacherSubjects.length} subjects</p>
            </div>
          </div>

          {teacherSubjects.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm font-medium">Your Subject Assignments:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {teacherSubjects.map((subject) => (
                  <Badge key={subject.id} variant="outline" className="text-xs">
                    {subject.target_class} - {subject.name} ({subject.code})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class, Subject, and Exam</CardTitle>
          <CardDescription>Choose from your assigned classes and subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* First Row */}
            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass} disabled={loadingSubjects}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingSubjects ? "Loading classes..." : "Select class"} />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableClasses.length === 0 && !loadingSubjects && (
                <p className="text-xs text-red-600">No classes assigned to this teacher</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder={!selectedClass ? "Select class first" : "Select subject"} />
                </SelectTrigger>
                <SelectContent>
                  {classSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClass && classSubjects.length === 0 && (
                <p className="text-xs text-red-600">No subjects assigned for this class</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam">Exam Name *</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam} disabled={loadingExams}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingExams ? "Loading exams..." : "Select exam"} />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id.toString()}>
                      {exam.exam_name} - {exam.term} {exam.year} ({exam.mark_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {exams.length === 0 && !loadingExams && (
                <p className="text-xs text-red-600">No exams found in database. Contact admin to create exams.</p>
              )}
            </div>

            {/* Second Row - Auto-filled fields */}
            <div className="space-y-2">
              <Label htmlFor="term" className="flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Term (Auto-filled)
              </Label>
              <Input
                id="term"
                value={examTerm}
                readOnly
                disabled
                placeholder="Select exam first"
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="markType" className="flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Mark Type (Auto-filled)
              </Label>
              <Input
                id="markType"
                value={examMarkType}
                readOnly
                disabled
                placeholder="Select exam first"
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session" className="flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Session (Auto-filled)
              </Label>
              <Input
                id="session"
                value={examSession}
                readOnly
                disabled
                placeholder="Select exam first"
                className="bg-gray-50"
              />
            </div>
          </div>

          {selectedExamData && maxScores && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Exam Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-blue-700">Exam Name:</span>
                  <p className="font-medium">{selectedExamData.exam_name}</p>
                </div>
                <div>
                  <span className="text-blue-700">Session:</span>
                  <p className="font-medium">{selectedExamData.session}</p>
                </div>
                <div>
                  <span className="text-blue-700">Term:</span>
                  <p className="font-medium">{selectedExamData.term}</p>
                </div>
                <div>
                  <span className="text-blue-700">Mark Type:</span>
                  <p className="font-medium">{selectedExamData.mark_type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-blue-700">CA1 Max:</span>
                  <p className="font-medium">{maxScores.ca1Max}</p>
                </div>
                <div>
                  <span className="text-blue-700">CA2 Max:</span>
                  <p className="font-medium">{maxScores.ca2Max}</p>
                </div>
                <div>
                  <span className="text-blue-700">Exam Max:</span>
                  <p className="font-medium">{maxScores.examMax}</p>
                </div>
                <div>
                  <span className="text-blue-700">Total Max:</span>
                  <p className="font-medium">{maxScores.totalMax}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marks Entry Table */}
      {selectedClass && selectedSubject && selectedExam && maxScores && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Enter Marks
            </CardTitle>
            <CardDescription>
              {selectedExamData?.exam_name} - {selectedClass} -{" "}
              {classSubjects.find((s) => s.id.toString() === selectedSubject)?.name} - {examTerm} Term ({examMarkType})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No students found in this class</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reg Number</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>CA1 ({maxScores.ca1Max})</TableHead>
                      <TableHead>CA2 ({maxScores.ca2Max})</TableHead>
                      <TableHead>Exam ({maxScores.examMax})</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const studentMarks = marks[student.id] || { ca1: "", ca2: "", exam: "" }
                      const { total, grade } = calculateTotalAndGrade(
                        studentMarks.ca1,
                        studentMarks.ca2,
                        studentMarks.exam,
                        examMarkType,
                      )

                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.reg_number}</TableCell>
                          <TableCell>
                            {student.surname}, {student.first_name}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              max={maxScores.ca1Max}
                              step="0.5"
                              className="w-16"
                              value={studentMarks.ca1}
                              onChange={(e) => handleMarkChange(student.id, "ca1", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              max={maxScores.ca2Max}
                              step="0.5"
                              className="w-16"
                              value={studentMarks.ca2}
                              onChange={(e) => handleMarkChange(student.id, "ca2", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              max={maxScores.examMax}
                              step="0.5"
                              className="w-16"
                              value={studentMarks.exam}
                              onChange={(e) => handleMarkChange(student.id, "exam", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{total}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                grade === "A"
                                  ? "bg-green-100 text-green-800"
                                  : grade === "B"
                                    ? "bg-blue-100 text-blue-800"
                                    : grade === "C"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : grade === "D"
                                        ? "bg-orange-100 text-orange-800"
                                        : grade === "E"
                                          ? "bg-purple-100 text-purple-800"
                                          : "bg-red-100 text-red-800"
                              }
                            >
                              {grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-600">
                    {Object.values(marks).filter((mark) => mark.ca1 || mark.ca2 || mark.exam).length} of{" "}
                    {students.length} students have marks entered
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" disabled={submittingMarks}>
                      Save Draft
                    </Button>
                    <Button onClick={handleSubmitMarks} disabled={submittingMarks}>
                      {submittingMarks ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Marks"
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
