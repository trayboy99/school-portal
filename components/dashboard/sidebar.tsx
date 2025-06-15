"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload } from "lucide-react"

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  UserCheck,
  BarChart3,
  FileText,
  ClipboardList,
  Library,
  DollarSign,
  MessageSquare,
  Settings,
  X,
  School,
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activeSection: string
  setActiveSection: (section: string) => void
}

export function Sidebar({ isOpen, onClose, activeSection, setActiveSection }: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      count: null,
    },
    {
      id: "students",
      label: "Students",
      icon: Users,
      count: 1247,
    },
    {
      id: "teachers",
      label: "Teachers",
      icon: GraduationCap,
      count: 89,
    },
    {
      id: "classes",
      label: "Classes",
      icon: School,
      count: 24,
    },
    {
      id: "subjects",
      label: "Subjects",
      icon: BookOpen,
      count: 15,
    },
    {
      id: "timetable",
      label: "Timetable",
      icon: Calendar,
      count: null,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: UserCheck,
      count: null,
    },
    {
      id: "grades",
      label: "Grades",
      icon: BarChart3,
      count: null,
    },
    {
      id: "exams",
      label: "Exams",
      icon: ClipboardList,
      count: 8,
    },
    {
      id: "results",
      label: "Results",
      icon: FileText,
      count: null,
    },
   {
      id: "uploads",
      label: "Uploads",
      icon: Upload,
      count: 0, // or undefined if not needed
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: FileText,
      count: 12,
    },
    {
      id: "library",
      label: "Library",
      icon: Library,
      count: 2341,
    },
    {
      id: "finance",
      label: "Finance",
      icon: DollarSign,
      count: null,
    },
    {
      id: "communications",
      label: "Communications",
      icon: MessageSquare,
      count: 5,
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      count: null,
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Westminster</h1>
              <p className="text-xs text-gray-500">College Lagos</p>
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
                  ? "bg-blue-600 text-white hover:bg-blue-700"
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
          <p className="text-xs text-gray-500">Version 1.0.0</p>
        </div>
      </div>
    </>
  )
}
