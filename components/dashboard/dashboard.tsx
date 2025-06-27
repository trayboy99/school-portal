"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { DashboardContent } from "./dashboard-content"
import { StudentsSection } from "./sections/students-section"
import { TeachersSection } from "./sections/teachers-section"
import { ClassesSection } from "./sections/classes-section"
import { SubjectsSection } from "./sections/subjects-section"
import { TimetableSection } from "./sections/timetable-section"
import { AttendanceSection } from "./sections/attendance-section"
import { GradesSection } from "./sections/grades-section"
import { LibrarySection } from "./sections/library-section"
import { FinanceSection } from "./sections/finance-section"
import { CommunicationsSection } from "./sections/communications-section"
import { ReportsSection } from "./sections/reports-section"
import { SettingsSection } from "./sections/settings-section"
import { ResultsSection } from "./sections/results-section"
import ExamManagement from "../exams/exam-management"
import { UploadsSection } from "./sections/uploads-section"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [previousSection, setPreviousSection] = useState("dashboard")

  // Redirect based on user type
  useEffect(() => {
    if (user) {
      if (user.userType === "teacher") {
        router.push("/teacher-dashboard")
        return
      }
      if (user.userType === "student") {
        router.push("/student-dashboard")
        return
      }
      // Admin and other types stay on main dashboard
    }
  }, [user, router])

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent previousSection={previousSection} />
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
      case "exams":
        return <ExamManagement />
      case "results":
        return <ResultsSection />
      case "uploads":
        return <UploadsSection />
      case "library":
        return <LibrarySection />
      case "finance":
        return <FinanceSection />
      case "communications":
        return <CommunicationsSection />
      case "reports":
        return <ReportsSection />
      case "settings":
        return <SettingsSection />
      default:
        return <DashboardContent previousSection={previousSection} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:ml-0">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Dashboard Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden w-full">
          <div className="w-full max-w-none">{renderActiveSection()}</div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
