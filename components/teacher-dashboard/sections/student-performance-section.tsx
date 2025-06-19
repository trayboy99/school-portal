"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useState } from "react"

export function StudentPerformanceSection() {
  const [selectedClass, setSelectedClass] = useState("")

  const performanceData = [
    {
      student: "John Doe",
      regNumber: "WC001",
      mathematics: { current: 85, previous: 78, trend: "up" },
      physics: { current: 72, previous: 75, trend: "down" },
      overall: 78.5,
    },
    {
      student: "Jane Smith",
      regNumber: "WC002",
      mathematics: { current: 92, previous: 89, trend: "up" },
      physics: { current: 88, previous: 88, trend: "same" },
      overall: 90,
    },
    {
      student: "Mike Johnson",
      regNumber: "WC003",
      mathematics: { current: 76, previous: 82, trend: "down" },
      physics: { current: 79, previous: 74, trend: "up" },
      overall: 77.5,
    },
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Performance</h1>
        <p className="text-gray-600">Track and analyze student academic performance</p>
      </div>

      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
          <CardDescription>Choose a class to view student performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jss1a">JSS 1A</SelectItem>
              <SelectItem value="jss2b">JSS 2B</SelectItem>
              <SelectItem value="jss3a">JSS 3A</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      {selectedClass && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Class Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">82.0%</div>
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+3.2% from last term</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">Jane Smith</div>
                <div className="text-2xl font-bold text-green-600">90.0%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Needs Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">Mike Johnson</div>
                <div className="text-2xl font-bold text-orange-600">77.5%</div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Performance</CardTitle>
              <CardDescription>Detailed performance breakdown by student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((student, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{student.student}</h3>
                        <p className="text-sm text-gray-500">{student.regNumber}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">Overall: {student.overall}%</div>
                        <Badge
                          variant={
                            student.overall >= 80 ? "default" : student.overall >= 70 ? "secondary" : "destructive"
                          }
                        >
                          {student.overall >= 80 ? "Excellent" : student.overall >= 70 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">Mathematics</span>
                        <div className="flex items-center space-x-2">
                          <span className={getTrendColor(student.mathematics.trend)}>
                            {student.mathematics.current}%
                          </span>
                          {getTrendIcon(student.mathematics.trend)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">Physics</span>
                        <div className="flex items-center space-x-2">
                          <span className={getTrendColor(student.physics.trend)}>{student.physics.current}%</span>
                          {getTrendIcon(student.physics.trend)}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-3">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
