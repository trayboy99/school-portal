"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, User } from "lucide-react"

interface ScheduleItem {
  id: string
  subject: string
  teacher: string
  time: string
  room: string
  day: string
  type: "class" | "exam" | "assignment"
}

interface ScheduleSectionProps {
  studentId: string
}

export function ScheduleSection({ studentId }: ScheduleSectionProps) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // Mock data for now
        const mockSchedule: ScheduleItem[] = [
          {
            id: "1",
            subject: "Mathematics",
            teacher: "Mr. Johnson",
            time: "08:00 - 09:30",
            room: "Room 101",
            day: "Monday",
            type: "class",
          },
          {
            id: "2",
            subject: "English",
            teacher: "Mrs. Smith",
            time: "09:45 - 11:15",
            room: "Room 205",
            day: "Monday",
            type: "class",
          },
          {
            id: "3",
            subject: "Physics",
            teacher: "Dr. Brown",
            time: "11:30 - 13:00",
            room: "Lab 1",
            day: "Monday",
            type: "class",
          },
          {
            id: "4",
            subject: "Chemistry",
            teacher: "Ms. Davis",
            time: "14:00 - 15:30",
            room: "Lab 2",
            day: "Monday",
            type: "class",
          },
        ]
        setSchedule(mockSchedule)
      } catch (error) {
        console.error("Error fetching schedule:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [studentId])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-blue-100 text-blue-800"
      case "exam":
        return "bg-red-100 text-red-800"
      case "assignment":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[new Date().getDay()]
  }

  const todaySchedule = schedule.filter((item) => item.day === getCurrentDay())

  if (loading) {
    return <div className="text-center py-8">Loading schedule...</div>
  }

  return (
    <div className="space-y-6">
      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>{getCurrentDay()}'s classes and activities</CardDescription>
        </CardHeader>
        <CardContent>
          {todaySchedule.length > 0 ? (
            <div className="space-y-4">
              {todaySchedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <h3 className="font-semibold">{item.subject}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{item.teacher}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{item.room}</span>
                    </div>
                    <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No classes scheduled for today</div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Your complete weekly timetable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
              const daySchedule = schedule.filter((item) => item.day === day)
              return (
                <div key={day} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">{day}</h3>
                  {daySchedule.length > 0 ? (
                    <div className="space-y-2">
                      {daySchedule.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.subject}</span>
                          <span className="text-gray-600">{item.time}</span>
                          <span className="text-gray-600">{item.room}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No classes scheduled</p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
