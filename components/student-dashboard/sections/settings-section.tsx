"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield, Palette, Save, Camera, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function SettingsSection() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    dateOfBirth: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    assignmentReminders: true,
    gradeUpdates: true,
    messageAlerts: true,
    eventReminders: false,
    weeklyReports: true,
  })

  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    showGrades: false,
    showAttendance: true,
    allowMessages: true,
  })

  const [appearance, setAppearance] = useState({
    darkMode: false,
    compactView: false,
    language: "english",
  })

  const handleProfileSave = () => {
    // In real app, this would save to database
    alert("Profile updated successfully!")
  }

  const handleNotificationSave = () => {
    // In real app, this would save to database
    alert("Notification preferences updated!")
  }

  const handlePrivacySave = () => {
    // In real app, this would save to database
    alert("Privacy settings updated!")
  }

  const handleAppearanceSave = () => {
    // In real app, this would save to database
    alert("Appearance settings updated!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg" alt="Profile" />
                  <AvatarFallback className="text-lg">
                    {profile.firstName[0]}
                    {profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                      className="pl-10"
                      placeholder="Your home address"
                    />
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="parentName">Parent/Guardian Name</Label>
                    <Input
                      id="parentName"
                      value={profile.parentName}
                      onChange={(e) => setProfile((prev) => ({ ...prev, parentName: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentPhone">Parent Phone</Label>
                    <Input
                      id="parentPhone"
                      value={profile.parentPhone}
                      onChange={(e) => setProfile((prev) => ({ ...prev, parentPhone: e.target.value }))}
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentEmail">Parent Email</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={profile.parentEmail}
                      onChange={(e) => setProfile((prev) => ({ ...prev, parentEmail: e.target.value }))}
                      placeholder="parent@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="assignmentReminders">Assignment Reminders</Label>
                    <p className="text-sm text-gray-500">Get reminded about upcoming assignments</p>
                  </div>
                  <Switch
                    id="assignmentReminders"
                    checked={notifications.assignmentReminders}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, assignmentReminders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gradeUpdates">Grade Updates</Label>
                    <p className="text-sm text-gray-500">Notify when new grades are available</p>
                  </div>
                  <Switch
                    id="gradeUpdates"
                    checked={notifications.gradeUpdates}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, gradeUpdates: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="messageAlerts">Message Alerts</Label>
                    <p className="text-sm text-gray-500">Get notified of new messages</p>
                  </div>
                  <Switch
                    id="messageAlerts"
                    checked={notifications.messageAlerts}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, messageAlerts: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="eventReminders">Event Reminders</Label>
                    <p className="text-sm text-gray-500">Reminders for school events and activities</p>
                  </div>
                  <Switch
                    id="eventReminders"
                    checked={notifications.eventReminders}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, eventReminders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReports">Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Receive weekly academic progress reports</p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyReports: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control your privacy and data sharing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <p className="text-sm text-gray-500">Allow other students to see your profile</p>
                  </div>
                  <Switch
                    id="profileVisibility"
                    checked={privacy.profileVisibility}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, profileVisibility: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showGrades">Show Grades</Label>
                    <p className="text-sm text-gray-500">Display your grades on your profile</p>
                  </div>
                  <Switch
                    id="showGrades"
                    checked={privacy.showGrades}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showGrades: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showAttendance">Show Attendance</Label>
                    <p className="text-sm text-gray-500">Display your attendance record</p>
                  </div>
                  <Switch
                    id="showAttendance"
                    checked={privacy.showAttendance}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showAttendance: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowMessages">Allow Messages</Label>
                    <p className="text-sm text-gray-500">Allow teachers and admin to send you messages</p>
                  </div>
                  <Switch
                    id="allowMessages"
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, allowMessages: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePrivacySave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize how the portal looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-gray-500">Use dark theme for the interface</p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={appearance.darkMode}
                    onCheckedChange={(checked) => setAppearance((prev) => ({ ...prev, darkMode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compactView">Compact View</Label>
                    <p className="text-sm text-gray-500">Use a more compact layout</p>
                  </div>
                  <Switch
                    id="compactView"
                    checked={appearance.compactView}
                    onCheckedChange={(checked) => setAppearance((prev) => ({ ...prev, compactView: checked }))}
                  />
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <p className="text-sm text-gray-500 mb-2">Choose your preferred language</p>
                  <select
                    id="language"
                    value={appearance.language}
                    onChange={(e) => setAppearance((prev) => ({ ...prev, language: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="english">English</option>
                    <option value="hausa">Hausa</option>
                    <option value="yoruba">Yoruba</option>
                    <option value="igbo">Igbo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleAppearanceSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
