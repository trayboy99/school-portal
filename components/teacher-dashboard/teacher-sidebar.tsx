"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  UserCheck,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  X,
  FileText,
  Upload,
} from "lucide-react"

interface TeacherSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "my-classes", label: "My Classes", icon: Users },
  { id: "my-subjects", label: "My Subjects", icon: BookOpen },
  { id: "marks-entry", label: "Marks Entry", icon: ClipboardList },
  { id: "attendance", label: "Attendance", icon: UserCheck },
  { id: "assignments", label: "Assignments", icon: FileText },
  { id: "timetable", label: "Timetable", icon: Calendar },
  { id: "student-performance", label: "Student Performance", icon: BarChart3 },
  { id: "uploads", label: "Uploads", icon: Upload },
  { id: "report-comments", label: "Report Comments", icon: FileText },
  { id: "communications", label: "Communications", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
]

export function TeacherSidebar({ activeSection, setActiveSection, isOpen, onClose }: TeacherSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Teacher Portal</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    activeSection === item.id
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                  onClick={() => {
                    setActiveSection(item.id)
                    onClose()
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
