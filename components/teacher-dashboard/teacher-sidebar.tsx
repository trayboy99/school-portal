"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  UserCheck,
  FileText,
  Calendar,
  MessageSquare,
  Settings,
  X,
  GraduationCap,
} from "lucide-react"

interface TeacherSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeSection: string
  setActiveSection: (section: string) => void
}

export function TeacherSidebar({ isOpen, onClose, activeSection, setActiveSection }: TeacherSidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      count: null,
    },
    {
      id: "my-classes",
      label: "My Classes",
      icon: Users,
      count: 3,
    },
    {
      id: "my-subjects",
      label: "My Subjects",
      icon: BookOpen,
      count: 2,
    },
    {
      id: "marks-entry",
      label: "Marks Entry",
      icon: ClipboardList,
      count: null,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: UserCheck,
      count: null,
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: FileText,
      count: 5,
    },
    {
      id: "timetable",
      label: "My Timetable",
      icon: Calendar,
      count: null,
    },
    {
      id: "student-performance",
      label: "Student Performance",
      icon: BarChart3,
      count: null,
    },
    {
      id: "all-teachers",
      label: "All Teachers",
      icon: GraduationCap,
      count: null,
    },
    {
      id: "class-assigned",
      label: "Class Assigned",
      icon: Users,
      count: null,
    },
    {
      id: "subjects-overview",
      label: "Subjects Overview",
      icon: BookOpen,
      count: null,
    },
    {
      id: "report-comments",
      label: "Report Comments",
      icon: MessageSquare,
      count: null,
    },
    {
      id: "uploads",
      label: "Uploads",
      icon: FileText,
      count: null,
    },
    {
      id: "communications",
      label: "Messages",
      icon: MessageSquare,
      count: 3,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      count: null,
    },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white h-4 w-4" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Teacher Portal</h1>
              <p className="text-xs text-gray-500">Westminster College</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left h-10 flex-shrink-0",
                activeSection === item.id
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "text-gray-700 hover:bg-gray-100",
              )}
              onClick={() => {
                setActiveSection(item.id)
                onClose()
              }}
            >
              <item.icon className="mr-3 h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.count && (
                <Badge variant="secondary" className="ml-auto">
                  {item.count}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <p className="text-xs text-gray-500">© 2024 Westminster College</p>
          <p className="text-xs text-gray-500">Teacher Portal v1.0</p>
        </div>
      </div>
    </>
  )
}
