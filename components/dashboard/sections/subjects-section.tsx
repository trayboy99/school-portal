"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, BookOpen, Layers } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SubjectsSection() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    class: "",
    teacher: "",
    department: "",
  })

  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: "Mathematics",
      code: "MATH101",
      department: "Mathematics",
      teacher: "Dr. Sarah Johnson",
      classes: ["Grade 10A", "Grade 10B"],
      description: "Core mathematics curriculum covering algebra, geometry, and basic calculus.",
    },
    {
      id: 2,
      name: "English Literature",
      code: "ENG101",
      department: "Languages",
      teacher: "Mr. David Wilson",
      classes: ["Grade 9A", "Grade 10B"],
      description: "Study of classic and contemporary literature with focus on critical analysis.",
    },
    {
      id: 3,
      name: "Physics",
      code: "PHY101",
      department: "Science",
      teacher: "Dr. Sarah Johnson",
      classes: ["Grade 11A", "Grade 11B"],
      description: "Introduction to mechanics, thermodynamics, and basic quantum physics.",
    },
  ])

  const [classCategories] = useState([
    {
      id: 1,
      name: "Junior",
      classes: ["JSS 1", "JSS 2", "JSS 3"],
      order: 1,
    },
    {
      id: 2,
      name: "Senior",
      classes: ["SSS 1", "SSS 2", "SSS 3"],
      order: 2,
    },
  ])

  // Get unique departments
  const departments = Array.from(new Set(subjects.map((subject) => subject.department)))

  const handleAddSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newSubject = {
      id: subjects.length + 1,
      name: formData.name,
      code: formData.code,
      department: formData.department,
      teacher: formData.teacher,
      classes: [formData.class],
      description: "",
    }

    setSubjects([...subjects, newSubject])
    setIsCreateDialogOpen(false)
    setFormData({
      name: "",
      code: "",
      class: "",
      teacher: "",
      department: "",
    })
  }

  const handleDeleteSubject = () => {
    if (selectedSubject) {
      setSubjects(subjects.filter((subject) => subject.id !== selectedSubject.id))
      setIsDeleteDialogOpen(false)
      setSelectedSubject(null)
    }
  }

  const handleEditSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (selectedSubject) {
      const updatedSubjects = subjects.map((subject) => {
        if (subject.id === selectedSubject.id) {
          return {
            ...subject,
            name: formData.name,
            code: formData.code,
            department: formData.department,
            teacher: formData.teacher,
            classes: [formData.class],
          }
        }
        return subject
      })

      setSubjects(updatedSubjects)
      setIsEditDialogOpen(false)
      setSelectedSubject(null)
      setFormData({
        name: "",
        code: "",
        class: "",
        teacher: "",
        department: "",
      })
    }
  }

  const openEditDialog = (subject: any) => {
    setSelectedSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      class: subject.classes[0],
      teacher: subject.teacher,
      department: subject.department,
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (subject: any) => {
    setSelectedSubject(subject)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (subject: any) => {
    setSelectedSubject(subject)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600">Manage academic subjects and curriculum</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>Create a new subject for the curriculum. Fill in the details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubject}>
              <div className="grid gap-4 py-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="subject-name">Subject Name *</Label>
                  <Input
                    id="subject-name"
                    name="subject-name"
                    placeholder="e.g. Advanced Mathematics"
                    className="w-full"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject-code">Subject Code *</Label>
                  <Input
                    id="subject-code"
                    name="subject-code"
                    placeholder="e.g. MATH201"
                    className="w-full"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject-department">Department *</Label>
                  <Input
                    id="subject-department"
                    name="subject-department"
                    placeholder="e.g. Science, Mathematics, Languages"
                    className="w-full"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500">
                    Enter the department name (will be used for teacher assignment)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject-class">Target Class *</Label>
                  <Select
                    name="subject-class"
                    required
                    value={formData.class}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, class: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classCategories
                        .sort((a, b) => a.order - b.order)
                        .map((category) => (
                          <div key={category.id}>
                            <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                              {category.name}
                            </div>
                            {category.classes.map((className) => (
                              <SelectItem key={className} value={className}>
                                {className}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject-teacher">Assigned Teacher *</Label>
                  <Select
                    name="subject-teacher"
                    required
                    value={formData.teacher}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, teacher: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</SelectItem>
                      <SelectItem value="Mr. David Wilson">Mr. David Wilson</SelectItem>
                      <SelectItem value="Mrs. Emily Brown">Mrs. Emily Brown</SelectItem>
                      <SelectItem value="Mr. Michael Davis">Mr. Michael Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Add Subject
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">Active curriculum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Academic departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Management</CardTitle>
          <CardDescription>View and manage academic subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>{subject.department}</TableCell>
                  <TableCell>{subject.teacher}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {subject.classes.map((cls, index) => {
                        // Define colors for different class types
                        const getClassColor = (className: string) => {
                          if (className.startsWith("JSS")) {
                            return "bg-blue-100 text-blue-800 border-blue-200"
                          } else if (className.startsWith("SSS")) {
                            return "bg-green-100 text-green-800 border-green-200"
                          } else if (className.includes("Grade")) {
                            return "bg-purple-100 text-purple-800 border-purple-200"
                          } else {
                            return "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        }

                        return (
                          <Badge key={index} variant="outline" className={`text-xs ${getClassColor(cls)}`}>
                            {cls}
                          </Badge>
                        )
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(subject)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openViewDialog(subject)}>
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(subject)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Subject Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Subject Details</DialogTitle>
          </DialogHeader>
          {selectedSubject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Subject Name</h3>
                  <p className="mt-1">{selectedSubject.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Subject Code</h3>
                  <p className="mt-1">{selectedSubject.code}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="mt-1">{selectedSubject.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Teacher</h3>
                  <p className="mt-1">{selectedSubject.teacher}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Classes</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSubject.classes.map((cls: string, index: number) => {
                    const getClassColor = (className: string) => {
                      if (className.startsWith("JSS")) {
                        return "bg-blue-100 text-blue-800 border-blue-200"
                      } else if (className.startsWith("SSS")) {
                        return "bg-green-100 text-green-800 border-green-200"
                      } else if (className.includes("Grade")) {
                        return "bg-purple-100 text-purple-800 border-purple-200"
                      } else {
                        return "bg-gray-100 text-gray-800 border-gray-200"
                      }
                    }

                    return (
                      <Badge key={index} variant="outline" className={`text-xs ${getClassColor(cls)}`}>
                        {cls}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedSubject.description || "No description available."}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Update the subject information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubject}>
            <div className="grid gap-4 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="edit-subject-name">Subject Name *</Label>
                <Input
                  id="edit-subject-name"
                  name="edit-subject-name"
                  placeholder="e.g. Advanced Mathematics"
                  className="w-full"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject-code">Subject Code *</Label>
                <Input
                  id="edit-subject-code"
                  name="edit-subject-code"
                  placeholder="e.g. MATH201"
                  className="w-full"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject-department">Department *</Label>
                <Input
                  id="edit-subject-department"
                  name="edit-subject-department"
                  placeholder="e.g. Science, Mathematics, Languages"
                  className="w-full"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject-class">Target Class *</Label>
                <Select
                  name="edit-subject-class"
                  required
                  value={formData.class}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, class: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classCategories
                      .sort((a, b) => a.order - b.order)
                      .map((category) => (
                        <div key={category.id}>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                            {category.name}
                          </div>
                          {category.classes.map((className) => (
                            <SelectItem key={className} value={className}>
                              {className}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject-teacher">Assigned Teacher *</Label>
                <Select
                  name="edit-subject-teacher"
                  required
                  value={formData.teacher}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, teacher: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</SelectItem>
                    <SelectItem value="Mr. David Wilson">Mr. David Wilson</SelectItem>
                    <SelectItem value="Mrs. Emily Brown">Mrs. Emily Brown</SelectItem>
                    <SelectItem value="Mr. Michael Davis">Mr. Michael Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subject? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSubject && (
            <div className="py-4">
              <p className="font-medium">
                {selectedSubject.name} ({selectedSubject.code})
              </p>
              <p className="text-sm text-gray-500 mt-1">Department: {selectedSubject.department}</p>
              <p className="text-sm text-gray-500">Teacher: {selectedSubject.teacher}</p>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteSubject}>
              Delete Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
