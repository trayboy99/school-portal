"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Clock, CheckCircle } from "lucide-react"

export function AssignmentsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Manage homework and assignments</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Awaiting submission</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">133</div>
            <p className="text-xs text-muted-foreground">Graded assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Class average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
          <CardDescription>Latest homework and projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "Mathematics Problem Set 5", subject: "Mathematics", dueDate: "Dec 15", status: "Active" },
              { title: "English Essay - Shakespeare", subject: "English", dueDate: "Dec 18", status: "Active" },
              { title: "Science Lab Report", subject: "Physics", dueDate: "Dec 20", status: "Pending" },
            ].map((assignment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{assignment.title}</h3>
                  <p className="text-sm text-gray-600">
                    {assignment.subject} • Due: {assignment.dueDate}
                  </p>
                </div>
                <Badge variant={assignment.status === "Active" ? "default" : "secondary"}>{assignment.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
