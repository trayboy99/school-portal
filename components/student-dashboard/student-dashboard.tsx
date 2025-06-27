"use client"

import { useState } from "react"
import { StudentSidebar } from "./student-sidebar"
import { StudentHeader } from "./student-header"
import { StudentDashboardContent } from "./student-dashboard-content"
import { ClassSection } from "./sections/class-section"
import { SubjectsSection } from "./sections/subjects-section"
import { NotesSection } from "./sections/notes-section"
import { ResultsSection } from "./sections/results-section"
import { AssignmentsSection } from "./sections/assignments-section"
import { MessagesSection } from "./sections/messages-section"
import { SettingsSection } from "./sections/settings-section"
import { useAuth } from "@/contexts/auth-context"

export function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  console.log("StudentDashboard rendering - Active section:", activeSection, "User:", user)

  const renderContent = () => {
    console.log("Rendering content for section:", activeSection)
    switch (activeSection) {
      case "dashboard":
        return <StudentDashboardContent />
      case "class":
        return <ClassSection />
      case "subjects":
        return <SubjectsSection />
      case "notes":
        return <NotesSection />
      case "results":
        return <ResultsSection />
      case "assignments":
        return <AssignmentsSection />
      case "messages":
        return <MessagesSection />
      case "settings":
        return <SettingsSection />
      default:
        return <StudentDashboardContent />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
