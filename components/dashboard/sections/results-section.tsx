"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, FileText, Download, PrinterIcon as Print, User, Calendar, BookOpen, Award } from "lucide-react"

// Dummy student data
const dummyStudents = [
  {
    id: 1,
    name: "Sarah Johnson",
    admissionNumber: "WCL/2023/001",
    class: "Grade 10A",
    section: "A",
    position: 1,
    totalScore: 892,
    percentage: 89.2,
    grade: "A",
    subjects: [
      { name: "Mathematics", ca1: 18, ca2: 17, exam: 68, total: 103, grade: "A", remark: "Excellent" },
      { name: "English Language", ca1: 16, ca2: 18, exam: 65, total: 99, grade: "A", remark: "Very Good" },
      { name: "Physics", ca1: 17, ca2: 16, exam: 62, total: 95, grade: "A", remark: "Very Good" },
      { name: "Chemistry", ca1: 15, ca2: 17, exam: 60, total: 92, grade: "A", remark: "Very Good" },
      { name: "Biology", ca1: 16, ca2: 15, exam: 58, total: 89, grade: "B", remark: "Good" },
      { name: "Geography", ca1: 14, ca2: 16, exam: 55, total: 85, grade: "B", remark: "Good" },
      { name: "History", ca1: 15, ca2: 14, exam: 52, total: 81, grade: "B", remark: "Good" },
      { name: "Civic Education", ca1: 13, ca2: 15, exam: 50, total: 78, grade: "B", remark: "Good" },
      { name: "Computer Science", ca1: 17, ca2: 18, exam: 55, total: 90, grade: "A", remark: "Very Good" },
    ],
    attendance: { present: 185, absent: 5, total: 190 },
    teacherRemark:
      "Sarah is an exceptional student who consistently demonstrates academic excellence and leadership qualities.",
    principalRemark: "Keep up the excellent work. Sarah is a role model for other students.",
  },
  {
    id: 2,
    name: "Michael Chen",
    admissionNumber: "WCL/2023/002",
    class: "Grade 10A",
    section: "A",
    position: 2,
    totalScore: 845,
    percentage: 84.5,
    grade: "A",
    subjects: [
      { name: "Mathematics", ca1: 17, ca2: 16, exam: 65, total: 98, grade: "A", remark: "Very Good" },
      { name: "English Language", ca1: 15, ca2: 17, exam: 62, total: 94, grade: "A", remark: "Very Good" },
      { name: "Physics", ca1: 16, ca2: 15, exam: 60, total: 91, grade: "A", remark: "Very Good" },
      { name: "Chemistry", ca1: 14, ca2: 16, exam: 58, total: 88, grade: "B", remark: "Good" },
      { name: "Biology", ca1: 15, ca2: 14, exam: 56, total: 85, grade: "B", remark: "Good" },
      { name: "Geography", ca1: 13, ca2: 15, exam: 54, total: 82, grade: "B", remark: "Good" },
      { name: "History", ca1: 14, ca2: 13, exam: 51, total: 78, grade: "B", remark: "Good" },
      { name: "Civic Education", ca1: 12, ca2: 14, exam: 49, total: 75, grade: "B", remark: "Good" },
      { name: "Computer Science", ca1: 16, ca2: 17, exam: 54, total: 87, grade: "B", remark: "Good" },
    ],
    attendance: { present: 182, absent: 8, total: 190 },
    teacherRemark: "Michael shows great potential and consistent improvement in all subjects.",
    principalRemark: "Well done! Continue to strive for excellence in your academic pursuits.",
  },
  {
    id: 3,
    name: "Aisha Okafor",
    admissionNumber: "WCL/2023/003",
    class: "Grade 10B",
    section: "B",
    position: 1,
    totalScore: 876,
    percentage: 87.6,
    grade: "A",
    subjects: [
      { name: "Mathematics", ca1: 18, ca2: 17, exam: 66, total: 101, grade: "A", remark: "Excellent" },
      { name: "English Language", ca1: 17, ca2: 18, exam: 64, total: 99, grade: "A", remark: "Very Good" },
      { name: "Physics", ca1: 16, ca2: 17, exam: 61, total: 94, grade: "A", remark: "Very Good" },
      { name: "Chemistry", ca1: 15, ca2: 16, exam: 59, total: 90, grade: "A", remark: "Very Good" },
      { name: "Biology", ca1: 17, ca2: 15, exam: 57, total: 89, grade: "B", remark: "Good" },
      { name: "Geography", ca1: 14, ca2: 16, exam: 56, total: 86, grade: "B", remark: "Good" },
      { name: "History", ca1: 15, ca2: 14, exam: 53, total: 82, grade: "B", remark: "Good" },
      { name: "Civic Education", ca1: 13, ca2: 15, exam: 51, total: 79, grade: "B", remark: "Good" },
      { name: "Computer Science", ca1: 16, ca2: 18, exam: 56, total: 90, grade: "A", remark: "Very Good" },
    ],
    attendance: { present: 188, absent: 2, total: 190 },
    teacherRemark: "Aisha is a dedicated student with excellent attendance and academic performance.",
    principalRemark: "Outstanding performance! Aisha is a credit to the school.",
  },
]

const ReportCard = ({ student }: { student: (typeof dummyStudents)[0] }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 print:p-6">
      {/* School Header */}
      <div className="text-center border-b-2 border-blue-600 pb-6 mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-600">WESTMINSTER COLLEGE</h1>
            <p className="text-lg text-gray-600">Lagos, Nigeria</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">Excellence in Education • Character • Leadership</p>
        <h2 className="text-xl font-semibold mt-4 text-gray-800">STUDENT REPORT CARD</h2>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Student Name:</span>
            <span>{student.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Admission Number:</span>
            <span>{student.admissionNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Class:</span>
            <span>{student.class}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Session:</span>
            <span>2023/2024</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Term:</span>
            <span>First Term</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Position:</span>
            <span>
              {student.position}
              {student.position === 1 ? "st" : student.position === 2 ? "nd" : student.position === 3 ? "rd" : "th"}
            </span>
          </div>
        </div>
      </div>

      {/* Academic Performance */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-300 pb-2">ACADEMIC PERFORMANCE</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-gray-300 p-2 text-left">Subject</th>
                <th className="border border-gray-300 p-2 text-center">CA1 (20)</th>
                <th className="border border-gray-300 p-2 text-center">CA2 (20)</th>
                <th className="border border-gray-300 p-2 text-center">Exam (60)</th>
                <th className="border border-gray-300 p-2 text-center">Total (100)</th>
                <th className="border border-gray-300 p-2 text-center">Grade</th>
                <th className="border border-gray-300 p-2 text-center">Remark</th>
              </tr>
            </thead>
            <tbody>
              {student.subjects.map((subject, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="border border-gray-300 p-2 font-medium">{subject.name}</td>
                  <td className="border border-gray-300 p-2 text-center">{subject.ca1}</td>
                  <td className="border border-gray-300 p-2 text-center">{subject.ca2}</td>
                  <td className="border border-gray-300 p-2 text-center">{subject.exam}</td>
                  <td className="border border-gray-300 p-2 text-center font-semibold">{subject.total}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <Badge
                      variant={subject.grade === "A" ? "default" : subject.grade === "B" ? "secondary" : "outline"}
                    >
                      {subject.grade}
                    </Badge>
                  </td>
                  <td className="border border-gray-300 p-2 text-center">{subject.remark}</td>
                </tr>
              ))}
              <tr className="bg-blue-100 font-semibold">
                <td className="border border-gray-300 p-2">TOTAL</td>
                <td className="border border-gray-300 p-2 text-center">-</td>
                <td className="border border-gray-300 p-2 text-center">-</td>
                <td className="border border-gray-300 p-2 text-center">-</td>
                <td className="border border-gray-300 p-2 text-center">{student.totalScore}</td>
                <td className="border border-gray-300 p-2 text-center">
                  <Badge variant="default">{student.grade}</Badge>
                </td>
                <td className="border border-gray-300 p-2 text-center">{student.percentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance and Grading Scale */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">ATTENDANCE RECORD</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total School Days:</span>
                <span className="font-semibold">{student.attendance.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Days Present:</span>
                <span className="font-semibold text-green-600">{student.attendance.present}</span>
              </div>
              <div className="flex justify-between">
                <span>Days Absent:</span>
                <span className="font-semibold text-red-600">{student.attendance.absent}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Attendance Rate:</span>
                <span className="font-semibold">
                  {((student.attendance.present / student.attendance.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">GRADING SCALE</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>A (Excellent):</span>
                <span>80-100</span>
              </div>
              <div className="flex justify-between">
                <span>B (Very Good):</span>
                <span>70-79</span>
              </div>
              <div className="flex justify-between">
                <span>C (Good):</span>
                <span>60-69</span>
              </div>
              <div className="flex justify-between">
                <span>D (Fair):</span>
                <span>50-59</span>
              </div>
              <div className="flex justify-between">
                <span>E (Poor):</span>
                <span>40-49</span>
              </div>
              <div className="flex justify-between">
                <span>F (Fail):</span>
                <span>0-39</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">REMARKS</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Class Teacher's Remark:</h4>
            <p className="text-gray-700">{student.teacherRemark}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Principal's Remark:</h4>
            <p className="text-gray-700">{student.principalRemark}</p>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-300">
        <div className="text-center">
          <div className="border-b border-gray-400 mb-2 h-12"></div>
          <p className="text-sm font-semibold">Class Teacher</p>
          <p className="text-xs text-gray-500">Signature & Date</p>
        </div>
        <div className="text-center">
          <div className="border-b border-gray-400 mb-2 h-12"></div>
          <p className="text-sm font-semibold">Parent/Guardian</p>
          <p className="text-xs text-gray-500">Signature & Date</p>
        </div>
        <div className="text-center">
          <div className="border-b border-gray-400 mb-2 h-12"></div>
          <p className="text-sm font-semibold">Principal</p>
          <p className="text-xs text-gray-500">Signature & Date</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">This report card is computer generated and valid without signature</p>
        <p className="text-xs text-gray-500 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
}

export const ResultsSection = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedTerm, setSelectedTerm] = useState("first")
  const [selectedStudent, setSelectedStudent] = useState<(typeof dummyStudents)[0] | null>(null)

  const filteredStudents = dummyStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === "all" || student.class.includes(selectedClass)
    return matchesSearch && matchesClass
  })

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert("PDF download functionality would be implemented here")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results Management</h1>
          <p className="text-gray-600">Generate and manage student report cards</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Student</label>
              <Input
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="Grade 10A">Grade 10A</SelectItem>
                  <SelectItem value="Grade 10B">Grade 10B</SelectItem>
                  <SelectItem value="Grade 11A">Grade 11A</SelectItem>
                  <SelectItem value="Grade 11B">Grade 11B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Term</SelectItem>
                  <SelectItem value="second">Second Term</SelectItem>
                  <SelectItem value="third">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-gray-600">
                      {student.admissionNumber} • {student.class}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">Position: {student.position}</Badge>
                      <Badge variant={student.grade === "A" ? "default" : "secondary"}>Grade: {student.grade}</Badge>
                      <span className="text-sm text-gray-500">{student.percentage}%</span>
                    </div>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedStudent(student)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        <span>Report Card - {student.name}</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Print className="w-4 h-4 mr-2" />
                            Print
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                    {selectedStudent && <ReportCard student={selectedStudent} />}
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
