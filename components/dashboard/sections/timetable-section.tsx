"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Plus, Download } from "lucide-react"

export function TimetableSection() {
  const [selectedDay, setSelectedDay] = useState("Monday")

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  const timetable = {
    Monday: [
      { time: "8:00 - 8:45", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101" },
      { time: "8:45 - 9:30", subject: "English", teacher: "Mrs. Smith", room: "Room 102" },
      { time: "9:30 - 10:15", subject: "Science", teacher: "Dr. Brown", room: "Lab 1" },
      { time: "10:15 - 10:30", subject: "Break", teacher: "", room: "" },
      { time: "10:30 - 11:15", subject: "History", teacher: "Mr. Davis", room: "Room 103" },
      { time: "11:15 - 12:00", subject: "Geography", teacher: "Mrs. Wilson", room: "Room 104" },
    ],
    Tuesday: [
      { time: "8:00 - 8:45", subject: "Science", teacher: "Dr. Brown", room: "Lab 1" },
      { time: "8:45 - 9:30", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101" },
      { time: "9:30 - 10:15", subject: "French", teacher: "Mme. Dubois", room: "Room 105" },
      { time: "10:15 - 10:30", subject: "Break", teacher: "", room: "" },
      { time: "10:30 - 11:15", subject: "English", teacher: "Mrs. Smith", room: "Room 102" },
      { time: "11:15 - 12:00", subject: "Art", teacher: "Ms. Garcia", room: "Art Studio" },
    ],
    Wednesday: [
      { time: "8:00 - 8:45", subject: "Physical Education", teacher: "Coach Miller", room: "Gymnasium" },
      { time: "8:45 - 9:30", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101" },
      { time: "9:30 - 10:15", subject: "English", teacher: "Mrs. Smith", room: "Room 102" },
      { time: "10:15 - 10:30", subject: "Break", teacher: "", room: "" },
      { time: "10:30 - 11:15", subject: "Science", teacher: "Dr. Brown", room: "Lab 1" },
      { time: "11:15 - 12:00", subject: "Music", teacher: "Mr. Anderson", room: "Music Room" },
    ],
    Thursday: [
      { time: "8:00 - 8:45", subject: "History", teacher: "Mr. Davis", room: "Room 103" },
      { time: "8:45 - 9:30", subject: "Geography", teacher: "Mrs. Wilson", room: "Room 104" },
      { time: "9:30 - 10:15", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101" },
      { time: "10:15 - 10:30", subject: "Break", teacher: "", room: "" },
      { time: "10:30 - 11:15", subject: "English", teacher: "Mrs. Smith", room: "Room 102" },
      { time: "11:15 - 12:00", subject: "Computer Science", teacher: "Mr. Tech", room: "Computer Lab" },
    ],
    Friday: [
      { time: "8:00 - 8:45", subject: "Science", teacher: "Dr. Brown", room: "Lab 1" },
      { time: "8:45 - 9:30", subject: "French", teacher: "Mme. Dubois", room: "Room 105" },
      { time: "9:30 - 10:15", subject: "Mathematics", teacher: "Mr. Johnson", room: "Room 101" },
      { time: "10:15 - 10:30", subject: "Break", teacher: "", room: "" },
      { time: "10:30 - 11:15", subject: "English", teacher: "Mrs. Smith", room: "Room 102" },
      { time: "11:15 - 12:00", subject: "Assembly", teacher: "All Staff", room: "Main Hall" },
    ],
  }

  const getSubjectColor = (subject: string) => {
    const colors = {
      Mathematics: "bg-blue-100 text-blue-800",
      English: "bg-green-100 text-green-800",
      Science: "bg-purple-100 text-purple-800",
      History: "bg-yellow-100 text-yellow-800",
      Geography: "bg-orange-100 text-orange-800",
      French: "bg-pink-100 text-pink-800",
      Art: "bg-red-100 text-red-800",
      Music: "bg-indigo-100 text-indigo-800",
      "Physical Education": "bg-teal-100 text-teal-800",
      "Computer Science": "bg-gray-100 text-gray-800",
      Assembly: "bg-slate-100 text-slate-800",
      Break: "bg-amber-100 text-amber-800",
    }
    return colors[subject as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Timetable</h2>
          <p className="text-gray-600">Weekly schedule for all classes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Period
          </Button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {days.map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            onClick={() => setSelectedDay(day)}
            className="whitespace-nowrap"
          >
            {day}
          </Button>
        ))}
      </div>

      {/* Timetable for Selected Day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {selectedDay} Schedule
          </CardTitle>
          <CardDescription>Class schedule for {selectedDay}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timetable[selectedDay as keyof typeof timetable].map((period, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  period.subject === "Break" ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"
                } hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {period.time}
                    </div>
                    <Badge className={getSubjectColor(period.subject)}>{period.subject}</Badge>
                  </div>
                  {period.subject !== "Break" && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {period.teacher}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {period.room}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
          <CardDescription>Summary of subjects across the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-blue-600">Mathematics</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">6</div>
              <div className="text-sm text-green-600">English</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-purple-600">Science</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-sm text-orange-600">Other Subjects</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
