"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Users, GraduationCap } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Subject {
  id: number
  name: string
  code: string
  department: string
  description: string
  teacher_name: string
  classes: string[]
  status: string
}

export function SubjectsOverviewSection() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    filterSubjects()
  }, [subjects, searchTerm, selectedDepartment])

  const loadSubjects = async () => {
    try {
      setIsLoading(true)
      console.log("Loading subjects overview...")

      // Get all subjects with teacher information
      const { data: subjectsData, error } = await supabase
        .from("subjects")
        .select(`
          id,
          name,
          code,
          department,
          description,
          status,
          teacher_id,
          teachers (
            first_name,
            middle_name,
            surname
          )
        `)
        .order("department")
        .order("name")

      if (error) {
        console.error("Error loading subjects:", error)
        return
      }

      console.log("Raw subjects data:", subjectsData)

      // Transform the data
      const transformedSubjects =
        subjectsData?.map((subject: any) => ({
          id: subject.id,
          name: subject.name,
          code: subject.code || "N/A",
          department: subject.department,
          description: subject.description || "No description available",
          teacher_name: subject.teachers
            ? [subject.teachers.first_name, subject.teachers.middle_name, subject.teachers.surname]
                .filter(Boolean)
                .join(" ")
            : "No teacher assigned",
          classes: [], // Will be populated separately
          status: subject.status || "Active",
        })) || []

      console.log("Transformed subjects:", transformedSubjects)
      setSubjects(transformedSubjects)
    } catch (error) {
      console.error("Error in loadSubjects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterSubjects = () => {
    let filtered = subjects

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.department.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter((subject) => subject.department.toLowerCase() === selectedDepartment.toLowerCase())
    }

    setFilteredSubjects(filtered)
  }

  const getDepartments = () => {
    const departments = [...new Set(subjects.map((subject) => subject.department))]
    return departments.filter(Boolean)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading subjects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects Overview</h1>
          <p className="text-gray-600">View all subjects offered in the school</p>
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-green-600" />
          <span className="text-sm text-gray-600">{filteredSubjects.length} subjects</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search subjects, teachers, or departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Departments</option>
                {getDepartments().map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">Code: {subject.code}</CardDescription>
                </div>
                <Badge variant={subject.status === "Active" ? "default" : "secondary"} className="text-xs">
                  {subject.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Department */}
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{subject.department}</span>
              </div>

              {/* Teacher */}
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm">{subject.teacher_name}</span>
              </div>

              {/* Description */}
              <div className="text-sm text-gray-600">{subject.description}</div>

              {/* Classes (if available) */}
              {subject.classes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {subject.classes.slice(0, 3).map((className) => (
                    <Badge key={className} variant="outline" className="text-xs">
                      {className}
                    </Badge>
                  ))}
                  {subject.classes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{subject.classes.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredSubjects.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedDepartment !== "all"
                ? "Try adjusting your search criteria"
                : "No subjects available in the system"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{getDepartments().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Subjects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subjects.filter((s) => s.status === "Active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
