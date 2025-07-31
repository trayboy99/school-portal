"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, BookOpen, Clock, Bell } from "lucide-react"

interface OverviewData {
  student: any
  upcomingExams: any[]
  recentGrades: any[]
  announcements: any[]
  attendance: {
    present: number
    total: number
    percentage: number
  }
}

interface OverviewSectionProps {
  studentId: string
}

export function OverviewSection({ studentId }: OverviewSectionProps) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const response = await fetch(`/api/students/${studentId}/overview`)
        if (response.ok) {
          const overviewData = await response.json()
          setData(overviewData)
        }
      } catch (error) {
        console.error("Error fetching overview data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOverviewData()
  }, [studentId])

  if (loading) {
    return <div className="text-center py-8">Loading overview...</div>
  }

  if (!data) {
    return <div className="text-center py-8">Failed to load overview data</div>
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {data.student.first_name}!</CardTitle>
          <CardDescription>
            {data.student.current_class}-{data.student.section} • {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.attendance.percentage}%</div>
              <p className="text-sm text-gray-600">Attendance</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.recentGrades.length}</div>
              <p className="text-sm text-gray-600">Recent Grades</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.upcomingExams.length}</div>
              <p className="text-sm text-gray-600">Upcoming Exams</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.announcements.length}</div>
              <p className="text-sm text-gray-600">Announcements</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Upcoming Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingExams.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingExams.slice(0, 3).map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{exam.subject}</p>
                      <p className="text-sm text-gray-600">{exam.exam_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(exam.exam_date).toLocaleDateString()}</p>
                      <Badge variant="outline">{exam.duration_minutes} min</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No upcoming exams</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentGrades.length > 0 ? (
              <div className="space-y-3">
                {data.recentGrades.slice(0, 3).map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{grade.subject}</p>
                      <p className="text-sm text-gray-600">{grade.exam_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {grade.score}/{grade.max_score}
                      </p>
                      <Badge
                        variant={grade.grade === "A" ? "default" : grade.grade === "F" ? "destructive" : "secondary"}
                      >
                        {grade.grade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No recent grades</p>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.announcements.length > 0 ? (
              <div className="space-y-3">
                {data.announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="p-3 border rounded-lg">
                    <p className="font-medium">{announcement.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No announcements</p>
            )}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Mathematics</p>
                  <p className="text-sm text-gray-600">Mr. Johnson</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">08:00 - 09:30</p>
                  <p className="text-xs text-gray-500">Room 101</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">English</p>
                  <p className="text-sm text-gray-600">Mrs. Smith</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">09:45 - 11:15</p>
                  <p className="text-xs text-gray-500">Room 205</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Physics</p>
                  <p className="text-sm text-gray-600">Dr. Brown</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">11:30 - 13:00</p>
                  <p className="text-xs text-gray-500">Lab 1</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
