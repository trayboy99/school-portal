"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, TrendingUp, Users, FileText, MessageSquare } from "lucide-react"
import { useStudentAuth } from "@/contexts/student-auth-context"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  totalSubjects: number
  activeAssignments: number
  upcomingExams: number
  averageGrade: string
  attendanceRate: string
  unreadMessages: number
}

interface RecentActivity {
  id: string
  type: "assignment" | "exam" | "grade" | "message"
  title: string
  description: string
  date: string
  status?: string
}

export default function OverviewSection() {
  const { student } = useStudentAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    activeAssignments: 0,
    upcomingExams: 0,
    averageGrade: "N/A",
    attendanceRate: "N/A",
    unreadMessages: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (student) {
      loadDashboardData()
    }
  }, [student])

  const loadDashboardData = async () => {
    if (!student) return

    try {
      setLoading(true)

      // Load subjects for student's class
      const { data: subjects } = await supabase.from("subjects").select("*").eq("target_class", student.class)

      // Load assignments for student's class
      const { data: assignments } = await supabase
        .from("assignments")
        .select("*")
        .eq("class_name", student.class)
        .eq("status", "active")

      // Load exams
      const { data: exams } = await supabase.from("exams").select("*").gte("exam_date", new Date().toISOString())

      // Load student grades
      const { data: grades } = await supabase
        .from("student_exams")
        .select("total")
        .eq("student_id", student.id)
        .not("total", "is", null)

      // Calculate average grade
      let averageGrade = "N/A"
      if (grades && grades.length > 0) {
        const total = grades.reduce((sum, grade) => sum + (grade.total || 0), 0)
        averageGrade = `${Math.round(total / grades.length)}%`
      }

      // Load attendance
      const { data: attendance } = await supabase.from("attendance").select("status").eq("student_id", student.id)

      let attendanceRate = "N/A"
      if (attendance && attendance.length > 0) {
        const present = attendance.filter((a) => a.status === "Present").length
        attendanceRate = `${Math.round((present / attendance.length) * 100)}%`
      }

      setStats({
        totalSubjects: subjects?.length || 0,
        activeAssignments: assignments?.length || 0,
        upcomingExams: exams?.length || 0,
        averageGrade,
        attendanceRate,
        unreadMessages: 0,
      })

      // Create recent activity
      const activities: RecentActivity[] = []

      if (assignments) {
        assignments.slice(0, 3).forEach((assignment) => {
          activities.push({
            id: assignment.id.toString(),
            type: "assignment",
            title: assignment.title,
            description: `Due: ${new Date(assignment.due_date).toLocaleDateString()}`,
            date: assignment.created_at,
            status: "pending",
          })
        })
      }

      setRecentActivity(activities)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your dashboard.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Welcome back, {student.first_name}!</h1>
        <p className="text-blue-100 mt-1">
          {student.class} •{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAssignments}</div>
            <p className="text-xs text-muted-foreground">Due soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageGrade}</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}</div>
            <p className="text-xs text-muted-foreground">This term</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Assignments
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Check Results
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              View Timetable
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === "assignment" && <FileText className="h-4 w-4 text-blue-500" />}
                      {activity.type === "exam" && <Calendar className="h-4 w-4 text-red-500" />}
                      {activity.type === "grade" && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {activity.type === "message" && <MessageSquare className="h-4 w-4 text-purple-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                    {activity.status && (
                      <Badge variant="secondary" className="text-xs">
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Mathematics Test</p>
                <p className="text-sm text-gray-500">Chapter 5: Algebra</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Tomorrow</p>
                <p className="text-xs text-gray-500">10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Science Project Due</p>
                <p className="text-sm text-gray-500">Solar System Model</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Friday</p>
                <p className="text-xs text-gray-500">End of day</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
