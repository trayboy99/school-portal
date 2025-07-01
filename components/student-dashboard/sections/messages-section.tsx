"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageSquare, Send, Search, User, Calendar, Mail, Plus } from "lucide-react"
import { useStudentAuth } from "@/contexts/student-auth-context"
import { supabase } from "@/lib/supabase"

interface Message {
  id: number
  subject: string
  content: string
  sender_type: string
  sender_name: string
  recipient_type: string
  recipient_name: string
  sent_at: string
  read_at: string | null
  priority: string
  category: string
}

export default function MessagesSection() {
  const { student } = useStudentAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [composeDialogOpen, setComposeDialogOpen] = useState(false)
  const [newMessage, setNewMessage] = useState({
    subject: "",
    content: "",
    recipient_type: "teacher",
    priority: "normal",
  })

  useEffect(() => {
    if (student) {
      loadMessages()
    }
  }, [student])

  const loadMessages = async () => {
    if (!student) return

    try {
      setLoading(true)

      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .or(`recipient_id.eq.${student.id},sender_id.eq.${student.id}`)
        .order("sent_at", { ascending: false })

      if (error) throw error

      setMessages(messagesData || [])
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message)
    setViewDialogOpen(true)

    // Mark as read if it's unread
    if (!message.read_at) {
      try {
        await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", message.id)

        // Update local state
        setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, read_at: new Date().toISOString() } : m)))
      } catch (error) {
        console.error("Error marking message as read:", error)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!student || !newMessage.subject.trim() || !newMessage.content.trim()) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const { error } = await supabase.from("messages").insert([
        {
          subject: newMessage.subject,
          content: newMessage.content,
          sender_type: "student",
          sender_id: student.id,
          sender_name: `${student.first_name} ${student.surname}`,
          recipient_type: newMessage.recipient_type,
          recipient_id: null, // Will be set by admin
          recipient_name: "School Administration",
          priority: newMessage.priority,
          category: "general",
          sent_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      alert("Message sent successfully!")
      setComposeDialogOpen(false)
      setNewMessage({
        subject: "",
        content: "",
        recipient_type: "teacher",
        priority: "normal",
      })
      loadMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Error sending message. Please try again.")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴"
      case "medium":
        return "🟡"
      case "low":
        return "🟢"
      default:
        return "⚪"
    }
  }

  const filteredMessages = messages.filter(
    (message) =>
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const unreadCount = messages.filter((m) => !m.read_at).length

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your messages.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with teachers and school administration</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">{messages.length} messages</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <Button onClick={() => setComposeDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages by subject, sender, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Message Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Messages</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Unread</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Sent</p>
                <p className="text-2xl font-bold">{messages.filter((m) => m.sender_type === "student").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Received</p>
                <p className="text-2xl font-bold">{messages.filter((m) => m.sender_type !== "student").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <Card
            key={message.id}
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              !message.read_at ? "border-blue-200 bg-blue-50" : ""
            }`}
            onClick={() => handleViewMessage(message)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm">{getPriorityIcon(message.priority)}</span>
                    <h3 className={`font-medium ${!message.read_at ? "font-bold" : ""}`}>{message.subject}</h3>
                    {!message.read_at && (
                      <Badge variant="destructive" className="text-xs">
                        New
                      </Badge>
                    )}
                    <Badge variant={getPriorityColor(message.priority)} className="text-xs">
                      {message.priority}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{message.content}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {message.sender_type === "student" ? "You" : message.sender_name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(message.sent_at).toLocaleDateString()}
                    </span>
                    <span>{message.category}</span>
                  </div>
                </div>

                <div className="ml-4">
                  {message.sender_type !== "student" && (
                    <Badge variant="outline" className="text-xs">
                      From {message.sender_type}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredMessages.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search criteria" : "No messages available. Start a conversation!"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* View Message Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{getPriorityIcon(selectedMessage?.priority || "normal")}</span>
              <span>{selectedMessage?.subject}</span>
            </DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.sender_name} •{" "}
              {selectedMessage && new Date(selectedMessage.sent_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant={getPriorityColor(selectedMessage.priority)}>{selectedMessage.priority} priority</Badge>
                <Badge variant="outline">{selectedMessage.category}</Badge>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>

              <div className="text-sm text-gray-500">
                <p>Sent: {new Date(selectedMessage.sent_at).toLocaleString()}</p>
                {selectedMessage.read_at && <p>Read: {new Date(selectedMessage.read_at).toLocaleString()}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Compose Message Dialog */}
      <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>Send a message to teachers or school administration</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient Type</label>
                <select
                  value={newMessage.recipient_type}
                  onChange={(e) => setNewMessage((prev) => ({ ...prev, recipient_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administration</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                <select
                  value={newMessage.priority}
                  onChange={(e) => setNewMessage((prev) => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
              <Input
                value={newMessage.subject}
                onChange={(e) => setNewMessage((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter message subject"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
              <Textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your message here..."
                rows={6}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setComposeDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={!newMessage.subject.trim() || !newMessage.content.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
