"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, TrendingUp, Users, BookOpen } from "lucide-react"

export function GradesSection() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600">Manage student grades and academic performance</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Enter Grades
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.42</div>
            <p className="text-xs text-muted-foreground">+0.12 from last term</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Honor Roll</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">18.8% of students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects Graded</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">All subjects current</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Awaiting entry</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>Current term performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { grade: "A", count: 234, percentage: 18.8, color: "bg-green-500" },
              { grade: "B", count: 456, percentage: 36.6, color: "bg-blue-500" },
              { grade: "C", count: 389, percentage: 31.2, color: "bg-yellow-500" },
              { grade: "D", count: 123, percentage: 9.9, color: "bg-orange-500" },
              { grade: "F", count: 45, percentage: 3.6, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.grade} className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                <span className="text-sm font-medium w-8">Grade {item.grade}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                </div>
                <span className="text-sm text-gray-600 w-16">{item.count} students</span>
                <span className="text-sm text-gray-500 w-12">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
