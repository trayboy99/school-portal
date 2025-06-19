"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin } from "lucide-react"

export function TimetableSection() {
  const schedule = {
    Monday: [
      { time: "8:00-9:00", subject: "Mathematics", class: "JSS 1A", room: "Room 101" },
      { time: "10:00-11:00", subject: "Physics", class: "JSS 3A", room: "Lab 1" },
      { time: "2:00-3:00", subject: "Mathematics", class: "JSS 2B", room: "Room 102" },
    ],
    Tuesday: [
      { time: "9:00-10:00", subject: "Mathematics", class: "JSS 1A", room: "Room 101" },
      { time: "11:00-12:00", subject: "Physics", class: "JSS 3A", room: "Lab 1" },
    ],
    Wednesday: [
      { time: "8:00-9:00", subject: "Mathematics", class: "JSS 2B", room: "Room 102" },
      { time: "10:00-11:00", subject: "Mathematics", class: "JSS 1A", room: "Room 101" },
      { time: "1:00-2:00", subject: "Physics", class: "JSS 3A", room: "Lab 1" },
    ],
    Thursday: [
      { time: "9:00-10:00", subject: "Mathematics", class: "JSS 1A", room: "Room 101" },
      { time: "2:00-3:00", subject: "Physics", class: "JSS 3A", room: "Lab 1" },
    ],
    Friday: [
      { time: "8:00-9:00", subject: "Mathematics", class: "JSS 2B", room: "Room 102" },
      { time: "10:00-11:00", subject: "Mathematics", class: "JSS 1A", room: "Room 101" },
    ],
  }

  const days = Object.keys(schedule)
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Timetable</h1>
        <p className="text-gray-600">Your weekly teaching schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {days.map((day) => (
          <Card key={day} className={day === today ? "ring-2 ring-green-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {day}
                {day === today && <Badge variant="default">Today</Badge>}
              </CardTitle>
              <CardDescription>{schedule[day as keyof typeof schedule].length} classes scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedule[day as keyof typeof schedule].map((period, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{period.time}</span>
                      </div>
                      <Badge variant="outline">{period.class}</Badge>
                    </div>
                    <div className="text-sm font-medium">{period.subject}</div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{period.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
