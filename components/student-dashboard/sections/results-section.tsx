"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Award, FileText, Download, Eye } from "lucide-react"
import { useStudentAuth } from "@/contexts/student-auth-context"
import { supabase } from "@/lib/supabase"

interface ExamResult {
  id: number
  exam_name: string
  subject: string
  ca1: number | null
  ca2: number | null
  ca3: number | null
  ca4: number | null
  exam: number | null
  total: number | null
  grade: string | null
  position: number | null
  term: string
  session: string
  year: string
  mark_type: string
}

interface ExamInfo {
  id: number
  exam_name: string
  term: string
  session: string
  year: string
  mark_type: string
}

export default function ResultsSection() {
  const { student } = useStudentAuth()
  const [results, setResults] = useState<ExamResult[]>([])
  const [exams, setExams] = useState<ExamInfo[]>([])
  const [selectedExam, setSelectedExam] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (student) {
      loadExams()
    }
  }, [student])

  useEffect(() => {
    if (selectedExam && student) {
      loadResults()
    }
  }, [selectedExam, student])

  const loadExams = async () => {
    if (!student) return

    try {
      setLoading(true)

      const { data: examsData, error } = await supabase
        .from("exams")
        .select("id, exam_name, term, session, year, mark_type")
        .order("created_at", { ascending: false })

      if (error) throw error

      setExams(examsData || [])

      // Auto-select the most recent exam
      if (examsData && examsData.length > 0) {
        setSelectedExam(examsData[0].id.toString())
      }
    } catch (error) {
      console.error("Error loading exams:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadResults = async () => {
    if (!student || !selectedExam) return

    try {
      setLoading(true)

      const { data: resultsData, error } = await supabase
        .from("student_exams")
        .select("*")
        .eq("student_id", student.id)
        .eq("exam_id", selectedExam)
        .order("subject")

      if (error) throw error

      setResults(resultsData || [])
    } catch (error) {
      console.error("Error loading results:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallStats = () => {
    if (results.length === 0) return { average: 0, totalSubjects: 0, passed: 0, failed: 0 }

    const validResults = results.filter((r) => r.total !== null && r.total !== undefined)
    const totalMarks = validResults.reduce((sum, r) => sum + (r.total || 0), 0)
    const average = validResults.length > 0 ? totalMarks / validResults.length : 0
    const passed = validResults.filter((r) => (r.total || 0) >= 50).length
    const failed = validResults.filter((r) => (r.total || 0) < 50).length

    return {
      average: Math.round(average),
      totalSubjects: validResults.length,
      passed,
      failed,
    }
  }

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "text-gray-500"

    switch (grade.toUpperCase()) {
      case "A":
        return "text-green-600"
      case "B":
        return "text-blue-600"
      case "C":
        return "text-yellow-600"
      case "D":
        return "text-orange-600"
      case "F":
        return "text-red-600"
      default:
        return "text-gray-500"
    }
  }

  const getPerformanceIcon = (total: number | null) => {
    if (!total) return null

    if (total >= 80) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (total >= 50) return <Award className="h-4 w-4 text-blue-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const selectedExamInfo = exams.find((e) => e.id.toString() === selectedExam)
  const stats = calculateOverallStats()

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your results.</p>
      </div>
    )
  }

  if (loading && exams.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
          <p className="text-gray-600">View your academic performance and exam results</p>
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">{results.length} subjects</span>
        </div>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
          <CardDescription>Choose an exam to view your results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id.toString()}>
                      {exam.exam_name} - {exam.term} {exam.session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedExamInfo && (
              <div className="flex space-x-2">
                <Badge variant="outline">{selectedExamInfo.mark_type}</Badge>
                <Badge variant="secondary">{selectedExamInfo.term}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedExam && (
        <>
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Overall Average</p>
                    <p className="text-2xl font-bold">{stats.average}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Total Subjects</p>
                    <p className="text-2xl font-bold">{stats.totalSubjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Passed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
              <CardDescription>
                {selectedExamInfo?.exam_name} - {selectedExamInfo?.term} {selectedExamInfo?.session}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading results...</p>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results available</h3>
                  <p className="text-gray-600">Results for this exam have not been published yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">CA1</TableHead>
                      <TableHead className="text-center">CA2</TableHead>
                      <TableHead className="text-center">CA3</TableHead>
                      <TableHead className="text-center">CA4</TableHead>
                      <TableHead className="text-center">Exam</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {getPerformanceIcon(result.total)}
                            <span>{result.subject}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{result.ca1 !== null ? result.ca1 : "-"}</TableCell>
                        <TableCell className="text-center">{result.ca2 !== null ? result.ca2 : "-"}</TableCell>
                        <TableCell className="text-center">{result.ca3 !== null ? result.ca3 : "-"}</TableCell>
                        <TableCell className="text-center">{result.ca4 !== null ? result.ca4 : "-"}</TableCell>
                        <TableCell className="text-center">{result.exam !== null ? result.exam : "-"}</TableCell>
                        <TableCell className="text-center font-bold">
                          {result.total !== null ? result.total : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${getGradeColor(result.grade)}`}>{result.grade || "-"}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {result.position !== null ? <Badge variant="outline">{result.position}</Badge> : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Download or view your result slip</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download Result Slip
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report Card
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
