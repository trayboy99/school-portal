"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  ClipboardList,
  MessageSquare,
  Settings,
  X,
  GraduationCap,
  StickyNote,
} from "lucide-react"

interface StudentSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeSection: string
  setActiveSection: (section: string) => void
}

export function StudentSidebar({ isOpen, onClose, activeSection, setActiveSection }: StudentSidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      count: null,
    },
    {
      id: "class",
      label: "My Class",
      icon: Users,
      count: null,
    },
    {
      id: "subjects",
      label: "Subjects",
      icon: BookOpen,
      count: 9,
    },
    {
      id: "notes",
      label: "Notes",
      icon: StickyNote,
      count: 15,
    },
    {
      id: "results",
      label: "Results",
      icon: BarChart3,
      count: null,
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: ClipboardList,
      count: 3,
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      count: 2,
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
              <h1 className="font-bold text-lg">Student Portal</h1>
              <p className="text-xs text-gray-500">Westminster College</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left h-10",
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
          <p className="text-xs text-gray-500">Student Portal v1.0</p>
        </div>
      </div>
    </>
  )
}
