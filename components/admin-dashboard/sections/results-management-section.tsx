"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, FileText, GraduationCap, Calendar, User, Hash, BookOpen } from "lucide-react"

interface Class {
  id: number
  class_name: string
  section: string
  category: string
}

interface Exam {
  id: number
  name: string
  academic_year_id: number
  academic_term_id: number
}

interface Student {
  id: number
  first_name: string
  middle_name?: string
  surname: string
  reg_number: string
  class_id: number
  class_name: string
}

interface Score {
  id: number
  student_id: number
  student_name: string
  reg_number: string
  subject_name: string
  ca1_score: number
  ca2_score: number
  exam_score: number
  total_score: number
  percentage: number
  grade: string
  remarks?: string
}

interface AcademicInfo {
  academic_year_id: number
  academic_term_id: number
  year_name: string
  term_name: string
}

export function ResultsManagementSection() {
  const [classes, setClasses] = useState<Class[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [academicInfo, setAcademicInfo] = useState<AcademicInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedExam, setSelectedExam] = useState("")
  const [selectedScoreType, setSelectedScoreType] = useState("")
  const [studentResults, setStudentResults] = useState<Score[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      console.log("Fetching initial data...")

      const [classesRes, examsRes, academicRes] = await Promise.all([
        fetch("/api/admin/classes"),
        fetch("/api/admin/exams"),
        fetch("/api/admin/current-academic-info"),
      ])

      console.log("Classes response status:", classesRes.status)
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        console.log("Classes data received:", classesData)

        // Handle the classes data based on the actual API response structure
        if (Array.isArray(classesData)) {
          const mappedClasses = classesData.map((cls) => ({
            id: cls.id,
            class_name: cls.class_name,
            section: cls.section,
            category: cls.category,
          }))
          setClasses(mappedClasses)
          console.log("Mapped classes:", mappedClasses)
        }
      } else {
        console.error("Failed to fetch classes:", classesRes.status)
      }

      console.log("Exams response status:", examsRes.status)
      if (examsRes.ok) {
        const examsData = await examsRes.json()
        console.log("Exams data received:", examsData)
        if (Array.isArray(examsData)) {
          setExams(examsData)
        }
      } else {
        console.error("Failed to fetch exams:", examsRes.status)
      }

      console.log("Academic response status:", academicRes.status)
      if (academicRes.ok) {
        const academicData = await academicRes.json()
        console.log("Academic data received:", academicData)
        if (academicData.success && academicData.academic_info) {
          setAcademicInfo(academicData.academic_info)
        }
      } else {
        console.error("Failed to fetch academic info:", academicRes.status)
      }
    } catch (error) {
      console.error("Error fetching initial data:", error)
    }
  }

  const handleQuerySubmit = async () => {
    console.log("Selected class:", selectedClass)
    console.log("Selected exam:", selectedExam)
    console.log("Selected score type:", selectedScoreType)

    if (!selectedClass || !selectedExam || !selectedScoreType) {
      alert("Please select all required fields")
      return
    }

    setLoading(true)
    try {
      // Get students who have scores in the selected score type table
      const tableType = selectedScoreType === "midterm" ? "midterm" : "terminal"
      console.log(`Fetching students from ${tableType}_scores table for class ID:`, selectedClass)

      const response = await fetch(`/api/admin/marks/${tableType}?classId=${selectedClass}&getStudentsList=true`)
      console.log("Students response status:", response.status)

      if (response.ok) {
        const studentsData = await response.json()
        console.log("Students data received:", studentsData)
        console.log("Students data type:", typeof studentsData)
        console.log("Is array?", Array.isArray(studentsData))

        if (Array.isArray(studentsData)) {
          // Extract unique students from the scores data
          const uniqueStudents = studentsData.reduce((acc, score) => {
            const existingStudent = acc.find((s) => s.id === score.student_id)
            if (!existingStudent) {
              acc.push({
                id: score.student_id,
                first_name: score.student_name.split(" ")[0] || "",
                middle_name: score.student_name.split(" ")[1] || "",
                surname: score.student_name.split(" ").slice(2).join(" ") || score.student_name.split(" ")[1] || "",
                reg_number: score.reg_number,
                class_id: score.class_id,
                class_name: score.class_name,
              })
            }
            return acc
          }, [])

          setStudents(uniqueStudents)
          console.log("Set students from scores data:", uniqueStudents)
        } else if (Array.isArray(studentsData.data)) {
          setStudents(studentsData.data)
          console.log("Set students from data property:", studentsData.data)
        } else if (Array.isArray(studentsData.students)) {
          setStudents(studentsData.students)
          console.log("Set students from students property:", studentsData.students)
        } else {
          console.error("Unrecognized students data format:", studentsData)
          console.error("Available keys:", Object.keys(studentsData))
          setStudents([])
        }
      } else {
        console.error("Failed to fetch students:", response.status)
        const errorText = await response.text()
        console.error("Error response:", errorText)
        setStudents([])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewResults = async (student: Student) => {
    if (!academicInfo) return

    setLoading(true)
    setSelectedStudent(student)

    try {
      const tableType = selectedScoreType === "midterm" ? "midterm" : "terminal"
      const response = await fetch(
        `/api/admin/marks/${tableType}?studentId=${student.id}&examId=${selectedExam}&academicYearId=${academicInfo.academic_year_id}&academicTermId=${academicInfo.academic_term_id}`,
      )

      if (response.ok) {
        const resultsData = await response.json()
        setStudentResults(resultsData)
        setShowResultDialog(true)
      }
    } catch (error) {
      console.error("Error fetching student results:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalMarks = () => {
    return studentResults.reduce((sum, score) => sum + score.total_score, 0)
  }

  const calculateAveragePercentage = () => {
    if (studentResults.length === 0) return 0
    const totalPercentage = studentResults.reduce((sum, score) => sum + score.percentage, 0)
    return Math.round(totalPercentage / studentResults.length)
  }

  const getOverallGrade = (percentage: number) => {
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    if (percentage >= 50) return "E"
    return "F"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Results Management</h2>
        <p className="text-muted-foreground">Query and view student examination results</p>
      </div>

      {/* Query Form */}
      <Card>
        <CardHeader>
          <CardTitle>Query Student Results</CardTitle>
          <CardDescription>Select criteria to fetch student results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select
                value={selectedClass}
                onValueChange={(value) => {
                  console.log("Class selected:", value)
                  setSelectedClass(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.class_name} {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {classes.length === 0 && <p className="text-xs text-muted-foreground">No classes found</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam">Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id.toString()}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scoreType">Score Type</Label>
              <Select value={selectedScoreType} onValueChange={setSelectedScoreType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select score type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midterm">Midterm</SelectItem>
                  <SelectItem value="terminal">Terminal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={handleQuerySubmit} disabled={loading} className="w-full">
                {loading ? "Loading..." : "Query Results"}
              </Button>
            </div>
          </div>

          {academicInfo && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Academic Year: {academicInfo.year_name}</span>
              <span>•</span>
              <span>Term: {academicInfo.term_name}</span>
            </div>
          )}

          {loading && <p className="text-sm text-muted-foreground">Loading students...</p>}
          {!loading && students.length === 0 && selectedClass && selectedExam && selectedScoreType && (
            <p className="text-sm text-muted-foreground">No students found for the selected class.</p>
          )}
        </CardContent>
      </Card>

      {/* Students Table */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Students in Selected Class</CardTitle>
            <CardDescription>Click "View Results" to see individual student results</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reg Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.reg_number}</TableCell>
                    <TableCell>
                      {`${student.first_name} ${student.middle_name || ""} ${student.surname}`.trim()}
                    </TableCell>
                    <TableCell>{student.class_name}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleViewResults(student)} disabled={loading}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Results Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Student Result Sheet
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && academicInfo && (
            <div className="space-y-6">
              {/* School Header */}
              <div className="text-center space-y-2 border-b pb-4">
                <h1 className="text-2xl font-bold text-blue-900">WESTMINSTER COLLEGE</h1>
                <p className="text-sm text-muted-foreground">Excellence in Education</p>
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedScoreType === "midterm" ? "MIDTERM" : "TERMINAL"} EXAMINATION RESULT
                </h2>
              </div>

              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Student Name:</span>
                    <span>
                      {`${selectedStudent.first_name} ${selectedStudent.middle_name || ""} ${selectedStudent.surname}`.trim()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Registration Number:</span>
                    <span>{selectedStudent.reg_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Class:</span>
                    <span>{selectedStudent.class_name}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Academic Year:</span>
                    <span>{academicInfo.year_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Term:</span>
                    <span>{academicInfo.term_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Exam:</span>
                    <span>{exams.find((e) => e.id.toString() === selectedExam)?.name || "N/A"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Results Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Subject Results
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">CA1</TableHead>
                      <TableHead className="text-center">CA2</TableHead>
                      <TableHead className="text-center">Exam</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">%</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentResults.map((score) => (
                      <TableRow key={score.id}>
                        <TableCell className="font-medium">{score.subject_name}</TableCell>
                        <TableCell className="text-center">{score.ca1_score}</TableCell>
                        <TableCell className="text-center">{score.ca2_score}</TableCell>
                        <TableCell className="text-center">{score.exam_score}</TableCell>
                        <TableCell className="text-center font-medium">{score.total_score}</TableCell>
                        <TableCell className="text-center">{score.percentage}%</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              score.grade === "A" || score.grade === "B"
                                ? "default"
                                : score.grade === "C" || score.grade === "D"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {score.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{score.remarks || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{calculateTotalMarks()}</div>
                      <p className="text-sm text-muted-foreground">Total Marks</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{calculateAveragePercentage()}%</div>
                      <p className="text-sm text-muted-foreground">Average Percentage</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        <Badge
                          variant={
                            getOverallGrade(calculateAveragePercentage()) === "A" ||
                            getOverallGrade(calculateAveragePercentage()) === "B"
                              ? "default"
                              : getOverallGrade(calculateAveragePercentage()) === "C" ||
                                  getOverallGrade(calculateAveragePercentage()) === "D"
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-lg px-3 py-1"
                        >
                          {getOverallGrade(calculateAveragePercentage())}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Overall Grade</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                <p>Generated on {new Date().toLocaleDateString()}</p>
                <p>Westminster College - Academic Excellence</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
