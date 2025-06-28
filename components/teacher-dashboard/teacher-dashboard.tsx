"use client"
import { useState } from "react"
import { TeacherSidebar } from "./teacher-sidebar"
import { TeacherHeader } from "./teacher-header"
import { TeacherDashboardContent } from "./teacher-dashboard-content"
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

export function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <TeacherDashboardContent />
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
        return <TeacherDashboardContent />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <TeacherSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TeacherHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">{renderActiveSection()}</main>
      </div>
    </div>
  )
}
