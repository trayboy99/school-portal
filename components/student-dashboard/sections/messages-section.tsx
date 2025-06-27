"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, Mail, MailOpen, Reply, Trash2, RefreshCw, Clock, AlertCircle, User, Send, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Message {
  id: number
  sender_id: number
  sender_name: string
  sender_type: string
  subject: string
  content: string
  priority: string
  category: string
  created_at: string
  is_read: boolean
  sender_email?: string
}

interface Teacher {
  id: number
  first_name: string
  surname: string
  email: string
  subjects: string
}

export function MessagesSection() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const [isReplyOpen, setIsReplyOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // New message form state
  const [newMessage, setNewMessage] = useState({
    recipient_id: "",
    subject: "",
    content: "",
    priority: "normal",
    category: "general",
  })

  // Reply form state
  const [replyMessage, setReplyMessage] = useState({
    content: "",
    priority: "normal",
  })

  useEffect(() => {
    fetchMessages()
    fetchTeachers()
  }, [user])

  const fetchMessages = async () => {
    if (!user?.dbId) return

    try {
      setIsLoading(true)
      setError(null)

      // Try to fetch messages from message_recipients table
      const { data: messageData, error: messageError } = await supabase
        .from("message_recipients")
        .select(`
          id,
          message_id,
          is_read,
          messages (
            id,
            sender_id,
            sender_type,
            subject,
            content,
            priority,
            category,
            created_at
          )
        `)
        .eq("recipient_id", user.dbId)
        .eq("recipient_type", "student")
        .order("created_at", { ascending: false })

      if (messageError) {
        console.log("Message recipients query failed:", messageError)
        setMessages([])
        return
      }

      if (messageData && messageData.length > 0) {
        // Get sender information for each message
        const messagesWithSenders = await Promise.all(
          messageData.map(async (item: any) => {
            const message = item.messages
            let senderName = "Unknown Sender"
            let senderEmail = ""

            if (message.sender_type === "teacher") {
              const { data: teacherData } = await supabase
                .from("teachers")
                .select("first_name, surname, email")
                .eq("id", message.sender_id)
                .single()

              if (teacherData) {
                senderName = `${teacherData.first_name} ${teacherData.surname}`
                senderEmail = teacherData.email
              }
            } else if (message.sender_type === "admin") {
              senderName = "School Administration"
              senderEmail = "admin@school.com"
            }

            return {
              id: message.id,
              sender_id: message.sender_id,
              sender_name: senderName,
              sender_type: message.sender_type,
              sender_email: senderEmail,
              subject: message.subject,
              content: message.content,
              priority: message.priority,
              category: message.category,
              created_at: message.created_at,
              is_read: item.is_read,
            }
          }),
        )

        setMessages(messagesWithSenders)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      setError("Failed to load messages")
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("id, first_name, surname, email, subjects")
        .eq("status", "Active")
        .order("first_name")

      if (!teacherError && teacherData) {
        setTeachers(teacherData)
      }
    } catch (error) {
      console.error("Error fetching teachers:", error)
    }
  }

  const markAsRead = async (messageId: number) => {
    if (!user?.dbId) return

    try {
      const { error } = await supabase
        .from("message_recipients")
        .update({ is_read: true })
        .eq("message_id", messageId)
        .eq("recipient_id", user.dbId)
        .eq("recipient_type", "student")

      if (!error) {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg)))
      }
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  const markAsUnread = async (messageId: number) => {
    if (!user?.dbId) return

    try {
      const { error } = await supabase
        .from("message_recipients")
        .update({ is_read: false })
        .eq("message_id", messageId)
        .eq("recipient_id", user.dbId)
        .eq("recipient_type", "student")

      if (!error) {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: false } : msg)))
      }
    } catch (error) {
      console.error("Error marking message as unread:", error)
    }
  }

  const deleteMessage = async (messageId: number) => {
    if (!user?.dbId) return

    try {
      const { error } = await supabase
        .from("message_recipients")
        .delete()
        .eq("message_id", messageId)
        .eq("recipient_id", user.dbId)
        .eq("recipient_type", "student")

      if (!error) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null)
        }
        toast({
          title: "Message deleted",
          description: "The message has been removed from your inbox.",
        })
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const sendNewMessage = async () => {
    if (!user?.dbId || !newMessage.recipient_id || !newMessage.subject || !newMessage.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)

      // Insert message
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: user.dbId,
          sender_type: "student",
          subject: newMessage.subject,
          content: newMessage.content,
          priority: newMessage.priority,
          category: newMessage.category,
        })
        .select()
        .single()

      if (messageError) throw messageError

      // Insert message recipient
      const { error: recipientError } = await supabase.from("message_recipients").insert({
        message_id: messageData.id,
        recipient_id: Number.parseInt(newMessage.recipient_id),
        recipient_type: "teacher",
        is_read: false,
      })

      if (recipientError) throw recipientError

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      })

      setNewMessage({
        recipient_id: "",
        subject: "",
        content: "",
        priority: "normal",
        category: "general",
      })
      setIsNewMessageOpen(false)
      fetchMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const sendReply = async () => {
    if (!user?.dbId || !selectedMessage || !replyMessage.content) {
      toast({
        title: "Error",
        description: "Please enter a reply message.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)

      // Insert reply message
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: user.dbId,
          sender_type: "student",
          subject: `Re: ${selectedMessage.subject}`,
          content: replyMessage.content,
          priority: replyMessage.priority,
          category: selectedMessage.category,
        })
        .select()
        .single()

      if (messageError) throw messageError

      // Insert message recipient (reply to original sender)
      const { error: recipientError } = await supabase.from("message_recipients").insert({
        message_id: messageData.id,
        recipient_id: selectedMessage.sender_id,
        recipient_type: selectedMessage.sender_type,
        is_read: false,
      })

      if (recipientError) throw recipientError

      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully.",
      })

      setReplyMessage({
        content: "",
        priority: "normal",
      })
      setIsReplyOpen(false)
      fetchMessages()
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message)
    if (!message.is_read) {
      markAsRead(message.id)
    }
  }

  const filteredMessages = messages.filter(
    (message) =>
      message.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalMessages = messages.length
  const unreadMessages = messages.filter((m) => !m.is_read).length
  const readMessages = messages.filter((m) => m.is_read).length
  const importantMessages = messages.filter((m) => m.priority === "high" || m.priority === "urgent").length

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">Communicate with your teachers and school administration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchMessages} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
                <DialogDescription>Send a message to your teacher or school administration</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1 border rounded-md p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">To *</Label>
                    <Select
                      value={newMessage.recipient_id}
                      onValueChange={(value) => setNewMessage((prev) => ({ ...prev, recipient_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.first_name} {teacher.surname} ({teacher.subjects})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage((prev) => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter message subject"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newMessage.priority}
                        onValueChange={(value) => setNewMessage((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newMessage.category}
                        onValueChange={(value) => setNewMessage((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="attendance">Attendance</SelectItem>
                          <SelectItem value="discipline">Discipline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Message *</Label>
                    <Textarea
                      id="content"
                      value={newMessage.content}
                      onChange={(e) => setNewMessage((prev) => ({ ...prev, content: e.target.value }))}
                      placeholder="Type your message here..."
                      rows={6}
                    />
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsNewMessageOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={sendNewMessage} disabled={isSending}>
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{totalMessages}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{unreadMessages}</p>
              </div>
              <MailOpen className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-2xl font-bold text-green-600">{readMessages}</p>
              </div>
              <MailOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Important</p>
                <p className="text-2xl font-bold text-red-600">{importantMessages}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inbox</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {error ? (
                <div className="p-4 text-center text-red-600">
                  <p>{error}</p>
                  <Button onClick={fetchMessages} variant="outline" size="sm" className="mt-2 bg-transparent">
                    Try Again
                  </Button>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't received any messages yet. Messages from your teachers and school administration will
                    appear here.
                  </p>
                  <Button onClick={() => setIsNewMessageOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Send Your First Message
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="divide-y">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedMessage?.id === message.id ? "bg-blue-50 border-r-2 border-blue-600" : ""
                        } ${!message.is_read ? "bg-blue-50/30" : ""}`}
                        onClick={() => handleMessageClick(message)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm truncate ${!message.is_read ? "font-semibold" : "font-medium"}`}>
                                {message.sender_name}
                              </p>
                              <p className="text-xs text-gray-500">{formatDate(message.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {!message.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                            <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </Badge>
                          </div>
                        </div>
                        <h4 className={`text-sm mb-1 truncate ${!message.is_read ? "font-semibold" : ""}`}>
                          {message.subject}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          <Card>
            {selectedMessage ? (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{selectedMessage.sender_name}</CardTitle>
                          <CardDescription>{selectedMessage.sender_email}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(selectedMessage.priority)}>
                          {selectedMessage.priority} priority
                        </Badge>
                        <Badge variant="outline">{selectedMessage.category}</Badge>
                        <span className="text-sm text-gray-500">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {formatDate(selectedMessage.created_at)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{selectedMessage.subject}</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() =>
                            selectedMessage.is_read ? markAsUnread(selectedMessage.id) : markAsRead(selectedMessage.id)
                          }
                          variant="outline"
                          size="sm"
                        >
                          {selectedMessage.is_read ? (
                            <>
                              <Mail className="h-4 w-4 mr-2" />
                              Mark as Unread
                            </>
                          ) : (
                            <>
                              <MailOpen className="h-4 w-4 mr-2" />
                              Mark as Read
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => deleteMessage(selectedMessage.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                          <DialogHeader>
                            <DialogTitle>Reply to {selectedMessage.sender_name}</DialogTitle>
                            <DialogDescription>Re: {selectedMessage.subject}</DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="flex-1 border rounded-md p-4">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="reply-priority">Priority</Label>
                                <Select
                                  value={replyMessage.priority}
                                  onValueChange={(value) => setReplyMessage((prev) => ({ ...prev, priority: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="reply-content">Your Reply *</Label>
                                <Textarea
                                  id="reply-content"
                                  value={replyMessage.content}
                                  onChange={(e) => setReplyMessage((prev) => ({ ...prev, content: e.target.value }))}
                                  placeholder="Type your reply here..."
                                  rows={8}
                                />
                              </div>

                              <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm font-medium text-gray-700 mb-2">Original Message:</p>
                                <p className="text-sm text-gray-600 line-clamp-3">{selectedMessage.content}</p>
                              </div>
                            </div>
                          </ScrollArea>
                          <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsReplyOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={sendReply} disabled={isSending}>
                              {isSending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Reply
                                </>
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="p-8 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Message</h3>
                <p className="text-gray-600">Choose a message from your inbox to read its contents</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
