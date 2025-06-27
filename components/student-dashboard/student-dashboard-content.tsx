"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ClipboardList,
  BarChart3,
  Calendar,
  Users,
  Award,
  Clock,
  TrendingUp,
  MessageSquare,
  FileText,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function StudentDashboardContent() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Current GPA",
      value: "3.85",
      change: "+0.12 from last term",
      icon: Award,
      color: "text-green-600",
    },
    {
      title: "Attendance",
      value: "96%",
      change: "185/192 days present",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Assignments",
      value: "8/10",
      change: "2 pending submissions",
      icon: ClipboardList,
      color: "text-orange-600",
    },
    {
      title: "Class Rank",
      value: "5th",
      change: "Out of 45 students",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ]

  const recentActivities = [
    {
      title: "Mathematics Assignment Submitted",
      description: "Algebra Problem Set 5 - Due: Today",
      time: "2 hours ago",
      icon: ClipboardList,
      color: "text-green-600",
    },
    {
      title: "Physics Test Result Available",
      description: "Mechanics Test - Score: 85/100",
      time: "1 day ago",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      title: "New Message from Teacher",
      description: "Mrs. Johnson - Chemistry Lab Instructions",
      time: "2 days ago",
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      title: "E-Notes Updated",
      description: "Biology - Cell Structure and Function",
      time: "3 days ago",
      icon: FileText,
      color: "text-orange-600",
    },
  ]

  const upcomingEvents = [
    {
      title: "Chemistry Test",
      date: "Tomorrow at 10:00 AM",
      subject: "Chemistry",
      type: "test",
    },
    {
      title: "Mathematics Assignment Due",
      date: "Dec 18 at 11:59 PM",
      subject: "Mathematics",
      type: "assignment",
    },
    {
      title: "Physics Lab Session",
      date: "Dec 20 at 2:00 PM",
      subject: "Physics",
      type: "lab",
    },
    {
      title: "English Essay Submission",
      date: "Dec 22 at 11:59 PM",
      subject: "English",
      type: "assignment",
    },
  ]

  const subjectProgress = [
    { subject: "Mathematics", progress: 92, grade: "A" },
    { subject: "Physics", progress: 88, grade: "A" },
    { subject: "Chemistry", progress: 85, grade: "B+" },
    { subject: "Biology", progress: 90, grade: "A" },
    { subject: "English", progress: 87, grade: "B+" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
        <p className="text-green-100">You're doing great this term. Keep up the excellent work!</p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Class: {user?.class}
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Second Term 2024-2025
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your latest academic activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="p-2 rounded-full bg-gray-100">
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg border">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      event.type === "test"
                        ? "bg-red-500"
                        : event.type === "assignment"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.subject}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subject Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>Your current progress in each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectProgress.map((subject, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium">{subject.subject}</div>
                <div className="flex-1">
                  <Progress value={subject.progress} className="h-2" />
                </div>
                <div className="w-12 text-sm text-gray-500">{subject.progress}%</div>
                <Badge variant={subject.grade.startsWith("A") ? "default" : "secondary"}>{subject.grade}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
