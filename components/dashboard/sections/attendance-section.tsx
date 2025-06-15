"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react"

export function AttendanceSection() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.7%</div>
            <Progress value={92.7} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">1,156 of 1,247 present</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,156</div>
            <p className="text-xs text-muted-foreground">Students present today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">91</div>
            <p className="text-xs text-muted-foreground">Students absent today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">15</div>
            <p className="text-xs text-muted-foreground">Students arrived late</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Attendance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Class Attendance Overview</CardTitle>
          <CardDescription>Today's attendance by class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { class: "Grade 10A", present: 33, total: 35, percentage: 94.3 },
              { class: "Grade 10B", present: 30, total: 32, percentage: 93.8 },
              { class: "Grade 9A", present: 36, total: 38, percentage: 94.7 },
              { class: "Grade 9B", present: 29, total: 33, percentage: 87.9 },
              { class: "Grade 11A", present: 31, total: 34, percentage: 91.2 },
              { class: "Grade 11B", present: 28, total: 30, percentage: 93.3 },
            ].map((classData) => (
              <Card key={classData.class}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{classData.class}</h3>
                    <Badge variant={classData.percentage >= 90 ? "default" : "destructive"}>
                      {classData.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {classData.present} of {classData.total} present
                  </div>
                  <Progress value={classData.percentage} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
