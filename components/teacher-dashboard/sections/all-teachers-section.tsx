"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Phone, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Teacher {
  id: number
  first_name: string
  middle_name: string
  surname: string
  email: string
  phone: string
  department: string
  subjects: string[]
  status: string
}

export function AllTeachersSection() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAllTeachers()
  }, [])

  useEffect(() => {
    const filtered = teachers.filter(
      (teacher) =>
        `${teacher.first_name} ${teacher.middle_name || ""} ${teacher.surname}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredTeachers(filtered)
  }, [searchTerm, teachers])

  const loadAllTeachers = async () => {
    try {
      setIsLoading(true)

      const { data: teachersData, error } = await supabase.from("teachers").select("*").order("first_name")

      if (error) throw error

      // Format teachers data
      const formattedTeachers =
        teachersData?.map((teacher) => ({
          ...teacher,
          subjects: teacher.subjects ? teacher.subjects.split(",") : [],
        })) || []

      setTeachers(formattedTeachers)
    } catch (error) {
      console.error("Error loading teachers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading teachers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Teachers</h1>
          <p className="text-gray-600">View all teachers in the school</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {teachers.length} Teachers
        </Badge>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search teachers by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {`${teacher.first_name} ${teacher.middle_name || ""} ${teacher.surname}`.trim()}
                  </CardTitle>
                  <CardDescription>{teacher.department} Department</CardDescription>
                </div>
                <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>{teacher.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{teacher.phone}</span>
                </div>
              </div>

              {teacher.subjects.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Subjects:</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.slice(0, 3).map((subject, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {subject.trim()}
                      </Badge>
                    ))}
                    {teacher.subjects.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{teacher.subjects.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeachers.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No teachers found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
