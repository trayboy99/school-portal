"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, TrendingUp, Download, Search, Filter } from "lucide-react"

export function AttendanceSection() {
  const [selectedClass, setSelectedClass] = useState("All Classes")
  const [selectedDate, setSelectedDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const classes = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"]

  const attendanceData = [
    {
      id: 1,
      studentName: "John Doe",
      rollNo: "JSS1/001",
      class: "JSS 1",
      status: "Present",
      date: "2024-01-15",
      timeIn: "8:00 AM",
    },
    {
      id: 2,
      studentName: "Jane Smith",
      rollNo: "JSS1/002",
      class: "JSS 1",
      status: "Absent",
      date: "2024-01-15",
      timeIn: "-",
    },
    {
      id: 3,
      studentName: "Mike Johnson",
      rollNo: "JSS1/003",
      class: "JSS 1",
      status: "Late",
      date: "2024-01-15",
      timeIn: "8:30 AM",
    },
    {
      id: 4,
      studentName: "Sarah Wilson",
      rollNo: "JSS2/001",
      class: "JSS 2",
      status: "Present",
      date: "2024-01-15",
      timeIn: "7:55 AM",
    },
    {
      id: 5,
      studentName: "David Brown",
      rollNo: "JSS2/002",
      class: "JSS 2",
      status: "Present",
      date: "2024-01-15",
      timeIn: "8:05 AM",
    },
  ]

  const filteredAttendance = attendanceData.filter((record) => {
    return (
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedClass === "All Classes" || record.class === selectedClass)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800"
      case "Absent":
        return "bg-red-100 text-red-800"
      case "Late":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const attendanceStats = {
    totalStudents: 150,
    presentToday: 142,
    absentToday: 8,
    lateToday: 5,
    attendanceRate: 94.7,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>Mark Attendance</Button>
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{attendanceStats.presentToday}</div>
            <p className="text-xs text-muted-foreground">Students present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{attendanceStats.absentToday}</div>
            <p className="text-xs text-muted-foreground">Students absent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Students</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="class-filter">Filter by Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Classes">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-filter">Select Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Records
          </CardTitle>
          <CardDescription>Today's attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Student Name</th>
                  <th className="text-left p-4 font-medium">Roll Number</th>
                  <th className="text-left p-4 font-medium">Class</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Time In</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{record.studentName}</td>
                    <td className="p-4 text-gray-600">{record.rollNo}</td>
                    <td className="p-4 text-gray-600">{record.class}</td>
                    <td className="p-4">
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    </td>
                    <td className="p-4 text-gray-600">{record.timeIn}</td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAttendance.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No attendance records found</p>
              <p className="text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
