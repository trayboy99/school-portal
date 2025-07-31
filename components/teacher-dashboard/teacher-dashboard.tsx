"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Calendar, ClipboardList, LogOut } from "lucide-react"

interface TeacherDashboardProps {
  teacherId: string
}

export function TeacherDashboard({ teacherId }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = () => {
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Teacher Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Teacher ID: {teacherId}</Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Teacher Dashboard</CardTitle>
              <CardDescription>Manage your classes and students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">120</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">5</div>
                  <div className="text-sm text-gray-600">Classes</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <ClipboardList className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">15</div>
                  <div className="text-sm text-gray-600">Assignments</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <div className="text-sm text-gray-600">Upcoming Exams</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm font-medium">Mathematics - Grade 10A</div>
                    <div className="text-xs text-gray-500">9:00 AM - 10:00 AM</div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm font-medium">Physics - Grade 11B</div>
                    <div className="text-xs text-gray-500">11:00 AM - 12:00 PM</div>
                  </div>
                  <Badge variant="secondary">Upcoming</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Math Quiz - Grade 10A</span>
                  <Badge variant="destructive">25 pending</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Physics Lab - Grade 11B</span>
                  <Badge variant="destructive">18 pending</Badge>
                </div>
                <Button size="sm" className="w-full mt-2">
                  Grade Assignments
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  View Students
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
