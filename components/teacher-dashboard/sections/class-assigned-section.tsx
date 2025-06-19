"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Users, Edit, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"

interface Student {
  id: number
  first_name: string
  middle_name: string
  surname: string
  email: string
  phone: string
  class: string
  parent_name: string
  parent_phone: string
  status: string
}

interface AssignedClass {
  id: number
  name: string
  category: string
  current_students: number
  max_students: number
}

export function ClassAssignedSection() {
  const { teacher } = useTeacherAuth()
  const [assignedClass, setAssignedClass] = useState<AssignedClass | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (teacher) {
      loadAssignedClass()
    }
  }, [teacher])

  const loadAssignedClass = async () => {
    if (!teacher) return

    try {
      setIsLoading(true)

      // Get class where teacher is the class teacher
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", teacher.id)
        .single()

      if (classError) {
        console.log("No class assigned as class teacher")
        setIsLoading(false)
        return
      }

      setAssignedClass(classData)

      // Get students in this class
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("class", classData.name)
        .order("first_name")

      if (studentsError) throw studentsError

      setStudents(studentsData || [])
    } catch (error) {
      console.error("Error loading assigned class:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setIsEditDialogOpen(true)
  }

  const handleSaveStudent = async (studentData: Partial<Student>) => {
    if (!editingStudent) return

    try {
      const { error } = await supabase.from("students").update(studentData).eq("id", editingStudent.id)

      if (error) throw error

      // Reload students
      loadAssignedClass()
      setIsEditDialogOpen(false)
      setEditingStudent(null)
    } catch (error) {
      console.error("Error updating student:", error)
    }
  }

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return

    try {
      const { error } = await supabase.from("students").delete().eq("id", studentId)

      if (error) throw error

      // Reload students
      loadAssignedClass()
    } catch (error) {
      console.error("Error deleting student:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading assigned class...</p>
        </div>
      </div>
    )
  }

  if (!assignedClass) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Assigned</h1>
          <p className="text-gray-600">Manage your assigned class</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Class Assigned</h3>
            <p className="text-gray-500">You are not assigned as a class teacher for any class.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Assigned</h1>
          <p className="text-gray-600">Manage students in {assignedClass.name}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {students.length} Students
        </Badge>
      </div>

      {/* Class Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{assignedClass.name}</span>
          </CardTitle>
          <CardDescription>
            {assignedClass.category} • {students.length}/{assignedClass.max_students} students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Class capacity: {Math.round((students.length / assignedClass.max_students) * 100)}% full
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${Math.min((students.length / assignedClass.max_students) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Manage students in your class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">
                    {`${student.first_name} ${student.middle_name || ""} ${student.surname}`.trim()}
                  </h3>
                  <p className="text-sm text-gray-600">{student.email}</p>
                  <p className="text-sm text-gray-500">
                    Parent: {student.parent_name} ({student.parent_phone})
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={student.status === "Active" ? "default" : "secondary"}>{student.status}</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEditStudent(student)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteStudent(student.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {students.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No students in this class yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    defaultValue={editingStudent.first_name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Surname</Label>
                  <Input
                    id="surname"
                    defaultValue={editingStudent.surname}
                    onChange={(e) => setEditingStudent({ ...editingStudent, surname: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  defaultValue={editingStudent.phone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="parent_name">Parent Name</Label>
                <Input
                  id="parent_name"
                  defaultValue={editingStudent.parent_name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parent_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="parent_phone">Parent Phone</Label>
                <Input
                  id="parent_phone"
                  defaultValue={editingStudent.parent_phone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parent_phone: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveStudent(editingStudent)}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
