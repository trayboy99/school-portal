"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "lucide-react"

export function AttendanceSection() {
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const students = [
    { id: 1, name: "John Doe", regNumber: "WC001", present: false },
    { id: 2, name: "Jane Smith", regNumber: "WC002", present: true },
    { id: 3, name: "Mike Johnson", regNumber: "WC003", present: true },
    { id: 4, name: "Sarah Wilson", regNumber: "WC004", present: false },
    { id: 5, name: "David Brown", regNumber: "WC005", present: true },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-gray-600">Take and manage student attendance</p>
      </div>

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Take Attendance</span>
          </CardTitle>
          <CardDescription>Select class and date to take attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jss1a">JSS 1A</SelectItem>
                  <SelectItem value="jss2b">JSS 2B</SelectItem>
                  <SelectItem value="jss3a">JSS 3A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance</CardTitle>
            <CardDescription>
              {selectedClass.toUpperCase()} - {new Date(selectedDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reg Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.regNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={student.present}
                        onCheckedChange={(checked) => {
                          // Handle attendance change
                          console.log(`${student.name} attendance: ${checked}`)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.present ? "default" : "destructive"}>
                        {student.present ? "Present" : "Absent"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Present: {students.filter((s) => s.present).length} / {students.length} students
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">Save Draft</Button>
                <Button>Submit Attendance</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
