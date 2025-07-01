"use client"

import { useStudentAuth } from "@/contexts/student-auth-context"
import SubjectsSection from "./sections/subjects-section"
import ClassSection from "./sections/class-section"
import NotesSection from "./sections/notes-section"
import AssignmentsSection from "./sections/assignments-section"
import ResultsSection from "./sections/results-section"
import MessagesSection from "./sections/messages-section"
import SettingsSection from "./sections/settings-section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, FileText, ClipboardList, BarChart3, MessageSquare, User } from "lucide-react"

interface StudentDashboardContentProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function StudentDashboardContent({ activeSection, setActiveSection }: StudentDashboardContentProps) {
  const { student } = useStudentAuth()

  const renderOverview = () => (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {student?.first_name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening in your academic journey</p>
      </div>

      {/* Student Info Card */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-lg font-semibold">
                  {student?.first_name} {student?.middle_name} {student?.surname}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Class</p>
                <p className="text-lg font-semibold">{student?.current_class}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Roll Number</p>
                <p className="text-lg font-semibold">{student?.roll_no}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Registration Number</p>
                <p className="text-lg font-semibold">{student?.reg_number}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("subjects")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Active subjects for {student?.current_class}</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection("assignments")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Pending assignments</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("results")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Average score</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("class")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Class</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student?.current_class}</div>
            <p className="text-xs text-muted-foreground">Section: {student?.section}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("notes")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Available notes</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection("messages")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your latest academic activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mathematics Assignment Submitted</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">English Test Result Available</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New Chemistry Notes Uploaded</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm text-gray-600">{student?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Phone:</span>
                <span className="text-sm text-gray-600">{student?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Gender:</span>
                <span className="text-sm text-gray-600">{student?.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Parent:</span>
                <span className="text-sm text-gray-600">{student?.parent_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Parent Phone:</span>
                <span className="text-sm text-gray-600">{student?.parent_phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "subjects":
        return <SubjectsSection />
      case "class":
        return <ClassSection />
      case "notes":
        return <NotesSection />
      case "assignments":
        return <AssignmentsSection />
      case "results":
        return <ResultsSection />
      case "messages":
        return <MessagesSection />
      case "settings":
        return <SettingsSection />
      default:
        return renderOverview()
    }
  }

  return <div className="min-h-full">{renderContent()}</div>
}
