"use client"

import { TeacherDashboardContent as DashboardHome } from "./teacher-dashboard-content"
import { MyClassesSection } from "./sections/my-classes-section"
import { MySubjectsSection } from "./sections/my-subjects-section"
import { MarksEntrySection } from "./sections/marks-entry-section"
import { AttendanceSection } from "./sections/attendance-section"
import { AssignmentsSection } from "./sections/assignments-section"
import { TimetableSection } from "./sections/timetable-section"
import { StudentPerformanceSection } from "./sections/student-performance-section"
import { CommunicationsSection } from "./sections/communications-section"
import { SettingsSection } from "./sections/settings-section"
import { AllTeachersSection } from "./sections/all-teachers-section"
import { ClassAssignedSection } from "./sections/class-assigned-section"
import { SubjectsOverviewSection } from "./sections/subjects-overview-section"
import { ReportCommentsSection } from "./sections/report-comments-section"
import { UploadsSection } from "./sections/uploads-section"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, ClipboardList, TrendingUp, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface ClassInfo {
  class_name: string
  student_count: number
  subjects: string[]
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
}

export function TeacherDashboardContent() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [teacherData, setTeacherData] = useState<any>(null)

  useEffect(() => {
    if (user && user.userType === "teacher") {
      loadTeacherData()
    }
  }, [user])

  const loadTeacherData = async () => {
    if (!user || user.userType !== "teacher") return

    try {
      setIsLoading(true)

      // Get teacher details from database
      const { data: teacher, error: teacherError } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", user.dbId)
        .single()

      if (teacherError) {
        console.error("Error loading teacher:", teacherError)
        setIsLoading(false)
        return
      }

      setTeacherData(teacher)

      // Mock class data (in real app, you'd have a teacher-class relationship table)
      const mockClasses = [
        { class_name: "JSS 1A", student_count: 35, subjects: ["Mathematics", "English"] },
        { class_name: "JSS 2B", student_count: 32, subjects: ["Mathematics"] },
        { class_name: "JSS 3A", student_count: 28, subjects: ["Mathematics", "Physics"] },
      ]

      setClasses(mockClasses)
      setTotalStudents(mockClasses.reduce((sum, cls) => sum + cls.student_count, 0))

      // Mock recent activities
      setRecentActivities([
        {
          id: "1",
          type: "marks_entry",
          description: "Entered marks for Mathematics - JSS 1A",
          timestamp: "2 hours ago",
        },
        {
          id: "2",
          type: "attendance",
          description: "Took attendance for Physics - JSS 3A",
          timestamp: "1 day ago",
        },
        {
          id: "3",
          type: "assignment",
          description: "Created new assignment for Mathematics",
          timestamp: "2 days ago",
        },
      ])
    } catch (error) {
      console.error("Error loading teacher data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || user.userType !== "teacher") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Please log in as a teacher to access this dashboard.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold">Welcome back, {user.firstName}!</h1>
        <p className="text-green-100 mt-2">
          {user.department} Department • Teaching {classes.length} classes • {totalStudents} total students
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">Active classes assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Students across all classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Subjects teaching</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{user.department}</div>
            <p className="text-xs text-muted-foreground">Your department</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>Classes you're currently teaching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classes.map((classInfo) => (
                <div key={classInfo.class_name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{classInfo.class_name}</h3>
                    <p className="text-sm text-gray-600">{classInfo.student_count} students</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {classInfo.subjects.slice(0, 2).map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                    {classInfo.subjects.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{classInfo.subjects.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your recent teaching activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === "marks_entry" && <ClipboardList className="h-5 w-5 text-blue-600" />}
                    {activity.type === "attendance" && <Users className="h-5 w-5 text-green-600" />}
                    {activity.type === "assignment" && <BookOpen className="h-5 w-5 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-600 hover:bg-green-700">
              <ClipboardList className="h-6 w-6" />
              <span className="text-sm">Enter Marks</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Take Attendance</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Create Assignment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">View Performance</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your classes for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Mathematics - JSS 1A</p>
                  <p className="text-sm text-gray-600">9:00 AM - 10:00 AM</p>
                </div>
              </div>
              <Badge variant="secondary">Next</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Physics - JSS 3A</p>
                  <p className="text-sm text-gray-600">11:00 AM - 12:00 PM</p>
                </div>
              </div>
              <Badge variant="outline">Upcoming</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Mathematics - JSS 2B</p>
                  <p className="text-sm text-gray-600">2:00 PM - 3:00 PM</p>
                </div>
              </div>
              <Badge variant="outline">Upcoming</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface TeacherDashboardContentProps {
  activeSection: string
}

export function TeacherDashboardContentRouter({ activeSection }: TeacherDashboardContentProps) {
  switch (activeSection) {
    case "dashboard":
      return <DashboardHome />
    case "my-classes":
      return <MyClassesSection />
    case "my-subjects":
      return <MySubjectsSection />
    case "marks-entry":
      return <MarksEntrySection />
    case "attendance":
      return <AttendanceSection />
    case "assignments":
      return <AssignmentsSection />
    case "timetable":
      return <TimetableSection />
    case "student-performance":
      return <StudentPerformanceSection />
    case "all-teachers":
      return <AllTeachersSection />
    case "class-assigned":
      return <ClassAssignedSection />
    case "subjects-overview":
      return <SubjectsOverviewSection />
    case "report-comments":
      return <ReportCommentsSection />
    case "uploads":
      return <UploadsSection />
    case "communications":
      return <CommunicationsSection />
    case "settings":
      return <SettingsSection />
    default:
      return <DashboardHome />
  }
}
