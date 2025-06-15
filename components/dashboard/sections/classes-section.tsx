"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Users, BookOpen, GraduationCap, Edit, Trash2, Layers, Info } from "lucide-react"

type SubjectsByClass = {
  [key: string]: string[]
}

// Mock student data to simulate database
const mockStudents = [
  { id: 1, name: "John Doe", classId: 1, section: "Gold" },
  { id: 2, name: "Jane Smith", classId: 1, section: "Gold" },
  { id: 3, name: "Michael Johnson", classId: 1, section: "Silver" },
  { id: 4, name: "Emily Brown", classId: 1, section: "Gold" },
  { id: 5, name: "David Wilson", classId: 1, section: "Silver" },
  { id: 6, name: "Sarah Taylor", classId: 2, section: "Gold" },
  { id: 7, name: "James Anderson", classId: 2, section: "Gold" },
  { id: 8, name: "Jennifer Thomas", classId: 2, section: "Silver" },
  { id: 9, name: "Robert Jackson", classId: 2, section: "Gold" },
  { id: 10, name: "Elizabeth White", classId: 3, section: "Gold" },
  { id: 11, name: "William Harris", classId: 3, section: "Gold" },
  { id: 12, name: "Linda Martin", classId: 3, section: "Silver" },
  { id: 13, name: "Richard Thompson", classId: 3, section: "Gold" },
  { id: 14, name: "Patricia Garcia", classId: 3, section: "Silver" },
  { id: 15, name: "Charles Martinez", classId: 3, section: "Gold" },
]

// Mock academic calendar settings
const academicCalendarSettings = {
  year: "2024-2025",
  startDate: "2024-09-01",
  endDate: "2025-08-31",
  currentTerm: "second",
}

// Function to get class sections from settings (simulating fetch from settings section)
const getClassSectionsFromSettings = () => {
  // This would normally fetch from the settings section's classSections state
  // For now, we'll simulate the two sections from settings
  return [
    {
      id: 1,
      name: "Gold",
      description: "Gold section for high-performing students",
      color: "#FFD700",
      order: 1,
    },
    {
      id: 2,
      name: "Silver",
      description: "Silver section for regular students",
      color: "#C0C0C0",
      order: 2,
    },
  ]
}

const subjectsByClass: SubjectsByClass = {
  "JSS 1": [
    "Mathematics",
    "English",
    "Basic Science",
    "Social Studies",
    "Civic Education",
    "Computer Studies",
    "French",
    "Creative Arts",
    "Physical Education",
  ],
  "JSS 2": [
    "Mathematics",
    "English",
    "Basic Science",
    "Social Studies",
    "Civic Education",
    "Computer Studies",
    "French",
    "Creative Arts",
    "Physical Education",
  ],
  "JSS 3": [
    "Mathematics",
    "English",
    "Basic Science",
    "Social Studies",
    "Civic Education",
    "Computer Studies",
    "French",
    "Creative Arts",
    "Physical Education",
  ],
  "SSS 1": ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics"],
  "SSS 2": ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics"],
  "SSS 3": ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics"],
}

export function ClassesSection() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<any>(null)
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    teacher: "",
    maxStudents: "",
    section: "",
  })
  const [classes, setClasses] = useState([
    {
      id: 1,
      name: "Grade 10A",
      teacher: "Dr. Sarah Johnson",
      teacherId: "TCH001",
      students: 0, // Will be dynamically updated
      maxStudents: 40,
      subjects: 8,
      room: "Room 101",
      section: "Gold", // Added section
      academicYear: "", // Will be dynamically updated
      description: "Science stream class focusing on advanced mathematics and sciences",
    },
    {
      id: 2,
      name: "Grade 10B",
      teacher: "Mr. David Wilson",
      teacherId: "TCH002",
      students: 0, // Will be dynamically updated
      maxStudents: 40,
      subjects: 8,
      room: "Room 102",
      section: "Silver", // Added section
      academicYear: "", // Will be dynamically updated
      description: "Commerce stream class with focus on business studies and economics",
    },
    {
      id: 3,
      name: "Grade 9A",
      teacher: "Mrs. Emily Brown",
      teacherId: "TCH003",
      students: 0, // Will be dynamically updated
      maxStudents: 40,
      subjects: 7,
      room: "Room 201",
      section: "Gold", // Added section
      academicYear: "", // Will be dynamically updated
      description: "General education class covering all core subjects",
    },
  ])

  const [classSections, setClassSections] = useState<{ [key: number]: string[] }>({})
  const [currentAcademicYear, setCurrentAcademicYear] = useState("")

  // Function to count students per class
  const countStudentsPerClass = (classId: number) => {
    return mockStudents.filter((student) => student.classId === classId).length
  }

  // Function to get sections per class
  const getSectionsPerClass = (classId: number) => {
    const sections = [
      ...new Set(mockStudents.filter((student) => student.classId === classId).map((student) => student.section)),
    ]
    return sections
  }

  // Function to get section color
  const getSectionColor = (sectionName: string) => {
    const section = getClassSectionsFromSettings().find((s) => s.name === sectionName)
    return section?.color || "#808080" // Default gray if not found
  }

  // Update class data with actual student counts and sections
  useEffect(() => {
    // Update student counts
    const updatedClasses = classes.map((classItem) => ({
      ...classItem,
      students: countStudentsPerClass(classItem.id),
      academicYear: academicCalendarSettings.year,
    }))
    setClasses(updatedClasses)

    // Get sections for each class
    const sections: { [key: number]: string[] } = {}
    classes.forEach((classItem) => {
      sections[classItem.id] = getSectionsPerClass(classItem.id)
    })
    setClassSections(sections)

    // Set current academic year
    setCurrentAcademicYear(academicCalendarSettings.year)
  }, [])

  const classCategories = [
    {
      id: 1,
      name: "Junior",
      classes: ["JSS 1", "JSS 2", "JSS 3"],
      defaultSubjects: 9,
      order: 1,
    },
    {
      id: 2,
      name: "Senior",
      classes: ["SSS 1", "SSS 2", "SSS 3"],
      defaultSubjects: 6,
      order: 2,
    },
  ]

  const [formData, setFormData] = useState({
    name: "",
    teacher: "",
    maxStudents: "",
    academicYear: academicCalendarSettings.year,
    subjects: "",
    category: "",
    section: "",
    isReadOnly: false,
  })

  // Sample teachers data (in real app, this would come from API)
  const availableTeachers = [
    { id: "TCH001", name: "Dr. Sarah Johnson" },
    { id: "TCH002", name: "Mr. David Wilson" },
    { id: "TCH003", name: "Mrs. Emily Brown" },
    { id: "TCH004", name: "Prof. Michael Davis" },
    { id: "TCH005", name: "Ms. Jennifer Garcia" },
  ]

  const availableRooms = [
    "Room 101",
    "Room 102",
    "Room 103",
    "Room 201",
    "Room 202",
    "Room 203",
    "Lab A",
    "Lab B",
    "Computer Lab",
    "Library",
    "Auditorium",
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleClassSelection = (className: string) => {
    const category = classCategories.find((cat) => cat.classes.includes(className))
    const subjectCount = subjectsByClass[className as keyof typeof subjectsByClass]?.length || 0

    if (category) {
      setFormData((prev) => ({
        ...prev,
        name: className,
        category: category.name,
        subjects: subjectCount.toString(),
        isReadOnly: true,
      }))
    }
  }

  const handleCreateClass = () => {
    if (!formData.name || !formData.teacher || !formData.section) {
      alert("Please fill in all required fields")
      return
    }

    // Check if teacher is already assigned to another class
    const isTeacherAlreadyAssigned = classes.some((classItem) => classItem.teacherId === formData.teacher)

    if (isTeacherAlreadyAssigned) {
      const assignedClass = classes.find((classItem) => classItem.teacherId === formData.teacher)
      alert(
        `This teacher is already assigned to ${assignedClass?.name}. A teacher can only be assigned to one class at a time.`,
      )
      return
    }

    const selectedTeacher = availableTeachers.find((t) => t.id === formData.teacher)
    const newClass = {
      id: classes.length + 1,
      name: formData.name,
      teacher: selectedTeacher?.name || "",
      teacherId: formData.teacher,
      students: 0, // Will be updated dynamically
      maxStudents: Number.parseInt(formData.maxStudents) || 40,
      subjects: Number.parseInt(formData.subjects) || 0,
      room: "TBD", // Default value since room is removed from form
      section: formData.section, // Added section
      academicYear: currentAcademicYear, // Use current academic year
      description: "", // Default empty since description is removed
    }

    setClasses((prev) => [...prev, newClass])
    setFormData({
      name: "",
      teacher: "",
      maxStudents: "",
      academicYear: currentAcademicYear,
      subjects: "",
      category: "",
      section: "",
      isReadOnly: false,
    })
    setIsCreateDialogOpen(false)
  }

  const handleDeleteClass = (classItem: any) => {
    setClassToDelete(classItem)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteClass = () => {
    if (classToDelete) {
      setClasses((prev) => prev.filter((c) => c.id !== classToDelete.id))
      setIsDeleteDialogOpen(false)
      setClassToDelete(null)
    }
  }

  const handleEditClass = (classItem: any) => {
    setSelectedClass(classItem)
    setEditFormData({
      name: classItem.name,
      teacher: classItem.teacherId,
      maxStudents: classItem.maxStudents.toString(),
      section: classItem.section,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateClass = () => {
    if (!editFormData.name || !editFormData.teacher || !editFormData.section) {
      alert("Please fill in all required fields")
      return
    }

    // Check if teacher is being switched from another class
    const teacherCurrentClass = classes.find(
      (classItem) => classItem.teacherId === editFormData.teacher && classItem.id !== selectedClass.id,
    )

    let confirmSwitch = true
    if (teacherCurrentClass) {
      confirmSwitch = confirm(
        `${availableTeachers.find((t) => t.id === editFormData.teacher)?.name} is currently assigned to ${teacherCurrentClass.name}.\n\n` +
          `Proceeding will:\n` +
          `• Move the teacher to ${selectedClass.name}\n` +
          `• Leave ${teacherCurrentClass.name} without a class teacher\n\n` +
          `Do you want to continue with this teacher switch?`,
      )
    }

    if (!confirmSwitch) {
      return
    }

    const selectedTeacher = availableTeachers.find((t) => t.id === editFormData.teacher)

    setClasses((prev) =>
      prev.map((classItem) => {
        // Update the selected class
        if (classItem.id === selectedClass.id) {
          return {
            ...classItem,
            name: editFormData.name,
            teacher: selectedTeacher?.name || "",
            teacherId: editFormData.teacher,
            maxStudents: Number.parseInt(editFormData.maxStudents) || 40,
            section: editFormData.section,
          }
        }
        // Remove teacher from previous class if switching
        else if (teacherCurrentClass && classItem.id === teacherCurrentClass.id) {
          return {
            ...classItem,
            teacher: "Unassigned - Needs Teacher",
            teacherId: "",
          }
        }
        return classItem
      }),
    )

    // Show success message with switch information
    if (teacherCurrentClass) {
      alert(
        `Teacher switch completed!\n\n` +
          `${selectedTeacher?.name} has been moved to ${selectedClass.name}.\n` +
          `${teacherCurrentClass.name} now needs a new teacher assignment.`,
      )
    }

    setIsEditDialogOpen(false)
    setSelectedClass(null)
  }

  const handleViewDetails = (classItem: any) => {
    setSelectedClass(classItem)
    setIsViewDetailsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600">Manage class information and assignments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Add a new class to the school system. Fill in all the required information.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Class Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="classSelect" className="text-right">
                  Select Class *
                </Label>
                <Select value={formData.name} onValueChange={handleClassSelection}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Choose from predefined classes" />
                  </SelectTrigger>
                  <SelectContent>
                    {classCategories
                      .sort((a, b) => a.order - b.order)
                      .map((category) => (
                        <div key={category.id}>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                            {category.name} ({category.defaultSubjects} subjects)
                          </div>
                          {category.classes.map((className) => (
                            <SelectItem key={className} value={className}>
                              {className} ({subjectsByClass[className as keyof typeof subjectsByClass]?.length || 0}{" "}
                              subjects)
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category (Auto-filled and Read-only) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <div className="col-span-3">
                  <Input
                    id="category"
                    defaultValue={formData.category}
                    readOnly={true}
                    className={`${formData.isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Auto-filled based on class selection"
                  />
                  {formData.isReadOnly && (
                    <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from class category settings</p>
                  )}
                </div>
              </div>

              {/* Section Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="section" className="text-right">
                  Section *
                </Label>
                <Select value={formData.section} onValueChange={(value) => handleInputChange("section", value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {getClassSectionsFromSettings()
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <SelectItem key={section.id} value={section.name}>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: section.color }}></div>
                            {section.name} - {section.description}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Subjects (Auto-filled and Read-only) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subjects" className="text-right">
                  Number of Subjects
                </Label>
                <div className="col-span-3">
                  <Input
                    id="subjects"
                    type="number"
                    defaultValue={formData.subjects}
                    readOnly={true}
                    className={`${formData.isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Auto-calculated from class subjects"
                  />
                  {formData.isReadOnly && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Total subjects allocated to this class: {formData.subjects}
                    </p>
                  )}
                </div>
              </div>

              {/* Class Teacher */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="teacher" className="text-right">
                  Class Teacher *
                </Label>
                <Select value={formData.teacher} onValueChange={(value) => handleInputChange("teacher", value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map((teacher) => {
                      const isAssigned = classes.some((classItem) => classItem.teacherId === teacher.id)
                      const assignedClass = classes.find((classItem) => classItem.teacherId === teacher.id)

                      return (
                        <SelectItem key={teacher.id} value={teacher.id} disabled={isAssigned}>
                          <div className="flex items-center justify-between w-full">
                            <span className={isAssigned ? "text-gray-400" : ""}>{teacher.name}</span>
                            {isAssigned && (
                              <span className="text-xs text-red-500 ml-2">(Assigned to {assignedClass?.name})</span>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Students */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxStudents" className="text-right">
                  Max Students
                </Label>
                <Input
                  id="maxStudents"
                  type="number"
                  placeholder="40"
                  className="col-span-3"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange("maxStudents", e.target.value)}
                />
              </div>

              {/* Academic Year - Read Only */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="academicYear" className="text-right">
                  Academic Year
                </Label>
                <div className="col-span-3">
                  <Input
                    id="academicYear"
                    value={currentAcademicYear}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from academic calendar settings</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClass}>Create Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Class Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>
                Update class information. Note: Some fields may be restricted based on existing data.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Class Name - Read Only for existing classes */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editClassName" className="text-right">
                  Class Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="editClassName"
                    value={editFormData.name}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Class name cannot be changed after creation</p>
                </div>
              </div>

              {/* Section Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editSection" className="text-right">
                  Section *
                </Label>
                <Select
                  value={editFormData.section}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, section: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {getClassSectionsFromSettings()
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <SelectItem key={section.id} value={section.name}>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: section.color }}></div>
                            {section.name} - {section.description}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Class Teacher - Enhanced with Switch Capability */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editTeacher" className="text-right">
                  Class Teacher *
                </Label>
                <div className="col-span-3 space-y-3">
                  <Select
                    value={editFormData.teacher}
                    onValueChange={(value) => setEditFormData((prev) => ({ ...prev, teacher: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeachers.map((teacher) => {
                        const isAssigned = classes.some(
                          (classItem) => classItem.teacherId === teacher.id && classItem.id !== selectedClass?.id,
                        )
                        const assignedClass = classes.find(
                          (classItem) => classItem.teacherId === teacher.id && classItem.id !== selectedClass?.id,
                        )

                        return (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{teacher.name}</span>
                              {isAssigned && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Currently: {assignedClass?.name}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  {/* Teacher Switch Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-start">
                      <div className="text-blue-600 mr-2 mt-0.5">ℹ️</div>
                      <div>
                        <p className="font-medium text-blue-800 text-sm">Teacher Assignment Policy</p>
                        <p className="text-xs text-blue-700 mt-1">
                          • All teachers are available for assignment during editing
                          <br />• If you assign a teacher who's already assigned to another class, they will be
                          automatically switched
                          <br />• The previous class will need a new teacher assignment
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Show current assignment status */}
                  {editFormData.teacher && (
                    <div className="text-sm">
                      {(() => {
                        const selectedTeacher = availableTeachers.find((t) => t.id === editFormData.teacher)
                        const currentAssignment = classes.find(
                          (classItem) =>
                            classItem.teacherId === editFormData.teacher && classItem.id !== selectedClass?.id,
                        )

                        if (currentAssignment) {
                          return (
                            <div className="bg-amber-50 border border-amber-200 rounded p-2">
                              <p className="text-amber-800 font-medium text-xs">⚠️ Teacher Switch Required</p>
                              <p className="text-amber-700 text-xs mt-1">
                                {selectedTeacher?.name} will be moved from <strong>{currentAssignment.name}</strong> to{" "}
                                <strong>{selectedClass?.name}</strong>
                                <br />
                                <span className="text-red-600">
                                  {currentAssignment.name} will need a new teacher assigned.
                                </span>
                              </p>
                            </div>
                          )
                        } else {
                          return (
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                              <p className="text-green-700 text-xs">
                                ✅ {selectedTeacher?.name} is available for assignment
                              </p>
                            </div>
                          )
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Max Students */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editMaxStudents" className="text-right">
                  Max Students
                </Label>
                <Input
                  id="editMaxStudents"
                  type="number"
                  className="col-span-3"
                  value={editFormData.maxStudents}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, maxStudents: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateClass}>Update Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5" />
                {selectedClass?.name} - Class Details
              </DialogTitle>
              <DialogDescription>
                Complete overview of class information, students, and performance metrics.
              </DialogDescription>
            </DialogHeader>

            {selectedClass && (
              <div className="space-y-6">
                {/* Class Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold">{selectedClass.students}</div>
                      <div className="text-sm text-gray-500">Current Students</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold">{selectedClass.subjects}</div>
                      <div className="text-sm text-gray-500">Subjects</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <GraduationCap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <div className="text-2xl font-bold">{selectedClass.maxStudents}</div>
                      <div className="text-sm text-gray-500">Max Capacity</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Layers className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <Badge
                        style={{
                          backgroundColor: getSectionColor(selectedClass.section) + "33",
                          color: getSectionColor(selectedClass.section),
                        }}
                      >
                        {selectedClass.section}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">Section</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Class Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Class Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Class Teacher:</span>
                        <span>{selectedClass.teacher}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Academic Year:</span>
                        <span>{selectedClass.academicYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Room:</span>
                        <span>{selectedClass.room}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Capacity Utilization:</span>
                        <span>{Math.round((selectedClass.students / selectedClass.maxStudents) * 100)}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Student Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getSectionsPerClass(selectedClass.id).map((section) => {
                          const sectionCount = mockStudents.filter(
                            (s) => s.classId === selectedClass.id && s.section === section,
                          ).length
                          return (
                            <div key={section} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: getSectionColor(section) }}
                                ></div>
                                <span>{section} Section</span>
                              </div>
                              <Badge variant="outline">{sectionCount} students</Badge>
                            </div>
                          )
                        })}
                        {getSectionsPerClass(selectedClass.id).length === 0 && (
                          <p className="text-center text-gray-500 py-4">No students assigned to this class yet.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Students List - Read-only view */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Students in Class</CardTitle>
                    <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      Read-only view
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {mockStudents
                        .filter((student) => student.classId === selectedClass.id)
                        .map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-3"
                                style={{ backgroundColor: getSectionColor(student.section) }}
                              ></div>
                              <span>{student.name}</span>
                            </div>
                            <Badge variant="outline">{student.section}</Badge>
                          </div>
                        ))}
                      {mockStudents.filter((student) => student.classId === selectedClass.id).length === 0 && (
                        <p className="text-center text-gray-500 py-4">No students assigned to this class yet.</p>
                      )}
                    </div>
                    <div className="mt-4 bg-gray-50 p-3 rounded text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Note:</span> Student management is handled in the Students
                        section. Students are assigned to classes during student creation or editing.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDetailsDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => setIsViewDetailsDialogOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <Trash2 className="mr-2 h-5 w-5" />
                Delete Class Confirmation
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. Please confirm that you want to delete this class.
              </DialogDescription>
            </DialogHeader>

            {classToDelete && (
              <div className="space-y-4">
                {/* Class Information */}
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Class to be deleted:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Class Name:</span>
                      <span>{classToDelete.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Teacher:</span>
                      <span>{classToDelete.teacher}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Students:</span>
                      <span>{classToDelete.students} students</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Section:</span>
                      <Badge
                        style={{
                          backgroundColor: getSectionColor(classToDelete.section) + "33",
                          color: getSectionColor(classToDelete.section),
                        }}
                      >
                        {classToDelete.section}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Warning Message */}
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <div className="flex items-start">
                    <div className="text-amber-600 mr-2 mt-0.5">⚠️</div>
                    <div>
                      <p className="font-medium text-amber-800 text-sm">Warning</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Deleting this class will:
                        <br />• Remove the class from the system
                        <br />• Free up the assigned teacher for other classes
                        <br />• This action cannot be undone
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student Impact */}
                {classToDelete.students > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-start">
                      <div className="text-blue-600 mr-2 mt-0.5">ℹ️</div>
                      <div>
                        <p className="font-medium text-blue-800 text-sm">Student Information</p>
                        <p className="text-xs text-blue-700 mt-1">
                          This class has {classToDelete.students} students. Deleting this class will NOT affect student
                          records. Students will need to be assigned to a different class in the Students section.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteClass}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">
              {classCategories.reduce((acc, cat) => acc + cat.classes.length, 0)} available class types
            </p>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              {classes.reduce((acc, c) => acc + c.maxStudents, 0)} total capacity
            </p>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(classes.map((c) => c.teacherId)).size}</div>
            <p className="text-xs text-muted-foreground">{availableTeachers.length} total available</p>
          </CardContent>
        </Card>

        <Card className="min-h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Sections</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getClassSectionsFromSettings().length}</div>
            <p className="text-xs text-muted-foreground">
              {getClassSectionsFromSettings()
                .map((s) => s.name)
                .join(", ")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  <div
                    className="w-3 h-3 rounded-full ml-2"
                    style={{ backgroundColor: getSectionColor(classItem.section) }}
                    title={`${classItem.section} Section`}
                  ></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditClass(classItem)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteClass(classItem)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardDescription>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Class Teacher: {classItem.teacher}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{classItem.students}</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{classItem.subjects}</div>
                  <div className="text-xs text-gray-500">Subjects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{classItem.maxStudents}</div>
                  <div className="text-xs text-gray-500">Max</div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {/* Section Badge */}
                <div className="flex items-center">
                  <Layers className="w-4 h-4 mr-2" />
                  <strong>Section:</strong>{" "}
                  <Badge
                    className="ml-2"
                    style={{
                      backgroundColor: getSectionColor(classItem.section) + "33", // Add transparency
                      color: getSectionColor(classItem.section),
                      border: `1px solid ${getSectionColor(classItem.section)}`,
                    }}
                  >
                    {classItem.section}
                  </Badge>
                </div>

                {/* Available Sections from Settings */}
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="font-medium mr-1">Available Sections:</span>
                  {getClassSectionsFromSettings().map((section, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs"
                      style={{
                        backgroundColor: section.color + "22", // More transparency
                        borderColor: section.color,
                        color: section.color,
                      }}
                    >
                      {section.name}
                    </Badge>
                  ))}
                </div>

                {/* Academic Year - dynamically pulled from settings */}
                <div>
                  <strong>Academic Year:</strong> {classItem.academicYear}
                </div>
              </div>

              <div className="flex justify-center">
                <Button variant="outline" className="w-full" onClick={() => handleViewDetails(classItem)}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
