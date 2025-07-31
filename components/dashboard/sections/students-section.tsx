"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, ArrowLeft, BookOpen, Calendar, Trophy, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { StudentManagementSection } from "@/components/admin-dashboard/sections/student-management-section"

interface Student {
  id: string
  username: string
  first_name: string
  middle_name: string
  surname: string
  email: string
  current_class: string
  section: string
  roll_no: string
  reg_number: string
  status: string
}

interface Exam {
  id: string
  subject_id: string
  ca: number
  ca2: number
  exam: number
  total: number
  grade: string
  session: string
  term: string
  year: string
}

export function StudentDashboard({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<Student | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Fetch student info from users table
        const { data: studentData, error: studentError } = await supabase
          .from("users")
          .select("*")
          .eq("id", studentId)
          .single()

        if (studentError) {
          console.error("Error fetching student:", studentError)
        } else {
          setStudent(studentData)
        }

        // Fetch exam results from student_exams table
        const { data: examData, error: examError } = await supabase
          .from("student_exams")
          .select("*")
          .eq("student_id", studentId)

        if (examError) {
          console.error("Error fetching exams:", examError)
        } else {
          setExams(examData || [])
        }

        // Fetch attendance data
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", studentId)

        if (attendanceError) {
          console.error("Error fetching attendance:", attendanceError)
        } else {
          setAttendance(attendanceData || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [studentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p>Loading student dashboard...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Student not found</h2>
          <Button asChild>
            <a href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </a>
          </Button>
        </div>
      </div>
    )
  }

  const fullName = `${student.first_name || ""} ${student.middle_name || ""} ${student.surname || ""}`.trim()
  const averageTotal = exams.length > 0 ? exams.reduce((sum, exam) => sum + exam.total, 0) / exams.length : 0
  const attendancePercentage =
    attendance.length > 0 ? (attendance.filter((a) => a.status === "present").length / attendance.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </a>
              </Button>
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold">{fullName || student.username}</h1>
                  <p className="text-sm text-gray-600">
                    Class {student.current_class}-{student.section} • Roll No: {student.roll_no} • Reg:{" "}
                    {student.reg_number}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exams">Exam Results</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{exams.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageTotal.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">out of 100</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{attendancePercentage.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">{attendance.length} days recorded</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{student.status}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Exam Results</CardTitle>
                <CardDescription>Your latest exam performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exams.slice(0, 5).map((exam, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Subject {exam.subject_id}</p>
                        <p className="text-sm text-gray-600">
                          CA: {exam.ca} + CA2: {exam.ca2} + Exam: {exam.exam} = Total: {exam.total}
                        </p>
                        <p className="text-xs text-gray-500">
                          {exam.session} - {exam.term} Term {exam.year}
                        </p>
                      </div>
                      <Badge variant={exam.grade.startsWith("A") ? "default" : "secondary"}>{exam.grade}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Results</CardTitle>
                <CardDescription>Detailed breakdown of all your exam results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exams.map((exam, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Subject {exam.subject_id}</h3>
                        <Badge variant={exam.grade.startsWith("A") ? "default" : "secondary"}>{exam.grade}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">CA</p>
                          <p className="font-medium">{exam.ca}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">CA2</p>
                          <p className="font-medium">{exam.ca2}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Exam</p>
                          <p className="font-medium">{exam.exam}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total</p>
                          <p className="font-medium">{exam.total}/100</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {exam.session} - {exam.term} Term {exam.year}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Record</CardTitle>
                <CardDescription>Your attendance history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attendance.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{record.class_name}</p>
                        <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={record.status === "present" ? "default" : "destructive"}>
                        {record.status || "Present"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export function StudentsSection() {
  return <StudentManagementSection />
}
