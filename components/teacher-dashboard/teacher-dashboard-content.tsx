"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"

// Import all sections
import { MyClassesSection } from "./sections/my-classes-section"
import { MySubjectsSection } from "./sections/my-subjects-section"
import { AllTeachersSection } from "./sections/all-teachers-section"
import { MarksEntrySection } from "./sections/marks-entry-section"
import { AttendanceSection } from "./sections/attendance-section"
import { AssignmentsSection } from "./sections/assignments-section"
import { TimetableSection } from "./sections/timetable-section"
import { UploadsSection } from "./sections/uploads-section"
import { CommunicationsSection } from "./sections/communications-section"
import { StudentPerformanceSection } from "./sections/student-performance-section"
import { ReportCommentsSection } from "./sections/report-comments-section"
import { SettingsSection } from "./sections/settings-section"

export function TeacherDashboardContent() {
  const { teacher } = useTeacherAuth()
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderSection = () => {
    switch (activeSection) {
      case "my-classes":
        return <MyClassesSection />
      case "my-subjects":
        return <MySubjectsSection />
      case "all-teachers":
        return <AllTeachersSection />
      case "marks-entry":
        return <MarksEntrySection />
      case "attendance":
        return <AttendanceSection />
      case "assignments":
        return <AssignmentsSection />
      case "timetable":
        return <TimetableSection />
      case "uploads":
        return <UploadsSection />
      case "communications":
        return <CommunicationsSection />
      case "student-performance":
        return <StudentPerformanceSection />
      case "report-comments":
        return <ReportCommentsSection />
      case "settings":
        return <SettingsSection />
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, {teacher?.first_name} {teacher?.surname}!
              </h2>
              <p className="text-gray-600">Here's what's happening in your classes today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacher?.classes?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Active classes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teacher?.subjects?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Subjects taught</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{teacher?.department}</div>
                  <p className="text-xs text-muted-foreground">Your department</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{teacher?.experience}</div>
                  <p className="text-xs text-muted-foreground">Years of experience</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks you might want to perform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveSection("marks-entry")}
                  >
                    Enter Student Marks
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveSection("attendance")}
                  >
                    Take Attendance
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveSection("uploads")}
                  >
                    Upload Materials
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveSection("assignments")}
                  >
                    Create Assignment
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent actions in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Marks entered for JSS 2 Mathematics</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Attendance taken for JSS 1 English</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Assignment created for JSS 3 Literature</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="my-classes">Classes</TabsTrigger>
          <TabsTrigger value="my-subjects">Subjects</TabsTrigger>
          <TabsTrigger value="marks-entry">Marks</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
          <TabsTrigger value="communications">Messages</TabsTrigger>
          <TabsTrigger value="student-performance">Performance</TabsTrigger>
          <TabsTrigger value="report-comments">Comments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <div className="mt-6">{renderSection()}</div>
      </Tabs>
    </div>
  )
}
