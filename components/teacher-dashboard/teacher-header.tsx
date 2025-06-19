"use client"

import { Bell, Menu, Search, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    router.push("/login") // Changed from "/teacher-login" to "/login"
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 w-full">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        {/* Left side */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <Button variant="ghost" size="sm" className="lg:hidden shrink-0" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search students, classes..." className="pl-10 w-full text-sm" />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative shrink-0">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs">
              2
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{teacher?.first_name}</p>
                  <p className="text-xs text-gray-500">{teacher?.department}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
