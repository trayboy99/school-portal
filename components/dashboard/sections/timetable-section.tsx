"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, Users } from "lucide-react"

export function TimetableSection() {
  const timeSlots = ["8:00-9:00", "9:00-10:00", "10:00-11:00", "11:30-12:30", "12:30-13:30", "13:30-14:30"]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  const timetableData = {
    Monday: {
      "8:00-9:00": { subject: "Mathematics", teacher: "Dr. Johnson", room: "101" },
      "9:00-10:00": { subject: "English", teacher: "Mr. Wilson", room: "102" },
      "10:00-11:00": { subject: "Physics", teacher: "Dr. Johnson", room: "Lab 1" },
      "11:30-12:30": { subject: "Chemistry", teacher: "Mrs. Brown", room: "Lab 2" },
      "12:30-13:30": { subject: "History", teacher: "Mr. Davis", room: "103" },
      "13:30-14:30": { subject: "PE", teacher: "Coach Smith", room: "Gym" },
    },
    // Add more days as needed
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-600">Manage class schedules and time slots</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Periods</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30</div>
            <p className="text-xs text-muted-foreground">Per week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Scheduled classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Periods</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Available slots</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No scheduling conflicts</p>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Grade 10A - Weekly Timetable</CardTitle>
          <CardDescription>Current week schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50 text-left font-medium">Time</th>
                  {days.map((day) => (
                    <th key={day} className="border p-2 bg-gray-50 text-center font-medium min-w-[150px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time}>
                    <td className="border p-2 font-medium bg-gray-50">{time}</td>
                    {days.map((day) => {
                      const classData = timetableData[day]?.[time]
                      return (
                        <td key={`${day}-${time}`} className="border p-2 h-16">
                          {classData ? (
                            <div className="space-y-1">
                              <Badge variant="default" className="text-xs">
                                {classData.subject}
                              </Badge>
                              <div className="text-xs text-gray-600">{classData.teacher}</div>
                              <div className="text-xs text-gray-500">{classData.room}</div>
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 text-xs">Free</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
