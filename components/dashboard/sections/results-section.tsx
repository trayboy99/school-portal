"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  User,
  GraduationCap,
  Calendar,
  BookOpen,
  Trophy,
  TrendingUp,
  Users,
  Award,
  FileText,
  Printer,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Student {
  id: number
  first_name: string
  middle_name: string | null
  surname: string
  roll_number: string
  class: string
  date_of_birth: string
  gender: string
  address: string
  phone_number: string
  email: string | null
  parent_name: string
  parent_phone: string
  parent_email: string | null
  admission_date: string
  status: string
}

interface Exam {
  id: number
  exam_name: string
  exam_type: string
  class: string
  term: string
  session: string
  year: number
  date_created: string
}

interface ExamResult {
  id: number
  student_id: number
  exam_id: number
  subject_name: string
  ca1_score: number
  ca2_score: number
  exam_score: number
  total_score: number
  grade: string
  remarks: string
  position: number | null
  class_average: number | null
  highest_score: number | null
  lowest_score: number | null
}

interface ResultForm {
  class: string
  student_id: string
  mark_type: string
  exam_id: string
  term: string
  year: string
  session: string
}

export function ResultsSection() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [results, setResults] = useState<ExamResult[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [isCheckResultOpen, setIsCheckResultOpen] = useState(false)
  const [isResultsOpen, setIsResultsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultForm, setResultForm] = useState<ResultForm>({
    class: "",
    student_id: "",
    mark_type: "",
    exam_id: "",
    term: "",
    year: "",
    session: "",
  })

  // Fetch students
  useEffect(() => {
    fetchStudents()
    fetchClasses()
    fetchExams()
  }, [])

  // Filter students based on search and class
  useEffect(() => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          `${student.first_name} ${student.middle_name || ""} ${student.surname}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) || student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedClass) {
      filtered = filtered.filter((student) => student.class === selectedClass)
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, selectedClass])

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("status", "active")
        .order("class", { ascending: true })
        .order("surname", { ascending: true })

      if (error) throw error
      setStudents(data || [])
      setFilteredStudents(data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("class_name")
        .order("class_name", { ascending: true })

      if (error) throw error
      setClasses(data?.map((c) => c.class_name) || [])
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .order("year", { ascending: false })
        .order("exam_name", { ascending: true })

      if (error) throw error
      setExams(data || [])
    } catch (error) {
      console.error("Error fetching exams:", error)
    }
  }

  const handleStudentSelectionFromList = (student: Student) => {
    setSelectedStudent(student)
    setResultForm({
      class: student.class,
      student_id: student.id.toString(),
      mark_type: "",
      exam_id: "",
      term: "",
      year: "",
      session: "",
    })
    setIsCheckResultOpen(true)
  }

  const handleExamTypeChange = (examType: string) => {
    setResultForm((prev) => ({
      ...prev,
      mark_type: examType,
      exam_id: "",
      term: "",
      year: "",
      session: "",
    }))
    setSelectedExam(null)
  }

  const handleExamChange = (examId: string) => {
    const exam = exams.find((e) => e.id.toString() === examId)
    if (exam) {
      setSelectedExam(exam)
      setResultForm((prev) => ({
        ...prev,
        exam_id: examId,
        term: exam.term,
        year: exam.year.toString(),
        session: exam.session,
      }))
    }
  }

  const fetchResults = async () => {
    if (!resultForm.student_id || !resultForm.exam_id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("exam_results")
        .select(`
          *,
          students!inner(first_name, middle_name, surname, roll_number, class),
          exams!inner(exam_name, exam_type, term, session, year)
        `)
        .eq("student_id", Number.parseInt(resultForm.student_id))
        .eq("exam_id", Number.parseInt(resultForm.exam_id))

      if (error) throw error
      setResults(data || [])
      setIsResultsOpen(true)
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredExams = () => {
    if (!resultForm.class || !resultForm.mark_type) return []

    return exams.filter(
      (exam) => exam.class === resultForm.class && exam.exam_type.toLowerCase() === resultForm.mark_type.toLowerCase(),
    )
  }

  const calculatePercentage = (total: number, examType: string) => {
    const maxScore = examType.toLowerCase() === "midterm" ? 40 : 100
    return ((total / maxScore) * 100).toFixed(1)
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800 border-green-200"
      case "B":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "C":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "D":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "F":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const calculateOverallStats = () => {
    if (results.length === 0) return { totalScore: 0, percentage: 0, averageGrade: "N/A", position: "N/A" }

    const totalScore = results.reduce((sum, result) => sum + result.total_score, 0)
    const maxPossible = results.length * (selectedExam?.exam_type.toLowerCase() === "midterm" ? 40 : 100)
    const percentage = ((totalScore / maxPossible) * 100).toFixed(1)

    // Calculate average grade
    const gradePoints = { A: 5, B: 4, C: 3, D: 2, F: 1 }
    const totalGradePoints = results.reduce(
      (sum, result) => sum + (gradePoints[result.grade as keyof typeof gradePoints] || 0),
      0,
    )
    const averageGradePoint = totalGradePoints / results.length
    const averageGrade =
      Object.keys(gradePoints).find(
        (grade) => gradePoints[grade as keyof typeof gradePoints] === Math.round(averageGradePoint),
      ) || "C"

    const position = results[0]?.position || "N/A"

    return { totalScore, percentage, averageGrade, position }
  }

  const stats = calculateOverallStats()

  const printResults = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Results Management</h2>
          <p className="text-gray-600">View and manage student examination results</p>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-600">Academic Performance</span>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Students</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by Name or Roll Number</Label>
              <Input
                id="search"
                placeholder="Enter student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-48">
              <Label htmlFor="class-filter">Filter by Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Students ({filteredStudents.length})</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {student.first_name} {student.middle_name} {student.surname}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Roll: {student.roll_number}</span>
                      <span>Class: {student.class}</span>
                      <span>Gender: {student.gender}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleStudentSelectionFromList(student)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Check Results
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Check Results Dialog */}
      <Dialog open={isCheckResultOpen} onOpenChange={setIsCheckResultOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Check Student Results</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Auto-filled Student Information */}
            {selectedStudent && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Selected Student (Auto-filled)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-green-700">Full Name</Label>
                      <p className="font-medium text-green-900">
                        {selectedStudent.first_name} {selectedStudent.middle_name} {selectedStudent.surname}
                      </p>
                    </div>
                    <div>
                      <Label className="text-green-700">Roll Number</Label>
                      <p className="font-medium text-green-900">{selectedStudent.roll_number}</p>
                    </div>
                    <div>
                      <Label className="text-green-700">Class</Label>
                      <p className="font-medium text-green-900">{selectedStudent.class}</p>
                    </div>
                    <div>
                      <Label className="text-green-700">Student ID</Label>
                      <p className="font-medium text-green-900">{selectedStudent.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exam-type">Exam Type *</Label>
                <Select value={resultForm.mark_type} onValueChange={handleExamTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="terminal">Terminal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="exam">Select Exam *</Label>
                <Select value={resultForm.exam_id} onValueChange={handleExamChange} disabled={!resultForm.mark_type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredExams().map((exam) => (
                      <SelectItem key={exam.id} value={exam.id.toString()}>
                        {exam.exam_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Auto-filled Academic Details */}
            {selectedExam && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Academic Details (Auto-filled)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-blue-700">Term</Label>
                      <p className="font-medium text-blue-900">{selectedExam.term}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700">Session</Label>
                      <p className="font-medium text-blue-900">{selectedExam.session}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700">Year</Label>
                      <p className="font-medium text-blue-900">{selectedExam.year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCheckResultOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={fetchResults}
                disabled={!resultForm.exam_id || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Loading..." : "View Results"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Display Dialog */}
      <Dialog open={isResultsOpen} onOpenChange={setIsResultsOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Student Results</span>
              </div>
              <Button onClick={printResults} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogTitle>
          </DialogHeader>

          {results.length > 0 && selectedStudent && selectedExam && (
            <div className="space-y-6 print:space-y-4">
              {/* School Header */}
              <div className="text-center border-b pb-6 print:pb-4">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-blue-900 print:text-2xl">Westminster School</h1>
                    <p className="text-blue-600">Excellence in Education</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>123 Education Street, Academic City | Phone: +234-123-456-7890 | Email: info@westminster.edu.ng</p>
                </div>
              </div>

              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Student Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full Name:</span>
                      <span className="font-medium">
                        {selectedStudent.first_name} {selectedStudent.middle_name} {selectedStudent.surname}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student ID:</span>
                      <span className="font-medium">{selectedStudent.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Roll Number:</span>
                      <span className="font-medium">{selectedStudent.roll_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Class:</span>
                      <span className="font-medium">{selectedStudent.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{selectedStudent.gender}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Examination Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exam Name:</span>
                      <span className="font-medium">{selectedExam.exam_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exam Type:</span>
                      <span className="font-medium capitalize">{selectedExam.exam_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Term:</span>
                      <span className="font-medium">{selectedExam.term}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session:</span>
                      <span className="font-medium">{selectedExam.session}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium">{selectedExam.year}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-2">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 print:text-xl">{stats.totalScore}</div>
                    <div className="text-sm text-blue-800">Total Score</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 print:text-xl">{stats.percentage}%</div>
                    <div className="text-sm text-green-800">Percentage</div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 print:text-xl">{stats.averageGrade}</div>
                    <div className="text-sm text-purple-800">Average Grade</div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600 print:text-xl">{stats.position}</div>
                    <div className="text-sm text-yellow-800">Position</div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Detailed Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Subject</th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                            CA1 ({selectedExam.exam_type.toLowerCase() === "midterm" ? "10" : "20"})
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                            CA2 ({selectedExam.exam_type.toLowerCase() === "midterm" ? "10" : "20"})
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                            Exam ({selectedExam.exam_type.toLowerCase() === "midterm" ? "20" : "60"})
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                            Total ({selectedExam.exam_type.toLowerCase() === "midterm" ? "40" : "100"})
                          </th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold">%</th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Grade</th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result, index) => (
                          <tr key={result.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border border-gray-300 px-4 py-3 font-medium">{result.subject_name}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-blue-600 font-medium">
                              {result.ca1_score}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-blue-600 font-medium">
                              {result.ca2_score}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-green-600 font-medium">
                              {result.exam_score}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-purple-600 font-bold">
                              {result.total_score}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                              {calculatePercentage(result.total_score, selectedExam.exam_type)}%
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center">
                              <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-sm">{result.remarks}</td>
                          </tr>
                        ))}
                        <tr className="bg-blue-50 font-bold">
                          <td className="border border-gray-300 px-4 py-3">TOTAL</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {results.reduce((sum, r) => sum + r.ca1_score, 0)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {results.reduce((sum, r) => sum + r.ca2_score, 0)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {results.reduce((sum, r) => sum + r.exam_score, 0)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center text-purple-600">
                            {stats.totalScore}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">{stats.percentage}%</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <Badge className={getGradeColor(stats.averageGrade)}>{stats.averageGrade}</Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Grading Scale */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grading Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4 text-center">
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="font-bold text-green-800">A</div>
                      <div className="text-sm text-green-600">70-100</div>
                      <div className="text-xs text-green-500">Excellent</div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="font-bold text-blue-800">B</div>
                      <div className="text-sm text-blue-600">60-69</div>
                      <div className="text-xs text-blue-500">Very Good</div>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="font-bold text-yellow-800">C</div>
                      <div className="text-sm text-yellow-600">50-59</div>
                      <div className="text-xs text-yellow-500">Good</div>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                      <div className="font-bold text-orange-800">D</div>
                      <div className="text-sm text-orange-600">40-49</div>
                      <div className="text-xs text-orange-500">Pass</div>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="font-bold text-red-800">F</div>
                      <div className="text-sm text-red-600">0-39</div>
                      <div className="text-xs text-red-500">Fail</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Class Teacher's Comment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Class Teacher's Comment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {Number.parseFloat(stats.percentage) >= 70
                      ? "Excellent performance! Keep up the outstanding work."
                      : Number.parseFloat(stats.percentage) >= 60
                        ? "Very good performance. Continue to strive for excellence."
                        : Number.parseFloat(stats.percentage) >= 50
                          ? "Good performance. There's room for improvement in some areas."
                          : Number.parseFloat(stats.percentage) >= 40
                            ? "Fair performance. More effort is needed to improve academic standing."
                            : "Poor performance. Immediate attention and extra support required."}
                  </p>
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="text-center text-sm text-gray-600 border-t pt-4 print:pt-2">
                <p>Westminster School - Official Academic Report</p>
                <p>
                  Generated on {new Date().toLocaleDateString("en-GB")} at {new Date().toLocaleTimeString("en-GB")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
