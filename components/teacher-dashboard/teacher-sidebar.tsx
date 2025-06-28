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
  FileText,
  Calendar,
  TrendingUp,
  MessageSquare,
  Settings,
  X,
  GraduationCap,
  Upload,
  MessageCircle,
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
  { id: "student-performance", label: "Student Performance", icon: TrendingUp },
  { id: "all-teachers", label: "All Teachers", icon: GraduationCap },
  { id: "class-assigned", label: "Class Assigned", icon: Users },
  { id: "subjects-overview", label: "Subjects Overview", icon: BookOpen },
  { id: "report-comments", label: "Report Comments", icon: MessageCircle },
  { id: "uploads", label: "Uploads", icon: Upload },
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
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-lg font-semibold">Teacher Portal</span>
          </div>
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
                    "w-full justify-start",
                    activeSection === item.id && "bg-blue-600 text-white hover:bg-blue-700",
                  )}
                  onClick={() => {
                    setActiveSection(item.id)
                    onClose()
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
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
