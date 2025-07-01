"use client"

import { Menu, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStudentAuth } from "@/contexts/student-auth-context"

interface StudentHeaderProps {
  onMenuClick: () => void
}

export function StudentHeader({ onMenuClick }: StudentHeaderProps) {
  const { student, logout } = useStudentAuth()

  const getStudentName = () => {
    if (!student) return "Student"
    return `${student.first_name} ${student.middle_name ? student.middle_name + " " : ""}${student.surname}`.trim()
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={onMenuClick}>
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <h1 className="text-lg font-semibold text-gray-900">Welcome, {getStudentName()}</h1>
          {student && (
            <div className="ml-4 text-sm text-gray-500">
              Class: {student.current_class} | Roll No: {student.roll_no}
            </div>
          )}
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="sm" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </Button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="-m-1.5 flex items-center p-1.5" onClick={logout}>
              <span className="sr-only">Open user menu</span>
              <User className="h-6 w-6 text-gray-400" aria-hidden="true" />
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                  {getStudentName()}
                </span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
