"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Award, BookOpen, Plus, Search, Filter, Download } from "lucide-react"

export function GradesSection() {
  const [selectedClass, setSelectedClass] = useState("All Classes")
  const [selectedSubject, setSelectedSubject] = useState("All Subjects")
  const [searchTerm, setSearchTerm] = useState("")

  const classes = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"]
  const subjects = ["Mathematics", "English Language", "Basic Science", "Social Studies", "French"]

  const gradesData = [
    {
      id: 1,
      studentName: "John Doe",
      rollNo: "JSS1/001",
      class: "JSS 1",
      subject: "Mathematics",
      ca1: 18,
      ca2: 16,
      exam: 52,
      total: 86,
      grade: "A",
      position: 2,
    },
    {
      id: 2,
      studentName: "Jane Smith",
      rollNo: "JSS1/002",
      class: "JSS 1",
      subject: "Mathematics",
      ca1: 15,
      ca2: 14,
      exam: 45,
      total: 74,
      grade: "B",
      position: 5,
    },
    {
      id: 3,
      studentName: "Mike Johnson",
      rollNo: "JSS1/003",
      class: "JSS 1",
      subject: "English Language",
      ca1: 19,
      ca2: 18,
      exam: 55,
      total: 92,
      grade: "A",
      position: 1,
    },
    {
      id: 4,
      studentName: "Sarah Wilson",
      rollNo: "JSS2/001",
      class: "JSS 2",
      subject: "Basic Science",
      ca1: 16,
      ca2: 15,
      exam: 48,
      total: 79,
      grade: "B",
      position: 3,
    },
  ]

  const filteredGrades = gradesData.filter((grade) => {
    return (
      grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedClass === "All Classes" || grade.class === selectedClass) &&
      (selectedSubject === "All Subjects" || grade.subject === selectedSubject)
    )
  })

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "B":
        return "bg-blue-100 text-blue-800"
      case "C":
        return "bg-yellow-100 text-yellow-800"
      case "D":
        return "bg-orange-100 text-orange-800"
      case "E":
        return "bg-red-100 text-red-800"
      case "F":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const gradeStats = {
    totalStudents: 150,
    averageScore: 78.5,
    topPerformer: "Mike Johnson",
    improvementRate: 12.3,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grades & Results</h2>
          <p className="text-gray-600">Manage student grades and academic performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Grade
          </Button>
        </div>
      </div>

      {/* Grade Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradeStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Students graded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{gradeStats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">Class average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-yellow-600">{gradeStats.topPerformer}</div>
            <p className="text-xs text-muted-foreground">Highest scorer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{gradeStats.improvementRate}%</div>
            <p className="text-xs text-muted-foreground">From last term</p>
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
              <Label htmlFor="subject-filter">Filter by Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Student Grades
          </CardTitle>
          <CardDescription>Academic performance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Student</th>
                  <th className="text-left p-4 font-medium">Roll No.</th>
                  <th className="text-left p-4 font-medium">Class</th>
                  <th className="text-left p-4 font-medium">Subject</th>
                  <th className="text-center p-4 font-medium">CA1 (20)</th>
                  <th className="text-center p-4 font-medium">CA2 (20)</th>
                  <th className="text-center p-4 font-medium">Exam (60)</th>
                  <th className="text-center p-4 font-medium">Total (100)</th>
                  <th className="text-center p-4 font-medium">Grade</th>
                  <th className="text-center p-4 font-medium">Position</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{grade.studentName}</td>
                    <td className="p-4 text-gray-600">{grade.rollNo}</td>
                    <td className="p-4 text-gray-600">{grade.class}</td>
                    <td className="p-4 text-gray-600">{grade.subject}</td>
                    <td className="p-4 text-center font-bold">{grade.ca1}</td>
                    <td className="p-4 text-center font-bold">{grade.ca2}</td>
                    <td className="p-4 text-center font-bold">{grade.exam}</td>
                    <td className="p-4 text-center font-bold text-lg">{grade.total}</td>
                    <td className="p-4 text-center">
                      <Badge className={getGradeColor(grade.grade)}>{grade.grade}</Badge>
                    </td>
                    <td className="p-4 text-center font-bold">{grade.position}</td>
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

          {filteredGrades.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No grades found</p>
              <p className="text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
