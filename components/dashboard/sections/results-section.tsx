"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BarChart3, Eye, Download, Award, BookOpen, AlertCircle, GraduationCap, School } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface StudentExamResult {
  id: number
  exam_id: number
  student_id: number
  subject_id: number
  ca1: number
  ca2: number
  exam: number
  total: number
  grade: string
  position: number
  term: string
  year: string
  session: string
  subject_name: string
  exam_name: string
  mark_type: string
  class_average: number
  highest_score: number
  lowest_score: number
}

interface ResultSummary {
  totalSubjects: number
  totalScore: number
  percentage: number
  grade: string
  position: number
  totalStudents: number
  classAverage: number
  maxPossibleScore: number
}

interface AvailableExam {
  id: number
  exam_name: string
  mark_type: string
  term: string
  year: string
  session: string
  class: string
}

interface ScoreBreakdown {
  ca1Max: number
  ca2Max: number
  examMax: number
  totalMax: number
}

export function ResultsSection() {
  const { user } = useAuth()
  const [isCheckResultOpen, setIsCheckResultOpen] = useState(false)
  const [examResults, setExamResults] = useState<StudentExamResult[]>([])
  const [loading, setLoading] = useState(false)
  const [availableExams, setAvailableExams] = useState<AvailableExam[]>([])
  const [filteredExams, setFilteredExams] = useState<AvailableExam[]>([])
  const [availableMarkTypes, setAvailableMarkTypes] = useState<string[]>([])
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [resultForm, setResultForm] = useState({
    mark_type: "",
    exam_id: "",
    term: "",
    year: "",
    session: "",
  })
  const [showResults, setShowResults] = useState(false)
  const [resultSummary, setResultSummary] = useState<ResultSummary>({
    totalSubjects: 0,
    totalScore: 0,
    percentage: 0,
    grade: "",
    position: 0,
    totalStudents: 0,
    classAverage: 0,
    maxPossibleScore: 0,
  })

  // Get score breakdown based on exam type
  const getScoreBreakdown = (markType: string): ScoreBreakdown => {
    if (markType?.toLowerCase() === "midterm") {
      return {
        ca1Max: 10,
        ca2Max: 10,
        examMax: 20,
        totalMax: 40,
      }
    } else {
      // Terminal or any other exam type
      return {
        ca1Max: 20,
        ca2Max: 20,
        examMax: 60,
        totalMax: 100,
      }
    }
  }

  useEffect(() => {
    console.log("=== RESULTS SECTION MOUNTED ===")
    console.log("User data:", user)

    if (user?.class && user?.dbId) {
      console.log("User has class and dbId, loading exams...")
      loadAvailableExams()
    } else {
      console.log("Missing user data - Class:", user?.class, "DbId:", user?.dbId)
      setDebugInfo({
        error: "Missing user authentication data",
        userClass: user?.class || "Not set",
        userDbId: user?.dbId || "Not set",
        fullUser: user,
      })
    }
  }, [user])

  useEffect(() => {
    if (resultForm.mark_type) {
      filterExamsByMarkType(resultForm.mark_type)
    } else {
      setFilteredExams([])
      setResultForm((prev) => ({
        ...prev,
        exam_id: "",
        term: "",
        year: "",
        session: "",
      }))
    }
  }, [resultForm.mark_type, availableExams])

  const loadAvailableExams = async () => {
    if (!user?.class || !user?.dbId) {
      console.log("Cannot load exams - missing user class or dbId")
      setDebugInfo({
        error: "Missing user authentication data",
        userClass: user?.class || "Not set",
        userDbId: user?.dbId || "Not set",
      })
      return
    }

    setLoading(true)

    try {
      console.log("=== LOADING EXAMS FOR CLASS:", user.class, "===")
      console.log("Student ID:", user.dbId)

      // Query for exams that are either for this specific class OR system-wide (class is null)
      const { data: classExams, error: classExamsError } = await supabase
        .from("exams")
        .select("*")
        .or(`class.eq.${user.class},class.is.null`)
        .order("id")

      console.log("Raw query result:", { classExams, classExamsError })

      if (classExamsError) {
        console.error("Error loading class exams:", classExamsError)
        setDebugInfo((prev) => ({ ...prev, error: classExamsError.message }))
        return
      }

      const processedExams: AvailableExam[] = []
      const markTypesSet = new Set<string>()

      if (classExams && classExams.length > 0) {
        classExams.forEach((exam) => {
          const processedExam: AvailableExam = {
            id: exam.id,
            exam_name: exam.exam_name || `Exam ${exam.id}`,
            mark_type: exam.mark_type || "unknown",
            term: exam.term || "Unknown Term",
            year: exam.year || "Unknown Year",
            session: exam.session || "Unknown Session",
            class: exam.class || "System-wide",
          }

          processedExams.push(processedExam)

          if (exam.mark_type && exam.mark_type.trim() !== "") {
            markTypesSet.add(exam.mark_type)
          }
        })
      }

      const uniqueMarkTypes = Array.from(markTypesSet)

      setAvailableExams(processedExams)
      setAvailableMarkTypes(uniqueMarkTypes)

      setDebugInfo({
        studentClass: user.class,
        studentId: user.dbId,
        studentEmail: user.email,
        totalExamsFound: processedExams.length,
        markTypesFound: uniqueMarkTypes.length,
        examDetails: processedExams,
        markTypes: uniqueMarkTypes,
        rawData: classExams,
        userObject: user,
      })

      console.log("=== EXAM LOADING COMPLETE ===")
      console.log("Processed exams:", processedExams)
      console.log("Mark types:", uniqueMarkTypes)
    } catch (error) {
      console.error("Error in loadAvailableExams:", error)
      setDebugInfo((prev) => ({ ...prev, error: error.message }))
    } finally {
      setLoading(false)
    }
  }

  const filterExamsByMarkType = (markType: string) => {
    console.log("Filtering exams by mark type:", markType)
    const filtered = availableExams.filter((exam) => exam.mark_type === markType)
    console.log("Filtered results:", filtered)
    setFilteredExams(filtered)

    setResultForm((prev) => ({
      ...prev,
      exam_id: "",
      term: "",
      year: "",
      session: "",
    }))
  }

  const handleExamSelection = (examId: string) => {
    console.log("Selecting exam ID:", examId)
    const selectedExam = filteredExams.find((exam) => exam.id.toString() === examId)

    if (selectedExam) {
      console.log("Selected exam details:", selectedExam)
      setResultForm((prev) => ({
        ...prev,
        exam_id: examId,
        term: selectedExam.term,
        year: selectedExam.year,
        session: selectedExam.session,
      }))
    }
  }

  const handleCheckResult = async () => {
    console.log("=== CHECKING RESULTS ===")
    console.log("Form data:", resultForm)
    console.log("User data:", { dbId: user?.dbId, class: user?.class })

    if (!resultForm.exam_id || !resultForm.term || !resultForm.year || !user?.dbId) {
      const missingFields = []
      if (!resultForm.exam_id) missingFields.push("exam_id")
      if (!resultForm.term) missingFields.push("term")
      if (!resultForm.year) missingFields.push("year")
      if (!user?.dbId) missingFields.push("user.dbId")

      alert(`Please fill in all required fields. Missing: ${missingFields.join(", ")}`)
      console.log("Missing fields:", missingFields)
      return
    }

    setLoading(true)

    try {
      console.log("Fetching results for:", {
        student_id: user.dbId,
        exam_id: Number.parseInt(resultForm.exam_id),
        term: resultForm.term,
        year: resultForm.year,
      })

      const { data: results, error } = await supabase
        .from("student_exams")
        .select(`
          *,
          students!inner(id, first_name, middle_name, surname, class),
          subjects!inner(id, name),
          exams!inner(id, exam_name, mark_type, term, year, session)
        `)
        .eq("student_id", user.dbId)
        .eq("exam_id", Number.parseInt(resultForm.exam_id))
        .eq("term", resultForm.term)
        .eq("year", resultForm.year)

      console.log("Student exam results with joins:", results)
      console.log("Query error:", error)

      if (error) {
        console.error("Error fetching student exam results:", error)
        alert(`Error fetching results: ${error.message}. Please try again.`)
        setLoading(false)
        return
      }

      if (!results || results.length === 0) {
        alert("No results found for the selected exam. Results may not have been published yet.")
        setLoading(false)
        return
      }

      const formattedResults: StudentExamResult[] = []

      for (const result of results) {
        console.log("Processing result:", result)

        const { data: classStats, error: classStatsError } = await supabase
          .from("student_exams")
          .select("total")
          .eq("exam_id", result.exam_id)
          .eq("subject_id", result.subject_id)
          .eq("term", result.term)
          .eq("year", result.year)

        let class_average = 0
        let highest_score = 0
        let lowest_score = 0

        if (!classStatsError && classStats && classStats.length > 0) {
          const totals = classStats.map((s) => s.total || 0).filter((t) => t > 0)
          if (totals.length > 0) {
            class_average = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
            highest_score = Math.max(...totals)
            lowest_score = Math.min(...totals)
          }
        }

        const formattedResult: StudentExamResult = {
          id: result.id,
          exam_id: result.exam_id,
          student_id: result.student_id,
          subject_id: result.subject_id,
          ca1: result.ca1 || 0,
          ca2: result.ca2 || 0,
          exam: result.exam || 0,
          total: result.total || 0,
          grade: result.grade || "F",
          position: result.position || 0,
          term: result.term,
          year: result.year,
          session: result.session,
          subject_name: result.subjects?.name || "Unknown Subject",
          exam_name: result.exams?.exam_name || "Unknown Exam",
          mark_type: result.exams?.mark_type || "Unknown Type",
          class_average,
          highest_score,
          lowest_score,
        }

        console.log("Formatted result:", formattedResult)
        formattedResults.push(formattedResult)
      }

      console.log("All formatted results:", formattedResults)
      setExamResults(formattedResults)

      // Calculate summary based on exam type
      const scoreBreakdown = getScoreBreakdown(formattedResults[0]?.mark_type)
      const totalScore = formattedResults.reduce((sum, result) => sum + result.total, 0)
      const classAverage =
        formattedResults.length > 0
          ? Math.round(
              formattedResults.reduce((sum, result) => sum + result.class_average, 0) / formattedResults.length,
            )
          : 0

      const maxPossibleScore = formattedResults.length * scoreBreakdown.totalMax
      const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0

      let overallGrade = "F"
      if (percentage >= 80) overallGrade = "A"
      else if (percentage >= 70) overallGrade = "B"
      else if (percentage >= 60) overallGrade = "C"
      else if (percentage >= 50) overallGrade = "D"
      else if (percentage >= 40) overallGrade = "E"

      const { data: totalStudentsData } = await supabase
        .from("student_exams")
        .select("student_id")
        .eq("exam_id", Number.parseInt(resultForm.exam_id))
        .eq("term", resultForm.term)
        .eq("year", resultForm.year)

      const totalStudents = new Set(totalStudentsData?.map((s) => s.student_id)).size || 1

      const { data: allStudentTotals } = await supabase
        .from("student_exams")
        .select("student_id, total")
        .eq("exam_id", Number.parseInt(resultForm.exam_id))
        .eq("term", resultForm.term)
        .eq("year", resultForm.year)

      let position = 1
      if (allStudentTotals) {
        const studentTotals = new Map()
        allStudentTotals.forEach((score) => {
          const currentTotal = studentTotals.get(score.student_id) || 0
          studentTotals.set(score.student_id, currentTotal + (score.total || 0))
        })

        const myTotal = totalScore
        const higherTotals = Array.from(studentTotals.values()).filter((total) => total > myTotal)
        position = higherTotals.length + 1
      }

      setResultSummary({
        totalSubjects: formattedResults.length,
        totalScore,
        percentage,
        grade: overallGrade,
        position,
        totalStudents,
        classAverage,
        maxPossibleScore,
      })

      setShowResults(true)
      console.log("=== RESULTS PROCESSING COMPLETE ===")
    } catch (error) {
      console.error("Error checking results:", error)
      alert(`Error checking results: ${error.message}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadResult = () => {
    window.print()
  }

  const resetForm = () => {
    setResultForm({
      mark_type: "",
      exam_id: "",
      term: "",
      year: "",
      session: "",
    })
    setShowResults(false)
    setExamResults([])
    setFilteredExams([])
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "B":
        return "bg-blue-100 text-blue-800"
      case "C":
        return "bg-yellow-100 text-yellow-800"
      case "D":
        return "bg-orange-100 text-orange-800"
      case "E":
        return "bg-red-100 text-red-800"
      case "F":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  // Get score breakdown for current exam type
  const currentScoreBreakdown =
    examResults.length > 0 ? getScoreBreakdown(examResults[0].mark_type) : getScoreBreakdown("terminal")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
          <p className="text-gray-600">View your examination results and academic performance</p>
        </div>
        <Dialog open={isCheckResultOpen} onOpenChange={setIsCheckResultOpen}>
          <DialogTrigger asChild>
            <Button>
              <Eye className="mr-2 h-4 w-4" />
              Check Results
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Check Examination Results</DialogTitle>
              <DialogDescription>
                Select exam type first, then choose a specific exam to view your results.
              </DialogDescription>
            </DialogHeader>

            {!showResults ? (
              <div className="space-y-6">
                {/* Enhanced Debug Info */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    STUDENT AUTHENTICATION STATUS
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p>
                        <strong>Student Class:</strong>
                        <span className={debugInfo.studentClass ? "text-green-600" : "text-red-600"}>
                          {debugInfo.studentClass || "Not loaded"}
                        </span>
                      </p>
                      <p>
                        <strong>Student ID:</strong>
                        <span className={debugInfo.studentId ? "text-green-600" : "text-red-600"}>
                          {debugInfo.studentId || "Not loaded"}
                        </span>
                      </p>
                      <p>
                        <strong>Student Email:</strong>
                        <span className={debugInfo.studentEmail ? "text-green-600" : "text-red-600"}>
                          {debugInfo.studentEmail || "Not loaded"}
                        </span>
                      </p>
                      <p>
                        <strong>Total Exams Found:</strong> {debugInfo.totalExamsFound || 0}
                      </p>
                      <p>
                        <strong>Mark Types Found:</strong> {debugInfo.markTypesFound || 0}
                      </p>
                      <p>
                        <strong>Loading State:</strong> {loading ? "Loading..." : "Complete"}
                      </p>
                      {debugInfo.error && (
                        <p className="text-red-600">
                          <strong>Error:</strong> {debugInfo.error}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>Available Mark Types:</strong>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {debugInfo.markTypes?.map((type, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {type}
                          </span>
                        )) || <span className="text-gray-500">None found</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="font-semibold mb-2">All Available Exams for {debugInfo.studentClass}:</p>
                    <div className="bg-white p-3 rounded border max-h-40 overflow-y-auto">
                      {debugInfo.examDetails?.length > 0 ? (
                        debugInfo.examDetails.map((exam, index) => (
                          <div key={index} className="text-xs border-b pb-1 mb-1">
                            <strong>ID {exam.id}:</strong> {exam.exam_name} |
                            <span className="text-blue-600"> {exam.mark_type}</span> |
                            <span className="text-green-600"> {exam.class}</span> |{exam.term} {exam.year}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-xs">No exams found</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <Button onClick={loadAvailableExams} size="sm" variant="outline" disabled={loading}>
                      {loading ? "Reloading..." : "Reload Exams"}
                    </Button>
                  </div>
                </div>

                {/* Result Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mark_type">Exam Type *</Label>
                    <Select
                      value={resultForm.mark_type}
                      onValueChange={(value) => {
                        console.log("Mark type selected:", value)
                        setResultForm((prev) => ({ ...prev, mark_type: value }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMarkTypes.length > 0 ? (
                          availableMarkTypes.map((markType) => (
                            <SelectItem key={markType} value={markType}>
                              {markType.charAt(0).toUpperCase() + markType.slice(1)} Examination
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-mark-types" disabled>
                            No exam types available for {user?.class}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">{availableMarkTypes.length} exam type(s) available</p>
                  </div>

                  <div>
                    <Label htmlFor="exam_id">Select Exam *</Label>
                    <Select
                      value={resultForm.exam_id}
                      onValueChange={handleExamSelection}
                      disabled={!resultForm.mark_type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={resultForm.mark_type ? "Select an exam" : "Select exam type first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredExams.length > 0 ? (
                          filteredExams.map((exam) => (
                            <SelectItem key={exam.id} value={exam.id.toString()}>
                              {exam.exam_name} ({exam.term} {exam.year})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-filtered-exams" disabled>
                            {resultForm.mark_type
                              ? `No ${resultForm.mark_type} exams available for ${user?.class}`
                              : "Select exam type first"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {filteredExams.length} exam(s) available for selected type
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="session">Academic Session</Label>
                    <Select
                      value={resultForm.session}
                      onValueChange={(value) => setResultForm((prev) => ({ ...prev, session: value }))}
                      disabled={true}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-filled when exam is selected" />
                      </SelectTrigger>
                      <SelectContent>
                        {resultForm.session ? (
                          <SelectItem value={resultForm.session}>{resultForm.session}</SelectItem>
                        ) : (
                          <SelectItem value="no-session" disabled>
                            Select exam first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Auto-filled based on selected exam</p>
                  </div>

                  <div>
                    <Label htmlFor="term">Term</Label>
                    <Select
                      value={resultForm.term}
                      onValueChange={(value) => setResultForm((prev) => ({ ...prev, term: value }))}
                      disabled={true}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-filled when exam is selected" />
                      </SelectTrigger>
                      <SelectContent>
                        {resultForm.term ? (
                          <SelectItem value={resultForm.term}>{resultForm.term}</SelectItem>
                        ) : (
                          <SelectItem value="no-term" disabled>
                            Select exam first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Auto-filled based on selected exam</p>
                  </div>

                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={resultForm.year}
                      onValueChange={(value) => setResultForm((prev) => ({ ...prev, year: value }))}
                      disabled={true}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-filled when exam is selected" />
                      </SelectTrigger>
                      <SelectContent>
                        {resultForm.year ? (
                          <SelectItem value={resultForm.year}>{resultForm.year}</SelectItem>
                        ) : (
                          <SelectItem value="no-year" disabled>
                            Select exam first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Auto-filled based on selected exam</p>
                  </div>
                </div>

                {/* Available Exams Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {resultForm.mark_type
                      ? `Available ${resultForm.mark_type} Exams for ${user?.class}`
                      : `Available Exams for ${user?.class}`}
                  </h4>
                  <div className="space-y-2">
                    {(resultForm.mark_type ? filteredExams : availableExams).length > 0 ? (
                      (resultForm.mark_type ? filteredExams : availableExams).map((exam, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium">{exam.exam_name}</span>
                            <span className="ml-2 text-blue-700">
                              {exam.term} {exam.year} - {exam.mark_type}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">(ID: {exam.id})</span>
                          </div>
                          <Badge variant="outline">{exam.session}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-700 text-sm">
                        {resultForm.mark_type
                          ? `No ${resultForm.mark_type} exams available for ${user?.class}.`
                          : `No exams available for ${user?.class} yet.`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCheckResultOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCheckResult}
                    disabled={loading || !resultForm.exam_id || resultForm.exam_id === "no-filtered-exams"}
                  >
                    {loading ? "Loading Results..." : "View Results"}
                  </Button>
                </div>
              </div>
            ) : (
              /* REPORT CARD DISPLAY */
              <div className="space-y-6 print:space-y-4">
                {/* School Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-lg print:rounded-none print:bg-blue-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-3 rounded-full">
                        <School className="h-12 w-12 text-blue-900" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold">WESTMINSTER SCHOOL</h1>
                        <p className="text-blue-100">Excellence in Education</p>
                        <p className="text-sm text-blue-200">
                          123 Education Avenue, Academic City | Tel: +234-XXX-XXXX | Email: info@westminster.edu.ng
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white text-blue-900 px-4 py-2 rounded-lg">
                        <p className="font-bold text-lg">STUDENT REPORT CARD</p>
                        <p className="text-sm">{examResults[0]?.mark_type?.toUpperCase()} EXAMINATION</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student and Exam Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                  <Card className="border-2 border-blue-200">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <GraduationCap className="h-5 w-5" />
                        Student Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Full Name:</span>
                          <span className="font-bold text-gray-900">
                            {user?.firstName} {user?.middleName} {user?.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Student ID:</span>
                          <span className="font-bold text-gray-900">{user?.dbId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Class:</span>
                          <span className="font-bold text-gray-900">{user?.class}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Date Generated:</span>
                          <span className="font-bold text-gray-900">{getCurrentDate()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200">
                    <CardHeader className="bg-green-50">
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <BookOpen className="h-5 w-5" />
                        Examination Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Examination:</span>
                          <span className="font-bold text-gray-900">{examResults[0]?.exam_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Type:</span>
                          <span className="font-bold text-gray-900 capitalize">{examResults[0]?.mark_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Academic Session:</span>
                          <span className="font-bold text-gray-900">{resultForm.session}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Term:</span>
                          <span className="font-bold text-gray-900">{resultForm.term}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Year:</span>
                          <span className="font-bold text-gray-900">{resultForm.year}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-2">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-green-700">{resultSummary.totalScore}</div>
                      <div className="text-sm text-green-600 font-medium">Total Score</div>
                      <div className="text-xs text-green-500">out of {resultSummary.maxPossibleScore}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-blue-700">{resultSummary.percentage}%</div>
                      <div className="text-sm text-blue-600 font-medium">Percentage</div>
                      <div className="text-xs text-blue-500">Class Avg: {resultSummary.classAverage}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-purple-700">{resultSummary.position}</div>
                      <div className="text-sm text-purple-600 font-medium">Position</div>
                      <div className="text-xs text-purple-500">out of {resultSummary.totalStudents}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-orange-700">{resultSummary.grade}</div>
                      <div className="text-sm text-orange-600 font-medium">Overall Grade</div>
                      <div className="text-xs text-orange-500">Based on {resultSummary.percentage}%</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Results Table */}
                <Card className="border-2 border-gray-200">
                  <CardHeader className="bg-gray-50 border-b-2 border-gray-200">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Award className="h-5 w-5" />
                      Subject-wise Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-b-2 border-gray-300">
                            <th className="text-left p-4 font-bold border-r border-gray-300">Subject</th>
                            <th className="text-center p-4 font-bold border-r border-gray-300">
                              CA1 ({currentScoreBreakdown.ca1Max})
                            </th>
                            <th className="text-center p-4 font-bold border-r border-gray-300">
                              CA2 ({currentScoreBreakdown.ca2Max})
                            </th>
                            <th className="text-center p-4 font-bold border-r border-gray-300">
                              Exam ({currentScoreBreakdown.examMax})
                            </th>
                            <th className="text-center p-4 font-bold border-r border-gray-300">
                              Total ({currentScoreBreakdown.totalMax})
                            </th>
                            <th className="text-center p-4 font-bold border-r border-gray-300">Grade</th>
                            <th className="text-center p-4 font-bold border-r border-gray-300">Position</th>
                            <th className="text-center p-4 font-bold">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {examResults.map((result, index) => (
                            <tr
                              key={result.id}
                              className={`border-b border-gray-200 ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } hover:bg-blue-50 transition-colors`}
                            >
                              <td className="p-4 font-semibold border-r border-gray-200">{result.subject_name}</td>
                              <td className="p-4 text-center font-bold text-blue-600 border-r border-gray-200">
                                {result.ca1}
                              </td>
                              <td className="p-4 text-center font-bold text-blue-600 border-r border-gray-200">
                                {result.ca2}
                              </td>
                              <td className="p-4 text-center font-bold text-green-600 border-r border-gray-200">
                                {result.exam}
                              </td>
                              <td className="p-4 text-center font-bold text-xl text-purple-600 border-r border-gray-200">
                                {result.total}
                              </td>
                              <td className="p-4 text-center border-r border-gray-200">
                                <Badge className={`${getGradeColor(result.grade)} font-bold text-sm px-3 py-1`}>
                                  {result.grade}
                                </Badge>
                              </td>
                              <td className="p-4 text-center font-bold border-r border-gray-200">{result.position}</td>
                              <td className="p-4 text-center text-sm">
                                {result.grade === "A" && "Excellent"}
                                {result.grade === "B" && "Very Good"}
                                {result.grade === "C" && "Good"}
                                {result.grade === "D" && "Fair"}
                                {result.grade === "E" && "Poor"}
                                {result.grade === "F" && "Fail"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-blue-100 border-t-2 border-blue-300">
                            <td className="p-4 font-bold text-blue-800 border-r border-blue-300">TOTAL</td>
                            <td className="p-4 text-center font-bold text-blue-800 border-r border-blue-300">
                              {examResults.reduce((sum, r) => sum + r.ca1, 0)}
                            </td>
                            <td className="p-4 text-center font-bold text-blue-800 border-r border-blue-300">
                              {examResults.reduce((sum, r) => sum + r.ca2, 0)}
                            </td>
                            <td className="p-4 text-center font-bold text-blue-800 border-r border-blue-300">
                              {examResults.reduce((sum, r) => sum + r.exam, 0)}
                            </td>
                            <td className="p-4 text-center font-bold text-2xl text-blue-800 border-r border-blue-300">
                              {resultSummary.totalScore}
                            </td>
                            <td className="p-4 text-center font-bold text-blue-800 border-r border-blue-300">
                              {resultSummary.grade}
                            </td>
                            <td className="p-4 text-center font-bold text-blue-800 border-r border-blue-300">
                              {resultSummary.position}
                            </td>
                            <td className="p-4 text-center font-bold text-blue-800">
                              {resultSummary.percentage >= 80 && "Outstanding"}
                              {resultSummary.percentage >= 70 && resultSummary.percentage < 80 && "Very Good"}
                              {resultSummary.percentage >= 60 && resultSummary.percentage < 70 && "Good"}
                              {resultSummary.percentage >= 50 && resultSummary.percentage < 60 && "Satisfactory"}
                              {resultSummary.percentage < 50 && "Needs Improvement"}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Grading Scale and Comments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                  <Card className="border-2 border-blue-200">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-blue-800">Grading Scale</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>80% - 100%</span>
                          <Badge className="bg-green-100 text-green-800">A - Excellent</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>70% - 79%</span>
                          <Badge className="bg-blue-100 text-blue-800">B - Very Good</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>60% - 69%</span>
                          <Badge className="bg-yellow-100 text-yellow-800">C - Good</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>50% - 59%</span>
                          <Badge className="bg-orange-100 text-orange-800">D - Fair</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>40% - 49%</span>
                          <Badge className="bg-red-100 text-red-800">E - Poor</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>0% - 39%</span>
                          <Badge className="bg-gray-100 text-gray-800">F - Fail</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200">
                    <CardHeader className="bg-green-50">
                      <CardTitle className="text-green-800">Class Teacher's Comment</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <p className="text-sm italic">
                          {resultSummary.percentage >= 80 &&
                            "Excellent performance! Keep up the outstanding work and continue to strive for excellence."}
                          {resultSummary.percentage >= 70 &&
                            resultSummary.percentage < 80 &&
                            "Very good performance. With a little more effort, you can achieve excellence."}
                          {resultSummary.percentage >= 60 &&
                            resultSummary.percentage < 70 &&
                            "Good performance. Focus on areas that need improvement to reach your full potential."}
                          {resultSummary.percentage >= 50 &&
                            resultSummary.percentage < 60 &&
                            "Satisfactory performance. More dedication and hard work are needed for better results."}
                          {resultSummary.percentage < 50 &&
                            "Performance needs significant improvement. Please seek additional help and put in more effort."}
                        </p>
                        <div className="border-t pt-3 mt-4">
                          <p className="text-xs text-gray-600">Class Teacher: ________________</p>
                          <p className="text-xs text-gray-600 mt-2">Signature: ________________</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Footer */}
                <div className="bg-gray-100 p-4 rounded-lg text-center border-t-4 border-blue-600 print:rounded-none">
                  <p className="text-sm text-gray-600">
                    This is an official document generated by Westminster School Portal System
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Generated on {getCurrentDate()} | For inquiries, contact the school administration
                  </p>
                </div>

                <div className="flex justify-end space-x-2 print:hidden">
                  <Button variant="outline" onClick={resetForm}>
                    Check Another Result
                  </Button>
                  <Button onClick={handleDownloadResult}>
                    <Download className="mr-2 h-4 w-4" />
                    Print/Download Result
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latest GPA</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">3.85</div>
            <p className="text-xs text-blue-600">+0.12 from last term</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">5th</div>
            <p className="text-xs text-green-600">Out of 45 students</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Best Subject</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">Mathematics</div>
            <p className="text-xs text-purple-600">92% average</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Examination Results</CardTitle>
          <CardDescription>Your latest examination performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Click "Check Results" to view your examination results</p>
            <p className="text-sm mt-2">
              Select exam type first, then choose a specific exam to see detailed performance analysis
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
