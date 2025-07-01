"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, User, Search, TrendingUp, FileText } from "lucide-react"
import { useStudentAuth } from "@/contexts/student-auth-context"
import { supabase } from "@/lib/supabase"

interface Subject {
  id: number
  name: string
  code: string
  teacher_name: string
  department: string
  description: string
  status: string
}

interface SubjectPerformance {
  subject_id: number
  average_score: number
  total_assignments: number
  completed_assignments: number
  last_grade: string
}

export default function SubjectsSection() {
  const { student } = useStudentAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [performance, setPerformance] = useState<SubjectPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (student) {
      loadSubjects()
    }
  }, [student])

  const loadSubjects = async () => {
    if (!student) return

    try {
      setLoading(true)

      // Load subjects for student's class
      const { data: subjectsData, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("target_class", student.class)
        .eq("status", "Active")
        .order("name")

      if (error) throw error

      setSubjects(subjectsData || [])

      // Load performance data for each subject
      if (subjectsData) {
        const performanceData: SubjectPerformance[] = []

        for (const subject of subjectsData) {
          // Get student's grades for this subject
          const { data: grades } = await supabase
            .from("student_exams")
            .select("total")
            .eq("student_id", student.id)
            .eq("subject", subject.name)
            .not("total", "is", null)

          // Get assignments for this subject
          const { data: assignments } = await supabase
            .from("assignments")
            .select("id, status")
            .eq("subject_name", subject.name)
            .eq("class_name", student.class)

          // Get student's assignment submissions
          const { data: submissions } = await supabase
            .from("assignment_submissions")
            .select("assignment_id")
            .eq("student_id", student.id)

          const averageScore =
            grades && grades.length > 0 ? grades.reduce((sum, grade) => sum + (grade.total || 0), 0) / grades.length : 0

          const lastGrade = grades && grades.length > 0 ? `${grades[grades.length - 1].total}%` : "N/A"

          performanceData.push({
            subject_id: subject.id,
            average_score: averageScore,
            total_assignments: assignments?.length || 0,
            completed_assignments: submissions?.length || 0,
            last_grade: lastGrade,
          })
        }

        setPerformance(performanceData)
      }
    } catch (error) {
      console.error("Error loading subjects:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSubjectPerformance = (subjectId: number) => {
    return performance.find((p) => p.subject_id === subjectId)
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your subjects.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading subjects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600">View your subjects and academic performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">{subjects.length} subjects</span>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search subjects, teachers, or departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => {
          const subjectPerformance = getSubjectPerformance(subject.id)

          return (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <CardDescription className="text-sm">Code: {subject.code}</CardDescription>
                  </div>
                  <Badge variant="default" className="text-xs">
                    {subject.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Teacher Info */}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{subject.teacher_name}</span>
                </div>

                {/* Department */}
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{subject.department}</span>
                </div>

                {/* Performance Stats */}
                {subjectPerformance && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Score:</span>
                      <span className={`text-sm font-medium ${getPerformanceColor(subjectPerformance.average_score)}`}>
                        {subjectPerformance.average_score > 0
                          ? `${Math.round(subjectPerformance.average_score)}%`
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Grade:</span>
                      <span className="text-sm font-medium">{subjectPerformance.last_grade}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assignments:</span>
                      <span className="text-sm">
                        {subjectPerformance.completed_assignments}/{subjectPerformance.total_assignments}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            subjectPerformance.total_assignments > 0
                              ? (subjectPerformance.completed_assignments / subjectPerformance.total_assignments) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="text-sm text-gray-600">{subject.description || "No description available"}</div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Performance
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <FileText className="h-4 w-4 mr-1" />
                    Materials
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No Results */}
      {filteredSubjects.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search criteria" : "No subjects available for your class"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Average</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performance.length > 0
                    ? `${Math.round(performance.reduce((sum, p) => sum + p.average_score, 0) / performance.length)}%`
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performance.reduce((sum, p) => sum + p.total_assignments, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
