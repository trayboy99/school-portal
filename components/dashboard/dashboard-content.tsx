"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  GraduationCap,
  School,
  DollarSign,
  TrendingUp,
  Plus,
  FileText,
  UserPlus,
  Calendar,
  Bell,
  AlertTriangle,
  BookOpen,
} from "lucide-react"

interface DashboardContentProps {
  previousSection?: string
}

export function DashboardContent({ previousSection }: DashboardContentProps) {
  const stats = [
    {
      title: "Total Students",
      value: "1,247",
      change: "+12% from last month",
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Total Teachers",
      value: "89",
      change: "+3 new this month",
      icon: GraduationCap,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Active Classes",
      value: "24",
      change: "Across 6 grade levels",
      icon: School,
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
    {
      title: "Revenue (Monthly)",
      value: "₦45.2M",
      change: "+8.2% from last month",
      icon: DollarSign,
      color: "bg-orange-500",
      textColor: "text-orange-600",
    },
  ]

  const recentActivities = [
    {
      title: "New student enrollment",
      description: "Sarah Johnson enrolled in Grade 10A",
      time: "2 minutes ago",
      icon: UserPlus,
      color: "text-blue-600",
    },
    {
      title: "Assignment submitted",
      description: "Mathematics homework submitted by Grade 9B",
      time: "15 minutes ago",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Fee payment received",
      description: "₦150,000 payment from John Doe (Grade 11)",
      time: "1 hour ago",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Teacher absence reported",
      description: "Mrs. Smith will be absent tomorrow",
      time: "2 hours ago",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: "New announcement posted",
      description: "Parent-Teacher meeting scheduled for next week",
      time: "3 hours ago",
      icon: Bell,
      color: "text-blue-600",
    },
  ]

  const quickActions = [
    { title: "Add New Student", icon: UserPlus },
    { title: "Schedule Class", icon: Calendar },
    { title: "Send Announcement", icon: Bell },
    { title: "Generate Report", icon: FileText },
    { title: "Manage Exams", icon: BookOpen },
  ]

  const alerts = [
    {
      title: "Low Attendance",
      description: "Grade 8C has 65% attendance this week",
      type: "warning",
      color: "text-orange-600 bg-orange-50",
    },
    {
      title: "Pending Payments",
      description: "23 students have overdue fees",
      type: "error",
      color: "text-red-600 bg-red-50",
    },
    {
      title: "Upcoming Events",
      description: "Parent meeting in 3 days",
      type: "info",
      color: "text-blue-600 bg-blue-50",
    },
  ]

  const upcomingEvents = [
    {
      title: "Parent-Teacher Meeting",
      date: "Tomorrow at 9:00 AM",
      type: "meeting",
      color: "bg-blue-500",
    },
    {
      title: "Mathematics Exam",
      date: "Dec 15 at 10:00 AM",
      type: "exam",
      color: "bg-red-500",
    },
    {
      title: "Science Fair",
      date: "Dec 18 at 2:00 PM",
      type: "event",
      color: "bg-green-500",
    },
    {
      title: "Holiday Break Begins",
      date: "Dec 20 at All Day",
      type: "holiday",
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at Westminster College Lagos.</p>
        </div>
        <div className="flex gap-3">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color.replace("bg-", "bg-").replace("-500", "-100")}`}>
                <stat.icon className={`h-4 w-4 ${stat.textColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.change}
              </p>
            </CardContent>
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.color}`} />
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
              <CardDescription>Latest updates from across the school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`p-2 rounded-full bg-gray-100`}>
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

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button key={index} variant="outline" className="w-full justify-start">
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.title}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg ${alert.color}`}>
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-xs mt-1">{alert.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>Today's attendance statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Present</span>
                  <span>1,156 (92.7%)</span>
                </div>
                <Progress value={92.7} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Absent:</span>
                  <span className="font-medium ml-1">91</span>
                </div>
                <div>
                  <span className="text-gray-500">Late:</span>
                  <span className="font-medium ml-1">15</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Current term performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { grade: "A", count: 234, color: "bg-green-500" },
                { grade: "B", count: 456, color: "bg-blue-500" },
                { grade: "C", count: 389, color: "bg-yellow-500" },
                { grade: "D", count: 123, color: "bg-orange-500" },
                { grade: "F", count: 45, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.grade} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="font-medium">{item.grade}</span>
                  <div className="flex-1">
                    <Progress value={(item.count / 1247) * 100} className="h-2" />
                  </div>
                  <span className="text-sm text-gray-500">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${event.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
