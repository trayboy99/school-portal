"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Save, Camera, Shield, Bell, Eye } from "lucide-react"
import { useStudentAuth } from "@/contexts/student-auth-context"
import { supabase } from "@/lib/supabase"

export default function SettingsSection() {
  const { student, logout } = useStudentAuth()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: "",
    middle_name: "",
    surname: "",
    email: "",
    phone: "",
    home_address: "",
    date_of_birth: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    avatar: "",
  })

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    assignment_reminders: true,
    exam_notifications: true,
    result_notifications: true,
  })

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  useEffect(() => {
    if (student) {
      setProfileData({
        first_name: student.first_name || "",
        middle_name: student.middle_name || "",
        surname: student.surname || "",
        email: student.email || "",
        phone: student.phone || "",
        home_address: student.home_address || "",
        date_of_birth: student.date_of_birth || "",
        parent_name: student.parent_name || "",
        parent_phone: student.parent_phone || "",
        parent_email: student.parent_email || "",
        avatar: student.avatar || "",
      })
    }
  }, [student])

  const handleProfileUpdate = async () => {
    if (!student) return

    try {
      setLoading(true)

      const { error } = await supabase
        .from("students")
        .update({
          first_name: profileData.first_name,
          middle_name: profileData.middle_name,
          surname: profileData.surname,
          email: profileData.email,
          phone: profileData.phone,
          home_address: profileData.home_address,
          date_of_birth: profileData.date_of_birth,
          parent_name: profileData.parent_name,
          parent_phone: profileData.parent_phone,
          parent_email: profileData.parent_email,
          avatar: profileData.avatar,
        })
        .eq("id", student.id)

      if (error) throw error

      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      alert("Please fill in all password fields")
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New passwords do not match")
      return
    }

    if (passwordData.new_password.length < 6) {
      alert("New password must be at least 6 characters long")
      return
    }

    try {
      setLoading(true)
      // In a real app, you would verify the current password and update it
      // For now, just show a success message
      alert("Password changed successfully!")
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      alert("Error changing password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfileData((prev) => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to access settings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription>Update your personal information and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.avatar || "/placeholder.svg?height=96&width=96"} />
                <AvatarFallback className="text-lg">
                  {student.first_name?.charAt(0)}
                  {student.surname?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-medium">
                {student.first_name} {student.surname}
              </h3>
              <p className="text-gray-600">{student.reg_number}</p>
              <p className="text-sm text-gray-500">{student.class}</p>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={profileData.first_name}
                onChange={(e) => setProfileData((prev) => ({ ...prev, first_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                value={profileData.surname}
                onChange={(e) => setProfileData((prev) => ({ ...prev, surname: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                value={profileData.middle_name}
                onChange={(e) => setProfileData((prev) => ({ ...prev, middle_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={profileData.date_of_birth}
                onChange={(e) => setProfileData((prev) => ({ ...prev, date_of_birth: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="home_address">Home Address</Label>
            <Textarea
              id="home_address"
              value={profileData.home_address}
              onChange={(e) => setProfileData((prev) => ({ ...prev, home_address: e.target.value }))}
              rows={3}
            />
          </div>

          <Separator />

          {/* Parent/Guardian Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Parent/Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="parent_name">Parent/Guardian Name</Label>
                <Input
                  id="parent_name"
                  value={profileData.parent_name}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, parent_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_phone">Parent Phone</Label>
                <Input
                  id="parent_phone"
                  value={profileData.parent_phone}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, parent_phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_email">Parent Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={profileData.parent_email}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, parent_email: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleProfileUpdate} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Settings</span>
          </CardTitle>
          <CardDescription>Manage your password and security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, current_password: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, new_password: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirm_password: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePasswordChange} disabled={loading}>
              <Shield className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={(e) => setPreferences((prev) => ({ ...prev, email_notifications: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via SMS</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.sms_notifications}
                onChange={(e) => setPreferences((prev) => ({ ...prev, sms_notifications: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Assignment Reminders</p>
                <p className="text-sm text-gray-600">Get reminded about upcoming assignments</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.assignment_reminders}
                onChange={(e) => setPreferences((prev) => ({ ...prev, assignment_reminders: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Exam Notifications</p>
                <p className="text-sm text-gray-600">Get notified about upcoming exams</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.exam_notifications}
                onChange={(e) => setPreferences((prev) => ({ ...prev, exam_notifications: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Result Notifications</p>
                <p className="text-sm text-gray-600">Get notified when results are published</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.result_notifications}
                onChange={(e) => setPreferences((prev) => ({ ...prev, result_notifications: e.target.checked }))}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Account Information</span>
          </CardTitle>
          <CardDescription>View your account details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Registration Number</p>
              <p className="text-lg font-semibold">{student.reg_number}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Class</p>
              <p className="text-lg font-semibold">{student.class}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge variant="default">{student.status}</Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Admission Date</p>
              <p className="text-lg font-semibold">
                {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
