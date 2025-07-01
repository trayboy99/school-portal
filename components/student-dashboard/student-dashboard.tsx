"use client"

import { useState } from "react"
import { StudentSidebar } from "./student-sidebar"
import { StudentHeader } from "./student-header"
import { StudentDashboardContent } from "./student-dashboard-content"

export function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="lg:pl-64">
        <StudentHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <StudentDashboardContent activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
        </main>
      </div>
    </div>
  )
}
