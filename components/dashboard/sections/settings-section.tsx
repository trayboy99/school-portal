"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Users, School, Shield, Bell, Calendar, GraduationCap, Clock, BookOpen } from "lucide-react"

type SubjectsByClass = {
  [key: string]: string[]
}

export function SettingsSection() {
  const [isAcademicCalendarOpen, setIsAcademicCalendarOpen] = useState(false)
  const [isClassCategoryOpen, setIsClassCategoryOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<number | null>(null)
  const [editedClasses, setEditedClasses] = useState<{ [key: number]: string[] }>({})

  const [academicYear, setAcademicYear] = useState({
    year: "2024-2025",
    startDate: "2024-09-01",
    endDate: "2025-08-31",
    currentTerm: "first",
  })

  const [terms, setTerms] = useState([
    {
      id: 1,
      name: "First Term",
      startDate: "2024-09-01",
      endDate: "2024-12-15",
      examStart: "2024-12-01",
      examEnd: "2024-12-15",
      status: "completed",
    },
    {
      id: 2,
      name: "Second Term",
      startDate: "2025-01-08",
      endDate: "2025-04-15",
      examStart: "2025-04-01",
      examEnd: "2025-04-15",
      status: "active",
    },
    {
      id: 3,
      name: "Third Term",
      startDate: "2025-05-01",
      endDate: "2025-08-15",
      examStart: "2025-08-01",
      examEnd: "2025-08-15",
      status: "upcoming",
    },
  ])

  const [promotionRules, setPromotionRules] = useState({
    minimumAttendance: 75,
    passingGrade: 50,
    minimumSubjectsPassed: 5,
    autoPromotionEnabled: true,
    manualReviewRequired: false,
  })

  const [classCategories, setClassCategories] = useState([
    {
      id: 1,
      name: "Junior",
      description: "Junior Secondary School",
      defaultSubjects: 9,
      classes: ["JSS 1", "JSS 2", "JSS 3"],
      order: 1,
    },
    {
      id: 2,
      name: "Senior",
      description: "Senior Secondary School",
      defaultSubjects: 6,
      classes: ["SSS 1", "SSS 2", "SSS 3"],
      order: 2,
    },
  ])

  const [subjectsByClass] = useState<SubjectsByClass>({
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
  })

  const [classSections, setClassSections] = useState([
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
  ])

  const startEditingClasses = (categoryId: number) => {
    const category = classCategories.find((cat) => cat.id === categoryId)
    if (category) {
      setEditedClasses((prev) => ({
        ...prev,
        [categoryId]: [...category.classes],
      }))
      setEditingCategory(categoryId)
    }
  }

  const saveClassEdits = (categoryId: number) => {
    const newClasses = editedClasses[categoryId]
    if (newClasses) {
      setClassCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, classes: newClasses } : cat)))
    }
    setEditingCategory(null)
    setEditedClasses((prev) => {
      const updated = { ...prev }
      delete updated[categoryId]
      return updated
    })
  }

  const cancelClassEdits = () => {
    setEditingCategory(null)
    setEditedClasses({})
  }

  const updateClassName = (categoryId: number, index: number, newName: string) => {
    setEditedClasses((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId]?.map((name, i) => (i === index ? newName : name)) || [],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure system settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <School className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle>School Information</CardTitle>
                <CardDescription>Basic school details and configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Configure
            </Button>
          </CardContent>
        </Card>

        <Dialog open={isAcademicCalendarOpen} onOpenChange={setIsAcademicCalendarOpen}>
          <DialogTrigger asChild>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <CardTitle>Academic Calendar</CardTitle>
                    <CardDescription>Manage academic year, terms, and promotion</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Manage Calendar
                </Button>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Academic Calendar Management</DialogTitle>
              <DialogDescription>Configure academic year, terms, and automatic promotion settings</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="calendar">Academic Calendar</TabsTrigger>
                <TabsTrigger value="promotion">Promotion Rules</TabsTrigger>
                <TabsTrigger value="preview">System Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Academic Year Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Academic Year</Label>
                        <Input
                          value={academicYear.year}
                          onChange={(e) => setAcademicYear((prev) => ({ ...prev, year: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Current Term</Label>
                        <Select
                          value={academicYear.currentTerm}
                          onValueChange={(value) => setAcademicYear((prev) => ({ ...prev, currentTerm: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first">First Term</SelectItem>
                            <SelectItem value="second">Second Term</SelectItem>
                            <SelectItem value="third">Third Term</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Academic Year Start</Label>
                        <Input
                          type="date"
                          value={academicYear.startDate}
                          onChange={(e) => setAcademicYear((prev) => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Academic Year End</Label>
                        <Input
                          type="date"
                          value={academicYear.endDate}
                          onChange={(e) => setAcademicYear((prev) => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Terms & Examination Periods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {terms.map((term) => (
                        <div key={term.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{term.name}</h4>
                            <Badge
                              variant={
                                term.status === "active"
                                  ? "default"
                                  : term.status === "completed"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {term.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm">Term Start</Label>
                              <Input
                                type="date"
                                value={term.startDate}
                                className="mt-1"
                                onChange={(e) => {
                                  setTerms((prev) =>
                                    prev.map((t) => (t.id === term.id ? { ...t, startDate: e.target.value } : t)),
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Term End</Label>
                              <Input
                                type="date"
                                value={term.endDate}
                                className="mt-1"
                                onChange={(e) => {
                                  setTerms((prev) =>
                                    prev.map((t) => (t.id === term.id ? { ...t, endDate: e.target.value } : t)),
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Exam Start</Label>
                              <Input
                                type="date"
                                value={term.examStart}
                                className="mt-1"
                                onChange={(e) => {
                                  setTerms((prev) =>
                                    prev.map((t) => (t.id === term.id ? { ...t, examStart: e.target.value } : t)),
                                  )
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Exam End</Label>
                              <Input
                                type="date"
                                value={term.examEnd}
                                className="mt-1"
                                onChange={(e) => {
                                  setTerms((prev) =>
                                    prev.map((t) => (t.id === term.id ? { ...t, examEnd: e.target.value } : t)),
                                  )
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="promotion" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Student Promotion Rules
                    </CardTitle>
                    <CardDescription>Configure automatic promotion criteria and rules</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Minimum Attendance (%)</Label>
                        <Input
                          type="number"
                          defaultValue={promotionRules.minimumAttendance}
                          onChange={(e) =>
                            setPromotionRules((prev) => ({ ...prev, minimumAttendance: Number(e.target.value) || 0 }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Passing Grade (%)</Label>
                        <Input
                          type="number"
                          defaultValue={promotionRules.passingGrade}
                          onChange={(e) =>
                            setPromotionRules((prev) => ({ ...prev, passingGrade: Number(e.target.value) || 0 }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Minimum Subjects to Pass</Label>
                      <Input
                        type="number"
                        defaultValue={promotionRules.minimumSubjectsPassed}
                        onChange={(e) =>
                          setPromotionRules((prev) => ({ ...prev, minimumSubjectsPassed: Number(e.target.value) || 0 }))
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoPromotion"
                          checked={promotionRules.autoPromotionEnabled}
                          onChange={(e) =>
                            setPromotionRules((prev) => ({ ...prev, autoPromotionEnabled: e.target.checked }))
                          }
                        />
                        <Label htmlFor="autoPromotion">Enable Automatic Promotion</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="manualReview"
                          checked={promotionRules.manualReviewRequired}
                          onChange={(e) =>
                            setPromotionRules((prev) => ({ ...prev, manualReviewRequired: e.target.checked }))
                          }
                        />
                        <Label htmlFor="manualReview">Require Manual Review for Borderline Cases</Label>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Promotion Timeline</h4>
                      <p className="text-sm text-blue-700">
                        • Third term exams conclude: August 15, 2025
                        <br />• Results compilation: August 16-20, 2025
                        <br />• Automatic promotion: August 21, 2025
                        <br />• Manual review period: August 22-25, 2025
                        <br />• New academic year starts: September 1, 2025
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Integration Preview</CardTitle>
                    <CardDescription>How this affects other parts of the system</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">📚 Exam Management</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Exams auto-scheduled based on term dates</li>
                          <li>• Results feed into promotion decisions</li>
                          <li>• Third term completion triggers promotion</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">👥 Student Management</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Class assignments update automatically</li>
                          <li>• Academic year progression tracked</li>
                          <li>• Promotion history maintained</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">🏫 Class Management</h4>
                        <ul className="text-sm space-y-1">
                          <li>• New classes created for next year</li>
                          <li>• Student capacity planning</li>
                          <li>• Teacher assignments updated</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">📊 Reports</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Promotion statistics generated</li>
                          <li>• Academic performance trends</li>
                          <li>• Year-over-year comparisons</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAcademicCalendarOpen(false)}>
                Cancel
              </Button>
              <Button>Save Configuration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isClassCategoryOpen} onOpenChange={setIsClassCategoryOpen}>
          <DialogTrigger asChild>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                  <div>
                    <CardTitle>Class & Category Management</CardTitle>
                    <CardDescription>Configure class categories, subjects, and arrangements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Manage Classes
                </Button>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Class & Category Management</DialogTitle>
              <DialogDescription>
                Configure class categories, subject allocation, and class arrangements
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="subjects">Subject Allocation</TabsTrigger>
                <TabsTrigger value="arrangement">Class Arrangement</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Class Categories Configuration
                    </CardTitle>
                    <CardDescription>Define categories and their default settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {classCategories.map((category) => (
                        <div key={category.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{category.name}</h4>
                              <p className="text-sm text-gray-600">{category.description}</p>
                            </div>
                            <Badge variant="outline">Order: {category.order}</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label className="text-sm font-medium">Default Subjects Count</Label>
                              <Input
                                type="number"
                                defaultValue={category.defaultSubjects}
                                onChange={(e) => {
                                  setClassCategories((prev) =>
                                    prev.map((cat) =>
                                      cat.id === category.id
                                        ? { ...cat, defaultSubjects: Number(e.target.value) || 0 }
                                        : cat,
                                    ),
                                  )
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Display Order</Label>
                              <Input
                                type="number"
                                defaultValue={category.order}
                                onChange={(e) => {
                                  setClassCategories((prev) =>
                                    prev.map((cat) =>
                                      cat.id === category.id ? { ...cat, order: Number(e.target.value) || 0 } : cat,
                                    ),
                                  )
                                }}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium">Classes in this Category</Label>
                              {editingCategory === category.id ? (
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => saveClassEdits(category.id)} className="h-7">
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelClassEdits} className="h-7">
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditingClasses(category.id)}
                                  className="h-7"
                                >
                                  Edit Classes
                                </Button>
                              )}
                            </div>

                            {editingCategory === category.id ? (
                              <div className="space-y-2">
                                {editedClasses[category.id]?.map((className, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <Badge variant="secondary" className="min-w-[24px] justify-center">
                                      {index + 1}
                                    </Badge>
                                    <Input
                                      value={className}
                                      onChange={(e) => updateClassName(category.id, index, e.target.value)}
                                      placeholder={`Class ${index + 1} name`}
                                      className="flex-1"
                                    />
                                  </div>
                                )) || []}
                                <p className="text-xs text-gray-500 mt-2">
                                  💡 Edit class names while preserving their order
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {category.classes.map((className, index) => (
                                  <div key={index} className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      {index + 1}
                                    </Badge>
                                    <Badge variant="secondary">{className}</Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subjects" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Subject Allocation by Class
                    </CardTitle>
                    <CardDescription>Manage subjects for each class</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {classCategories.map((category) => (
                        <div key={category.id} className="border rounded-lg p-4">
                          <h3 className="font-semibold text-lg mb-4 flex items-center">
                            {category.name} Classes
                            <Badge variant="outline" className="ml-2">
                              {category.defaultSubjects} subjects each
                            </Badge>
                          </h3>

                          <div className="grid gap-4">
                            {category.classes.map((className) => (
                              <div key={className} className="border rounded p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{className}</h4>
                                  <Badge variant="secondary">
                                    {subjectsByClass[className as keyof SubjectsByClass]?.length || 0} subjects
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {subjectsByClass[className as keyof SubjectsByClass]?.map(
                                    (subject: string, index: number) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {subject}
                                      </Badge>
                                    ),
                                  ) || <span className="text-sm text-gray-500">No subjects assigned</span>}
                                </div>

                                <Button variant="outline" size="sm" className="mt-2">
                                  Edit Subjects
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="arrangement" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Class Arrangement & Order
                    </CardTitle>
                    <CardDescription>Set the display order and arrangement of classes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Current Class Order</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {classCategories
                            .sort((a, b) => a.order - b.order)
                            .map((category) => (
                              <div key={category.id} className="bg-white p-3 rounded border">
                                <h5 className="font-medium mb-2">{category.name}</h5>
                                <div className="space-y-1">
                                  {category.classes.map((className, index) => (
                                    <div key={index} className="text-sm flex items-center justify-between">
                                      <span>{className}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {subjectsByClass[className as keyof SubjectsByClass]?.length || 0} subjects
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">System Integration</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Class dropdowns will follow this arrangement order</li>
                          <li>• Subject forms will auto-populate based on class selection</li>
                          <li>• Category-based auto-fill will use these settings</li>
                          <li>• Subject count validation will reference these numbers</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sections" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Class Sections Configuration
                    </CardTitle>
                    <CardDescription>Manage class sections like Gold and Silver</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {classSections.map((section) => (
                        <div key={section.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-6 h-6 rounded-full border-2"
                                style={{ backgroundColor: section.color }}
                              ></div>
                              <div>
                                <h4 className="font-semibold text-lg">{section.name}</h4>
                                <p className="text-sm text-gray-600">{section.description}</p>
                              </div>
                            </div>
                            <Badge variant="outline">Order: {section.order}</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Section Name</Label>
                              <Input
                                defaultValue={section.name}
                                onChange={(e) => {
                                  setClassSections((prev) =>
                                    prev.map((sec) => (sec.id === section.id ? { ...sec, name: e.target.value } : sec)),
                                  )
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Display Order</Label>
                              <Input
                                type="number"
                                defaultValue={section.order}
                                onChange={(e) => {
                                  setClassSections((prev) =>
                                    prev.map((sec) =>
                                      sec.id === section.id ? { ...sec, order: Number(e.target.value) || 0 } : sec,
                                    ),
                                  )
                                }}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <Label className="text-sm font-medium">Description</Label>
                            <Input
                              defaultValue={section.description}
                              onChange={(e) => {
                                setClassSections((prev) =>
                                  prev.map((sec) =>
                                    sec.id === section.id ? { ...sec, description: e.target.value } : sec,
                                  ),
                                )
                              }}
                              className="mt-1"
                              placeholder="Section description..."
                            />
                          </div>

                          <div className="mt-4">
                            <Label className="text-sm font-medium">Section Color</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <input
                                type="color"
                                value={section.color}
                                onChange={(e) => {
                                  setClassSections((prev) =>
                                    prev.map((sec) =>
                                      sec.id === section.id ? { ...sec, color: e.target.value } : sec,
                                    ),
                                  )
                                }}
                                className="w-12 h-8 rounded border"
                              />
                              <Input
                                value={section.color}
                                onChange={(e) => {
                                  setClassSections((prev) =>
                                    prev.map((sec) =>
                                      sec.id === section.id ? { ...sec, color: e.target.value } : sec,
                                    ),
                                  )
                                }}
                                className="flex-1"
                                placeholder="#FFD700"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Section Usage</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Sections help organize students within the same class</li>
                          <li>• Gold section typically for high-performing students</li>
                          <li>• Silver section for regular academic performance</li>
                          <li>• Each section can have different teaching approaches</li>
                          <li>• Sections will appear in student assignment and class management</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Current Section Order</h4>
                        <div className="flex space-x-4">
                          {classSections
                            .sort((a, b) => a.order - b.order)
                            .map((section) => (
                              <div key={section.id} className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: section.color }}></div>
                                <span className="text-sm font-medium">{section.name}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsClassCategoryOpen(false)}>
                Cancel
              </Button>
              <Button>Save Configuration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Password policies and security options</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Security
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-yellow-600" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Notifications
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-purple-600" />
              <div>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Advanced system configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              System
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Changes</CardTitle>
          <CardDescription>Latest system modifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { change: "Updated academic calendar for 2024-2025", user: "Admin", date: "Dec 10", type: "Calendar" },
              { change: "Modified promotion rules", user: "Principal", date: "Dec 9", type: "Academic" },
              { change: "Added new user role", user: "Admin", date: "Dec 8", type: "Users" },
            ].map((change, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{change.change}</h3>
                  <p className="text-sm text-gray-600">
                    by {change.user} • {change.date}
                  </p>
                </div>
                <Badge variant="outline">{change.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
