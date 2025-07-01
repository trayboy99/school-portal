"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { X, Home, BookOpen, Users, ClipboardList, FileText, BarChart3, MessageSquare, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStudentAuth } from "@/contexts/student-auth-context"

interface StudentSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const navigation = [
  { name: "Overview", id: "overview", icon: Home },
  { name: "Subjects", id: "subjects", icon: BookOpen },
  { name: "My Class", id: "class", icon: Users },
  { name: "Assignments", id: "assignments", icon: ClipboardList },
  { name: "E-Notes", id: "notes", icon: FileText },
  { name: "Results", id: "results", icon: BarChart3 },
  { name: "Messages", id: "messages", icon: MessageSquare },
  { name: "Settings", id: "settings", icon: Settings },
]

export function StudentSidebar({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen }: StudentSidebarProps) {
  const { student, logout } = useStudentAuth()

  const getStudentName = () => {
    if (!student) return "Student"
    return `${student.first_name} ${student.middle_name ? student.middle_name + " " : ""}${student.surname}`.trim()
  }

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-xl font-bold text-green-600">Student Portal</h1>
      </div>

      {/* Student Info */}
      {student && (
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">
                  {student.first_name.charAt(0)}
                  {student.surname.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{getStudentName()}</p>
              <p className="text-xs text-gray-500">Class: {student.current_class}</p>
              <p className="text-xs text-gray-500">Roll No: {student.roll_no}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Button
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      activeSection === item.id
                        ? "bg-green-50 text-green-700"
                        : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                    }`}
                    onClick={() => {
                      setActiveSection(item.id)
                      setSidebarOpen(false)
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-red-700 hover:bg-red-50"
              onClick={logout}
            >
              <Settings className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <Button variant="ghost" size="sm" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </Button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}
