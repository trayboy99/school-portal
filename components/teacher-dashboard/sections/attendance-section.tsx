"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Student {
  id: number
  first_name: string
  middle_name?: string
  surname: string
  reg_number: string
  class: string
  status: "Present" | "Absent" | "Late" | "Excused"
  remarks?: string
}

interface AttendanceStats {
  total: number
  present: number
  absent: number
  late: number
  excused: number
  percentage: number
}

export function AttendanceSection() {
  const { teacher } = useTeacherAuth()
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    percentage: 0,
  })

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!teacher) return

      try {
        console.log("=== FETCHING TEACHER CLASSES FOR ATTENDANCE ===")
        console.log("Teacher:", teacher)

        // Get classes where teacher is assigned
        const { data: classesData, error } = await supabase
          .from("classes")
          .select("name")
          .eq("teacher_id", teacher.id)
          .eq("status", "Active")

        if (error) throw error

        const classNames = classesData?.map((c) => c.name) || []
        console.log("Teacher's classes:", classNames)
        setClasses(classNames)

        // Auto-select first class if available
        if (classNames.length > 0 && !selectedClass) {
          setSelectedClass(classNames[0])
        }
      } catch (error) {
        console.error("Error fetching classes:", error)
        toast({
          title: "Error",
          description: "Failed to load classes",
          variant: "destructive",
        })
      }
    }

    fetchClasses()
  }, [teacher])

  // Fetch students and attendance when class or date changes
  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedClass || !selectedDate || !teacher) return

      setLoading(true)
      try {
        console.log("=== FETCHING STUDENTS AND ATTENDANCE ===")
        console.log("Class:", selectedClass, "Date:", selectedDate)

        // Fetch students in the selected class
        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("id, first_name, middle_name, surname, reg_number, class")
          .eq("class", selectedClass)
          .eq("status", "Active")
          .order("first_name")

        if (studentsError) throw studentsError

        console.log("Students found:", studentsData?.length || 0)

        // Fetch existing attendance for the selected date
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("student_id, status, remarks")
          .eq("class_name", selectedClass)
          .eq("date", selectedDate)

        if (attendanceError) throw attendanceError

        console.log("Existing attendance records:", attendanceData?.length || 0)

        // Merge students with attendance data
        const studentsWithAttendance: Student[] = (studentsData || []).map((student) => {
          const attendance = attendanceData?.find((a) => a.student_id === student.id)
          return {
            ...student,
            status: attendance?.status || "Present",
            remarks: attendance?.remarks || "",
          }
        })

        setStudents(studentsWithAttendance)
        calculateStats(studentsWithAttendance)
      } catch (error) {
        console.error("Error fetching students and attendance:", error)
        toast({
          title: "Error",
          description: "Failed to load students and attendance data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStudentsAndAttendance()
  }, [selectedClass, selectedDate, teacher])

  const calculateStats = (studentList: Student[]) => {
    const total = studentList.length
    const present = studentList.filter((s) => s.status === "Present").length
    const absent = studentList.filter((s) => s.status === "Absent").length
    const late = studentList.filter((s) => s.status === "Late").length
    const excused = studentList.filter((s) => s.status === "Excused").length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    setStats({ total, present, absent, late, excused, percentage })
  }

  const updateStudentStatus = (studentId: number, status: "Present" | "Absent" | "Late" | "Excused") => {
    const updatedStudents = students.map((student) => (student.id === studentId ? { ...student, status } : student))
    setStudents(updatedStudents)
    calculateStats(updatedStudents)
  }

  const updateStudentRemarks = (studentId: number, remarks: string) => {
    const updatedStudents = students.map((student) => (student.id === studentId ? { ...student, remarks } : student))
    setStudents(updatedStudents)
  }

  const saveAttendance = async () => {
    if (!teacher || !selectedClass || !selectedDate) return

    setSaving(true)
    try {
      console.log("=== SAVING ATTENDANCE ===")
      console.log("Class:", selectedClass, "Date:", selectedDate, "Students:", students.length)

      // Prepare attendance records
      const attendanceRecords = students.map((student) => ({
        student_id: student.id,
        class_name: selectedClass,
        date: selectedDate,
        status: student.status,
        teacher_id: teacher.id,
        remarks: student.remarks || null,
      }))

      // Delete existing attendance for this date and class
      const { error: deleteError } = await supabase
        .from("attendance")
        .delete()
        .eq("class_name", selectedClass)
        .eq("date", selectedDate)

      if (deleteError) throw deleteError

      // Insert new attendance records
      const { error: insertError } = await supabase.from("attendance").insert(attendanceRecords)

      if (insertError) throw insertError

      console.log("Attendance saved successfully!")
      toast({
        title: "Success",
        description: `Attendance saved for ${selectedClass} on ${new Date(selectedDate).toLocaleDateString()}`,
      })
    } catch (error) {
      console.error("Error saving attendance:", error)
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "Late":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Excused":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Present":
        return "default"
      case "Absent":
        return "destructive"
      case "Late":
        return "secondary"
      case "Excused":
        return "outline"
      default:
        return "default"
    }
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to access attendance management.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance Management</h1>
        <p className="text-gray-600">Take and manage student attendance for your classes</p>
      </div>

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Take Attendance</span>
          </CardTitle>
          <CardDescription>Select class and date to manage attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Statistics */}
      {selectedClass && students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-medium">Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.percentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance</CardTitle>
            <CardDescription>
              {selectedClass} - {new Date(selectedDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">No students found for this class.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reg Number</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quick Actions</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.reg_number}</TableCell>
                        <TableCell>
                          {`${student.first_name} ${student.middle_name ? student.middle_name + " " : ""}${student.surname}`}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(student.status)}
                            className="flex items-center space-x-1 w-fit"
                          >
                            {getStatusIcon(student.status)}
                            <span>{student.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant={student.status === "Present" ? "default" : "outline"}
                              onClick={() => updateStudentStatus(student.id, "Present")}
                            >
                              P
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === "Absent" ? "destructive" : "outline"}
                              onClick={() => updateStudentStatus(student.id, "Absent")}
                            >
                              A
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === "Late" ? "secondary" : "outline"}
                              onClick={() => updateStudentStatus(student.id, "Late")}
                            >
                              L
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === "Excused" ? "outline" : "outline"}
                              onClick={() => updateStudentStatus(student.id, "Excused")}
                            >
                              E
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <input
                            type="text"
                            placeholder="Add remarks..."
                            value={student.remarks || ""}
                            onChange={(e) => updateStudentRemarks(student.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-600">
                    Attendance Rate: {stats.percentage}% ({stats.present}/{stats.total} students present)
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => window.location.reload()} disabled={saving}>
                      Refresh
                    </Button>
                    <Button onClick={saveAttendance} disabled={saving}>
                      {saving ? "Saving..." : "Save Attendance"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
