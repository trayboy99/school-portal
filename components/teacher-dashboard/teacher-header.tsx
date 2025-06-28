"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Menu, LogOut } from "lucide-react"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import { useRouter } from "next/navigation"

interface TeacherHeaderProps {
  onMenuClick: () => void
}

export function TeacherHeader({ onMenuClick }: TeacherHeaderProps) {
  const { teacher, logout } = useTeacherAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Teacher Dashboard</h1>
            <p className="text-sm text-gray-600">Westminster School Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={teacher?.avatar || "/placeholder.svg"} alt={teacher?.first_name} />
              <AvatarFallback>
                {teacher?.first_name?.[0]}
                {teacher?.surname?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {teacher?.first_name} {teacher?.surname}
              </p>
              <p className="text-xs text-gray-600">{teacher?.department}</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
