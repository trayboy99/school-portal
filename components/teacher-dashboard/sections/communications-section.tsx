"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Users, User } from "lucide-react"

export function CommunicationsSection() {
  const messages = [
    {
      id: 1,
      from: "Principal",
      subject: "Staff Meeting Tomorrow",
      preview: "Please attend the staff meeting scheduled for tomorrow at 10 AM...",
      time: "2 hours ago",
      unread: true,
      type: "admin",
    },
    {
      id: 2,
      from: "Parent - Mrs. Johnson",
      subject: "Mike's Performance",
      preview: "I would like to discuss my son Mike's recent performance in Mathematics...",
      time: "1 day ago",
      unread: true,
      type: "parent",
    },
    {
      id: 3,
      from: "HOD Mathematics",
      subject: "Curriculum Update",
      preview: "New curriculum guidelines have been released for the Mathematics department...",
      time: "2 days ago",
      unread: false,
      type: "staff",
    },
  ]

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "admin":
        return <Users className="h-4 w-4 text-blue-600" />
      case "parent":
        return <User className="h-4 w-4 text-green-600" />
      case "staff":
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-gray-600">Communicate with parents, students, and staff</p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Compose Message
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">3</div>
            <p className="text-sm text-gray-600">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">5</div>
            <p className="text-sm text-gray-600">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Staff Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">8</div>
            <p className="text-sm text-gray-600">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>Your latest messages and communications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  message.unread ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getMessageIcon(message.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-medium ${message.unread ? "font-bold" : ""}`}>{message.from}</h3>
                        {message.unread && (
                          <Badge variant="destructive" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <h4 className={`text-sm ${message.unread ? "font-semibold" : ""}`}>{message.subject}</h4>
                      <p className="text-sm text-gray-600 mt-1">{message.preview}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 ml-4">{message.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Button variant="outline">Load More Messages</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
