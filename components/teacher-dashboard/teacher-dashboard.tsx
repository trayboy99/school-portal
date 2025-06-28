"use client"

import type React from "react"
import { useState } from "react"
import { TeacherSidebar } from "./teacher-sidebar"
import { TeacherHeader } from "./teacher-header"
import { TeacherDashboardContent } from "./teacher-dashboard-content"

const TeacherDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState("overview")

  return (
    <div className="flex h-screen bg-gray-100">
      <TeacherSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TeacherHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <TeacherDashboardContent activeSection={activeSection} />
        </main>
      </div>
    </div>
  )
}

export default TeacherDashboard
