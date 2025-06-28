"use client"
import { TimetableSection } from "./sections/timetable-section"
import { AttendanceSection } from "./sections/attendance-section"
import { GradesSection } from "./sections/grades-section"
import { AssignmentsSection } from "./sections/assignments-section"
import { LibrarySection } from "./sections/library-section"
import { FinanceSection } from "./sections/finance-section"
import { ReportsSection } from "./sections/reports-section"
import { SettingsSection } from "./sections/settings-section"
import { StudentsSection } from "./sections/students-section"
import { TeachersSection } from "./sections/teachers-section"
import { ClassesSection } from "./sections/classes-section"
import { SubjectsSection } from "./sections/subjects-section"
import { UploadsSection } from "./sections/uploads-section"
import { CommunicationsSection } from "./sections/communications-section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, BookOpen, Calendar, TrendingUp, UserCheck, Clock } from "lucide-react"

interface DashboardContentProps {
  activeSection: string
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome to Westminster School Management System</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">6 classes per level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">New student enrolled</p>
                  <p className="text-xs text-gray-500">John Doe joined JSS 1A - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Exam results published</p>
                  <p className="text-xs text-gray-500">First Term Mathematics results - 4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Fee payment received</p>
                  <p className="text-xs text-gray-500">Jane Smith paid tuition fee - 6 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">New teacher assigned</p>
                  <p className="text-xs text-gray-500">Mr. Johnson assigned to SS 2 Mathematics - 1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Present Today</span>
                <span className="font-bold text-green-600">1,165 students</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Absent Today</span>
                <span className="font-bold text-red-600">69 students</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Fees</span>
                <span className="font-bold text-yellow-600">₦2,450,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Library Books</span>
                <span className="font-bold text-blue-600">3,456 total</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Assignments</span>
                <span className="font-bold text-purple-600">23 assignments</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>Important dates and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">Jan 20, 2024</div>
              <div className="font-medium">First Term Examinations</div>
              <div className="text-sm text-gray-600">All classes - Mathematics exam</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">Jan 25, 2024</div>
              <div className="font-medium">Parent-Teacher Meeting</div>
              <div className="text-sm text-gray-600">JSS 1 & JSS 2 parents</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">Feb 1, 2024</div>
              <div className="font-medium">Fee Payment Deadline</div>
              <div className="text-sm text-gray-600">Second term fees due</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderDashboardOverview()
      case "students":
        return <StudentsSection />
      case "teachers":
        return <TeachersSection />
      case "classes":
        return <ClassesSection />
      case "subjects":
        return <SubjectsSection />
      case "timetable":
        return <TimetableSection />
      case "attendance":
        return <AttendanceSection />
      case "grades":
        return <GradesSection />
      case "assignments":
        return <AssignmentsSection />
      case "library":
        return <LibrarySection />
      case "finance":
        return <FinanceSection />
      case "reports":
        return <ReportsSection />
      case "uploads":
        return <UploadsSection />
      case "communications":
        return <CommunicationsSection />
      case "settings":
        return <SettingsSection />
      default:
        return renderDashboardOverview()
    }
  }

  return <div className="flex-1 p-6">{renderContent()}</div>
}
