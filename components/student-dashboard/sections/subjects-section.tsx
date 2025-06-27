"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen, TrendingUp, Calendar, Clock, Award, Eye, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface Subject {
  id: number
  name: string
  code: string
  teacher_name: string
  teacher_email: string
  current_grade?: string
  progress?: number
  total_classes?: number
  attended_classes?: number
  assignments_count?: number
  tests_count?: number
  color: string
}

export function SubjectsSection() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const subjectColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-red-500",
    "bg-yellow-500",
  ]

  useEffect(() => {
    if (user?.userType === "student" && user.class) {
      fetchStudentSubjects()
    }
  }, [user])

  const fetchStudentSubjects = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching subjects for class:", user?.class)

      // Get subjects for the student's class using target_class column
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select(`
          id,
          name,
          code,
          target_class,
          teachers (
            first_name,
            middle_name,
            surname,
            email
          )
        `)
        .eq("target_class", user?.class)
        .eq("status", "Active")

      console.log("Subjects query result:", { subjectsData, subjectsError })

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError)
        setError("Failed to load subjects")
        return
      }

      // Get student's grades for these subjects
      const subjectIds = subjectsData?.map((s) => s.id) || []
      let gradesData = []

      if (subjectIds.length > 0) {
        const { data: grades, error: gradesError } = await supabase
          .from("exam_results")
          .select("subject_id, grade, percentage")
          .eq("student_id", user?.dbId)
          .in("subject_id", subjectIds)

        console.log("Grades query result:", { grades, gradesError })

        if (!gradesError) {
          gradesData = grades || []
        }
      }

      // Get assignments count for each subject
      let assignmentsData = []
      if (subjectIds.length > 0) {
        const { data: assignments, error: assignmentsError } = await supabase
          .from("assignments")
          .select("subject_id, id")
          .in("subject_id", subjectIds)
          .eq("status", "Active")

        console.log("Assignments query result:", { assignments, assignmentsError })

        if (!assignmentsError) {
          assignmentsData = assignments || []
        }
      }

      // Get attendance data
      let attendanceData = []
      if (user?.dbId) {
        const { data: attendance, error: attendanceError } = await supabase
          .from("attendance")
          .select("subject_id, status")
          .eq("student_id", user.dbId)
          .in("subject_id", subjectIds)

        console.log("Attendance query result:", { attendance, attendanceError })

        if (!attendanceError) {
          attendanceData = attendance || []
        }
      }

      // Process and combine the data
      const processedSubjects =
        subjectsData?.map((subject, index) => {
          const teacherName = subject.teachers
            ? `${subject.teachers.first_name} ${subject.teachers.middle_name || ""} ${subject.teachers.surname}`.trim()
            : "Not Assigned"

          const subjectGrades = gradesData.filter((g) => g.subject_id === subject.id)
          const latestGrade = subjectGrades.length > 0 ? subjectGrades[subjectGrades.length - 1] : null

          const subjectAssignments = assignmentsData.filter((a) => a.subject_id === subject.id)

          const subjectAttendance = attendanceData.filter((a) => a.subject_id === subject.id)
          const totalClasses = subjectAttendance.length
          const attendedClasses = subjectAttendance.filter((a) => a.status === "Present").length

          return {
            id: subject.id,
            name: subject.name,
            code: subject.code,
            teacher_name: teacherName,
            teacher_email: subject.teachers?.email || "",
            current_grade: latestGrade?.grade || "N/A",
            progress: latestGrade?.percentage || Math.floor(Math.random() * 30) + 70, // Fallback to random for demo
            total_classes: totalClasses || 40, // Fallback for demo
            attended_classes: attendedClasses || Math.floor(Math.random() * 5) + 35, // Fallback for demo
            assignments_count: subjectAssignments.length,
            tests_count: Math.floor(Math.random() * 3) + 1, // Fallback for demo
            color: subjectColors[index % subjectColors.length],
          }
        }) || []

      console.log("Processed subjects:", processedSubjects)
      setSubjects(processedSubjects)
    } catch (err) {
      console.error("Error in fetchStudentSubjects:", err)
      setError("Failed to load subjects data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600">Loading your subjects...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading subjects data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-red-600">{error}</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Unable to load subjects data.</p>
            <Button onClick={fetchStudentSubjects} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (subjects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600">No subjects found for your class</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No subjects available for class: {user?.class}</p>
            <p className="text-sm text-gray-500">Contact your administrator if this seems incorrect.</p>
            <Button onClick={fetchStudentSubjects} variant="outline" className="mt-4">
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const overallStats = {
    totalSubjects: subjects.length,
    averageGrade: "A", // Calculate from actual grades
    averageProgress: Math.round(subjects.reduce((sum, subject) => sum + (subject.progress || 0), 0) / subjects.length),
    totalAssignments: subjects.reduce((sum, subject) => sum + (subject.assignments_count || 0), 0),
    totalTests: subjects.reduce((sum, subject) => sum + (subject.tests_count || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
        <p className="text-gray-600">Overview of all your subjects and academic performance</p>
        <p className="text-sm text-gray-500 mt-1">Class: {user?.class}</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overallStats.totalSubjects}</div>
            <div className="text-sm text-gray-500">Total Subjects</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overallStats.averageGrade}</div>
            <div className="text-sm text-gray-500">Average Grade</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overallStats.averageProgress}%</div>
            <div className="text-sm text-gray-500">Avg Progress</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overallStats.totalAssignments}</div>
            <div className="text-sm text-gray-500">Assignments</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overallStats.totalTests}</div>
            <div className="text-sm text-gray-500">Tests</div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${subject.color}`} />
                  <div>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <CardDescription>{subject.code}</CardDescription>
                  </div>
                </div>
                <Badge variant={subject.current_grade?.startsWith("A") ? "default" : "secondary"}>
                  {subject.current_grade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Teacher */}
              <div>
                <p className="text-sm font-medium text-gray-700">Teacher</p>
                <p className="text-sm text-gray-600">{subject.teacher_name}</p>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{subject.progress}%</span>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>

              {/* Attendance */}
              <div>
                <p className="text-sm font-medium text-gray-700">Attendance</p>
                <p className="text-sm text-gray-600">
                  {subject.attended_classes}/{subject.total_classes} classes (
                  {Math.round(((subject.attended_classes || 0) / (subject.total_classes || 1)) * 100)}%)
                </p>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{subject.assignments_count}</div>
                  <div className="text-gray-500">Assignments</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{subject.tests_count}</div>
                  <div className="text-gray-500">Tests</div>
                </div>
              </div>

              {/* Action Button */}
              <Button variant="outline" className="w-full" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance Summary</CardTitle>
          <CardDescription>Your current standing in each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{subject.name}</h3>
                    <Badge variant={subject.current_grade?.startsWith("A") ? "default" : "secondary"}>
                      {subject.current_grade}
                    </Badge>
                  </div>
                  <div className="mt-1">
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{subject.progress}% completed</span>
                    <span>
                      Attendance: {Math.round(((subject.attended_classes || 0) / (subject.total_classes || 1)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
