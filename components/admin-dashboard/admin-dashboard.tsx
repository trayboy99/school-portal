"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Upload,
  Building2,
  Calculator,
  Bell,
  LogOut,
  Menu,
  X,
  ClipboardList,
} from "lucide-react"

// Import all sections
import { StudentManagementSection } from "./sections/student-management-section"
import { TeacherManagementSection } from "./sections/teacher-management-section"
import { SubjectsManagementSection } from "./sections/subjects-management-section"
import { ClassesManagementSection } from "./sections/classes-management-section"
import { AcademicCalendarSection } from "./sections/academic-calendar-section"
import { ExamsManagementSection } from "./sections/exams-management-section"
import { UploadsManagementSection } from "./sections/uploads-management-section"
import { DepartmentsManagementSection } from "./sections/departments-management-section"
import { MarksManagementSection } from "./sections/marks-management-section"
import { ResultsManagementSection } from "./sections/results-management-section"
import { SettingsSection } from "./sections/settings-section"

interface AdminData {
  id: number
  username: string
  first_name?: string
  middle_name?: string
  surname?: string
  full_name?: string
  email?: string
  role: string
  status: string
  created_at: string
  updated_at: string
}

interface AdminDashboardProps {
  adminData: AdminData
}

const menuItems = [
  {
    id: "overview",
    label: "Overview",
    icon: BarChart3,
    description: "Dashboard overview and statistics",
  },
  {
    id: "students",
    label: "Students",
    icon: Users,
    description: "Manage student records and information",
  },
  {
    id: "teachers",
    label: "Teachers",
    icon: GraduationCap,
    description: "Manage teaching staff and assignments",
  },
  {
    id: "subjects",
    label: "Subjects",
    icon: BookOpen,
    description: "Manage academic subjects and curriculum",
  },
  {
    id: "classes",
    label: "Classes",
    icon: Building2,
    description: "Manage class structures and assignments",
  },
  {
    id: "departments",
    label: "Departments",
    icon: Building2,
    description: "Manage school departments",
  },
  {
    id: "academic",
    label: "Academic Calendar",
    icon: Calendar,
    description: "Manage academic years, terms, and sessions",
  },
  {
    id: "exams",
    label: "Examinations",
    icon: FileText,
    description: "Manage examination schedules and types",
  },
  {
    id: "marks",
    label: "Marks Management",
    icon: Calculator,
    description: "Enter and manage student examination scores",
  },
  {
    id: "results",
    label: "Results Management",
    icon: ClipboardList,
    description: "Query and view student examination results",
  },
  {
    id: "uploads",
    label: "Uploads",
    icon: Upload,
    description: "Manage file uploads and deadlines",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "System settings and configuration",
  },
]

export function AdminDashboard({ adminData }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
  })

  // Safely get admin name with fallbacks
  const adminName =
    adminData?.full_name ||
    (adminData?.first_name && adminData?.surname
      ? `${adminData.first_name} ${adminData.surname}`.trim()
      : adminData?.username || "Admin User")

  const adminInitials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [studentsRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/teachers"),
        fetch("/api/admin/classes"),
        fetch("/api/admin/subjects"),
      ])

      const [students, teachers, classes, subjects] = await Promise.all([
        studentsRes.ok ? studentsRes.json() : [],
        teachersRes.ok ? teachersRes.json() : [],
        classesRes.ok ? classesRes.json() : [],
        subjectsRes.ok ? subjectsRes.json() : [],
      ])

      setStats({
        totalStudents: Array.isArray(students) ? students.length : 0,
        totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
        totalClasses: Array.isArray(classes) ? classes.length : 0,
        totalSubjects: Array.isArray(subjects) ? subjects.length : 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
              <p className="text-muted-foreground">
                Welcome back, {adminName}. Here's what's happening at your school.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Active student records</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTeachers}</div>
                  <p className="text-xs text-muted-foreground">Teaching staff members</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClasses}</div>
                  <p className="text-xs text-muted-foreground">Active class sections</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSubjects}</div>
                  <p className="text-xs text-muted-foreground">Available subjects</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates and activities in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New student registrations</p>
                        <p className="text-xs text-muted-foreground">5 new students added today</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Marks entry completed</p>
                        <p className="text-xs text-muted-foreground">Midterm results for JSS 1 uploaded</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Upload deadline reminder</p>
                        <p className="text-xs text-muted-foreground">E-notes due in 3 days</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveSection("students")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Add New Student
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveSection("teachers")}
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Add New Teacher
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveSection("marks")}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Enter Marks
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveSection("results")}
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    View Results
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "students":
        return <StudentManagementSection />
      case "teachers":
        return <TeacherManagementSection />
      case "subjects":
        return <SubjectsManagementSection />
      case "classes":
        return <ClassesManagementSection />
      case "departments":
        return <DepartmentsManagementSection />
      case "academic":
        return <AcademicCalendarSection />
      case "exams":
        return <ExamsManagementSection />
      case "marks":
        return <MarksManagementSection />
      case "results":
        return <ResultsManagementSection />
      case "uploads":
        return <UploadsManagementSection />
      case "settings":
        return <SettingsSection />
      default:
        return <div>Section not found</div>
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">School Portal</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1">
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={!sidebarOpen ? item.label : ""}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-blue-700" : "text-gray-500"}`} />
                {sidebarOpen && (
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    {isActive && <div className="text-xs text-blue-600 mt-1">{item.description}</div>}
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-blue-100 text-blue-700">{adminInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{adminName}</p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                {menuItems.find((item) => item.id === activeSection)?.label || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-blue-100 text-blue-700">{adminInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{adminName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {adminData?.email || "admin@school.edu"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveSection("settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
