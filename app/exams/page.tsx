"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, BookOpen, Plus, Search, Filter } from "lucide-react"

export default function ExamsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClass, setFilterClass] = useState("All Classes")
  const [filterSubject, setFilterSubject] = useState("All Subjects")

  const exams = [
    {
      id: 1,
      name: "First Term Mathematics Exam",
      subject: "Mathematics",
      class: "JSS 1",
      date: "2024-03-15",
      time: "09:00 AM",
      duration: "2 hours",
      totalMarks: 100,
      status: "Scheduled",
    },
    {
      id: 2,
      name: "First Term English Exam",
      subject: "English Language",
      class: "JSS 1",
      date: "2024-03-18",
      time: "10:00 AM",
      duration: "2 hours",
      totalMarks: 100,
      status: "Scheduled",
    },
    {
      id: 3,
      name: "First Term Science Exam",
      subject: "Basic Science",
      class: "JSS 2",
      date: "2024-03-20",
      time: "11:00 AM",
      duration: "1.5 hours",
      totalMarks: 80,
      status: "Completed",
    },
  ]

  const classes = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"]
  const subjects = ["Mathematics", "English Language", "Basic Science", "Social Studies", "French"]

  const filteredExams = exams.filter((exam) => {
    return (
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterClass === "All Classes" || exam.class === filterClass) &&
      (filterSubject === "All Subjects" || exam.subject === filterSubject)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Examinations</h1>
          <p className="text-gray-600">Manage and schedule examinations</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule New Exam
        </Button>
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
              <Label htmlFor="search">Search Exams</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by exam name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="class-filter">Filter by Class</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
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
              <Label htmlFor="subject-filter">Filter by Subject</Label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Subjects">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{exam.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <BookOpen className="h-4 w-4" />
                    {exam.subject}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(exam.status)}>{exam.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{exam.class}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{exam.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{exam.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Duration:</span>
                  <span>{exam.duration}</span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Marks: {exam.totalMarks}</span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or schedule a new exam.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
