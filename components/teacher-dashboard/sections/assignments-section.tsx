"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Calendar, Users } from "lucide-react"

export function AssignmentsSection() {
  const assignments = [
    {
      id: 1,
      title: "Algebra Practice Problems",
      subject: "Mathematics",
      class: "JSS 2B",
      dueDate: "2024-01-15",
      submissions: 28,
      totalStudents: 32,
      status: "active",
    },
    {
      id: 2,
      title: "Newton's Laws Essay",
      subject: "Physics",
      class: "JSS 3A",
      dueDate: "2024-01-20",
      submissions: 15,
      totalStudents: 28,
      status: "active",
    },
    {
      id: 3,
      title: "Quadratic Equations",
      subject: "Mathematics",
      class: "JSS 1A",
      dueDate: "2024-01-10",
      submissions: 35,
      totalStudents: 35,
      status: "completed",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-gray-600">Create and manage student assignments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  {assignment.title}
                </div>
                <Badge variant={assignment.status === "completed" ? "default" : "secondary"}>{assignment.status}</Badge>
              </CardTitle>
              <CardDescription>
                {assignment.subject} - {assignment.class}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>
                    {assignment.submissions}/{assignment.totalStudents} submitted
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${(assignment.submissions / assignment.totalStudents) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Grade Submissions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
