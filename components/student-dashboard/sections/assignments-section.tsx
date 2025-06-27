"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, Calendar, Clock, CheckCircle, AlertTriangle, Upload, Eye, FileText, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface Assignment {
  id: number
  title: string
  description: string
  subject_name: string
  class_name: string
  teacher_id: number
  due_date: string
  assigned_date: string
  total_marks: number
  instructions: string
  submission_type: string
  status: string
  academic_year: string
  term: string
  teacher?: {
    first_name: string
    middle_name: string
    surname: string
    email: string
  }
  submission?: {
    id: number
    submitted_date: string
    grade: number
    feedback: string
    status: string
  }
}

export function AssignmentsSection() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    if (user?.current_class) {
      fetchAssignments()
    } else {
      setLoading(false)
      setError("No user class information available")
    }
  }, [user])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("User data:", user)
      console.log("Fetching assignments for class:", user?.current_class)

      // First, check if assignments table exists and get all assignments
      const { data: allAssignments, error: allError } = await supabase.from("assignments").select("*").limit(5)

      console.log("All assignments (first 5):", allAssignments)
      console.log("All assignments error:", allError)

      // Get distinct class names
      const { data: classNames, error: classError } = await supabase.from("assignments").select("class_name")

      console.log("All class names in assignments:", classNames)

      // Now fetch assignments for the student's class
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("assignments")
        .select(`
          *,
          teachers:teacher_id (
            first_name,
            middle_name,
            surname,
            email
          )
        `)
        .eq("class_name", user?.current_class)
        .order("due_date", { ascending: true })

      console.log("Assignments query result:", assignmentsData)
      console.log("Assignments query error:", assignmentsError)

      if (assignmentsError) {
        console.error("Error fetching assignments:", assignmentsError)
        setError(`Failed to fetch assignments: ${assignmentsError.message}`)
        setDebugInfo({
          userClass: user?.current_class,
          allAssignments: allAssignments?.length || 0,
          classNames: classNames?.map((c) => c.class_name) || [],
          error: assignmentsError,
        })
        return
      }

      // Try to fetch assignment submissions
      let submissionsData = []
      try {
        const { data: submissions, error: submissionsError } = await supabase
          .from("assignment_submissions")
          .select("*")
          .eq("student_id", user?.id)

        if (submissionsError) {
          console.log("Assignment submissions error (table might not exist):", submissionsError)
        } else {
          submissionsData = submissions || []
          console.log("Assignment submissions:", submissionsData)
        }
      } catch (submissionErr) {
        console.log("Assignment submissions table not available:", submissionErr)
      }

      // Combine assignments with their submissions
      const assignmentsWithSubmissions =
        assignmentsData?.map((assignment) => {
          const submission = submissionsData?.find((sub) => sub.assignment_id === assignment.id)

          // Determine status based on submission and due date
          let status = "pending"
          if (submission) {
            status = submission.status || "submitted"
          } else {
            const dueDate = new Date(assignment.due_date)
            const today = new Date()
            if (today > dueDate) {
              status = "overdue"
            }
          }

          return {
            ...assignment,
            teacher: assignment.teachers,
            submission,
            status,
          }
        }) || []

      setAssignments(assignmentsWithSubmissions)
      setDebugInfo({
        userClass: user?.current_class,
        userId: user?.id,
        allAssignments: allAssignments?.length || 0,
        classNames: classNames?.map((c) => c.class_name) || [],
        foundAssignments: assignmentsWithSubmissions.length,
        submissions: submissionsData.length,
      })

      console.log("Final assignments with submissions:", assignmentsWithSubmissions)
    } catch (err) {
      console.error("Error in fetchAssignments:", err)
      setError(`An error occurred while fetching assignments: ${err}`)
      setDebugInfo({
        userClass: user?.current_class,
        error: err,
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "submitted":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "graded":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatTeacherName = (teacher: any) => {
    if (!teacher) return "Unknown Teacher"
    const { first_name, middle_name, surname } = teacher
    return `${first_name} ${middle_name ? middle_name + " " : ""}${surname}`.trim()
  }

  const pendingAssignments = assignments.filter((a) => a.status === "pending")
  const submittedAssignments = assignments.filter((a) => a.status === "submitted" || a.status === "graded")
  const overdueAssignments = assignments.filter((a) => a.status === "overdue")

  const stats = {
    total: assignments.length,
    pending: pendingAssignments.length,
    submitted: submittedAssignments.length,
    overdue: overdueAssignments.length,
    averageGrade:
      submittedAssignments.length > 0
        ? Math.round(
            submittedAssignments.reduce((sum, a) => sum + (a.submission?.grade || 0), 0) / submittedAssignments.length,
          )
        : 0,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Loading your assignments...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <div className="h-8 w-8 mx-auto bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600">Manage your assignments and track your progress</p>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Debug Information:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>Student Class:</strong> {debugInfo.userClass}
              </p>
              <p>
                <strong>Student ID:</strong> {debugInfo.userId}
              </p>
              <p>
                <strong>Total Assignments in DB:</strong> {debugInfo.allAssignments}
              </p>
              <p>
                <strong>Found Assignments for Class:</strong> {debugInfo.foundAssignments}
              </p>
              <p>
                <strong>Assignment Submissions:</strong> {debugInfo.submissions}
              </p>
              <p>
                <strong>Available Classes:</strong> {debugInfo.classNames?.join(", ") || "None"}
              </p>
              {debugInfo.error && (
                <p className="text-red-600">
                  <strong>Error:</strong> {JSON.stringify(debugInfo.error)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700">{error}</p>
            <Button onClick={fetchAssignments} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ClipboardList className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.submitted}</div>
            <div className="text-sm text-gray-500">Submitted</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.overdue}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.averageGrade}%</div>
            <div className="text-sm text-gray-500">Avg Grade</div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({stats.submitted})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Found</h3>
                <p className="text-gray-600">
                  {debugInfo?.allAssignments > 0
                    ? `There are ${debugInfo.allAssignments} assignments in the database, but none for your class (${debugInfo.userClass}).`
                    : "No assignments have been created in the database yet."}
                </p>
                {debugInfo?.classNames?.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">Available classes: {debugInfo.classNames.join(", ")}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{assignment.title}</span>
                        <Badge variant="outline">{assignment.subject_name}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Teacher: {formatTeacherName(assignment.teacher)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{assignment.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                    <span>{assignment.total_marks} marks</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Assignments</h3>
                <p className="text-gray-600">Great job! You're all caught up with your assignments.</p>
              </CardContent>
            </Card>
          ) : (
            pendingAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{assignment.title}</span>
                        <Badge variant="outline">{assignment.subject_name}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Teacher: {formatTeacherName(assignment.teacher)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{assignment.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Due Date:</span>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{new Date(assignment.due_date).toLocaleDateString()}</span>
                        <Badge variant="outline" className="ml-2">
                          {getDaysUntilDue(assignment.due_date)} days left
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Marks:</span>
                      <p className="mt-1">{assignment.total_marks} marks</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Submission Type:</span>
                      <p className="mt-1 capitalize">{assignment.submission_type}</p>
                    </div>
                  </div>

                  {assignment.instructions && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-1">Instructions:</h4>
                      <p className="text-sm text-blue-700">{assignment.instructions}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Assignment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {submittedAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submitted Assignments</h3>
                <p className="text-gray-600">You haven't submitted any assignments yet.</p>
              </CardContent>
            </Card>
          ) : (
            submittedAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{assignment.title}</span>
                        <Badge variant="outline">{assignment.subject_name}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Teacher: {formatTeacherName(assignment.teacher)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </Badge>
                      {assignment.submission?.grade && (
                        <Badge variant="default">
                          {assignment.submission.grade}/{assignment.total_marks}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{assignment.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Submitted:</span>
                      <p className="mt-1">
                        {assignment.submission?.submitted_date &&
                          new Date(assignment.submission.submitted_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Grade:</span>
                      <p className="mt-1">
                        {assignment.submission?.grade
                          ? `${assignment.submission.grade}/${assignment.total_marks}`
                          : "Not graded yet"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Percentage:</span>
                      <p className="mt-1">
                        {assignment.submission?.grade
                          ? `${Math.round((assignment.submission.grade / assignment.total_marks) * 100)}%`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {assignment.submission?.feedback && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-1">Teacher Feedback:</h4>
                      <p className="text-sm text-green-700">{assignment.submission.feedback}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Submission
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueAssignments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Overdue Assignments</h3>
                <p className="text-gray-600">Excellent! You don't have any overdue assignments.</p>
              </CardContent>
            </Card>
          ) : (
            overdueAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow border-red-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{assignment.title}</span>
                        <Badge variant="outline">{assignment.subject_name}</Badge>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Teacher: {formatTeacherName(assignment.teacher)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(assignment.status)}>Overdue</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{assignment.description}</p>

                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="font-medium text-red-800">
                        This assignment was due {Math.abs(getDaysUntilDue(assignment.due_date))} days ago
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Upload className="mr-2 h-4 w-4" />
                      Submit Late
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
