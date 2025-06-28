"use client"

import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Calendar, MessageSquare, FileText, Clock } from "lucide-react"

export function TeacherDashboardContent() {
  const { teacher } = useTeacherAuth()

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading teacher information...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {teacher.first_name} {teacher.middle_name} {teacher.surname}!
        </h1>
        <p className="text-blue-100">
          {teacher.department} Department • {teacher.qualification}
        </p>
        <div className="flex gap-4 mt-4">
          <Badge variant="secondary" className="bg-white/20 text-white">
            {teacher.employment_type}
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {teacher.experience} Experience
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.classes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{teacher.classes?.join(", ") || "No classes assigned"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.subjects?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{teacher.subjects?.join(", ") || "No subjects assigned"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{teacher.status}</div>
            <p className="text-xs text-muted-foreground">Since {new Date(teacher.hire_date).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Your classes and activities for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">English Language</p>
                  <p className="text-sm text-gray-600">JSS 2A</p>
                </div>
                <Badge variant="outline">9:00 AM</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Literature</p>
                  <p className="text-sm text-gray-600">JSS 3B</p>
                </div>
                <Badge variant="outline">11:00 AM</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Messages
            </CardTitle>
            <CardDescription>Latest communications and announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-sm">Staff Meeting Reminder</p>
                <p className="text-xs text-gray-600">Tomorrow at 2:00 PM in the conference room</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-sm">Exam Schedule Updated</p>
                <p className="text-xs text-gray-600">Mid-term exams start next Monday</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Teacher Profile
          </CardTitle>
          <CardDescription>Your professional information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Employee ID</p>
              <p className="text-lg">{teacher.employee_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-lg">{teacher.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Phone</p>
              <p className="text-lg">{teacher.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Department</p>
              <p className="text-lg">{teacher.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function TeacherDashboardContentRouter({ activeSection }: { activeSection: string }) {
  if (activeSection === "dashboard") {
    return <TeacherDashboardContent />
  }
  return <div>Section: {activeSection}</div>
}
