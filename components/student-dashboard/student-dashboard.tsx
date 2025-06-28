"use client"

import { useState } from "react"
import { StudentSidebar } from "./student-sidebar"
import { StudentHeader } from "./student-header"
import { StudentDashboardContent } from "./student-dashboard-content"

export function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <StudentDashboardContent />
        </main>
      </div>
    </div>
  )
}
