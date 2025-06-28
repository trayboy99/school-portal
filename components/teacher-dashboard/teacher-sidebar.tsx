"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BookOpen,
  Users,
  ClipboardList,
  Calendar,
  MessageSquare,
  Upload,
  BarChart3,
  Settings,
  X,
  Home,
  GraduationCap,
  FileText,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TeacherSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { icon: Home, label: "Dashboard", id: "dashboard" },
  { icon: Users, label: "My Classes", id: "my-classes" },
  { icon: BookOpen, label: "My Subjects", id: "my-subjects" },
  { icon: GraduationCap, label: "All Teachers", id: "all-teachers" },
  { icon: ClipboardList, label: "Marks Entry", id: "marks-entry" },
  { icon: Clock, label: "Attendance", id: "attendance" },
  { icon: FileText, label: "Assignments", id: "assignments" },
  { icon: Calendar, label: "Timetable", id: "timetable" },
  { icon: Upload, label: "Uploads", id: "uploads" },
  { icon: MessageSquare, label: "Communications", id: "communications" },
  { icon: BarChart3, label: "Student Performance", id: "student-performance" },
  { icon: FileText, label: "Report Comments", id: "report-comments" },
  { icon: Settings, label: "Settings", id: "settings" },
]

export function TeacherSidebar({ isOpen, onClose }: TeacherSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Teacher Portal</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start text-left font-normal hover:bg-gray-100"
                onClick={() => {
                  // Handle navigation here
                  onClose()
                }}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </>
  )
}
