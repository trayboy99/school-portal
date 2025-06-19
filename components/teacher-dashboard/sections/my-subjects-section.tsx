"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, ClipboardList } from "lucide-react"

export function MySubjectsSection() {
  const subjects = [
    {
      id: 1,
      name: "Mathematics",
      classes: ["JSS 1A", "JSS 2B", "JSS 3A"],
      totalStudents: 95,
      assignments: 12,
      avgScore: "82%",
    },
    {
      id: 2,
      name: "Physics",
      classes: ["JSS 3A"],
      totalStudents: 28,
      assignments: 8,
      avgScore: "78%",
    },
    {
      id: 3,
      name: "English Language",
      classes: ["JSS 1A"],
      totalStudents: 35,
      assignments: 15,
      avgScore: "85%",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Subjects</h1>
        <p className="text-gray-600">Subjects you're currently teaching</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  {subject.name}
                </div>
                <Badge variant="secondary">{subject.classes.length} classes</Badge>
              </CardTitle>
              <CardDescription>Classes: {subject.classes.join(", ")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">{subject.totalStudents}</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{subject.assignments}</div>
                  <div className="text-xs text-gray-500">Assignments</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{subject.avgScore}</div>
                  <div className="text-xs text-gray-500">Avg Score</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" className="flex-1">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Enter Marks
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  View Classes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
