"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Bell, Shield, Database, Globe, Save, RefreshCw, Download, Upload } from "lucide-react"

export function SettingsSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const [generalSettings, setGeneralSettings] = useState({
    schoolName: "Westminster School",
    schoolAddress: "123 Education Avenue, Academic City",
    schoolPhone: "+234-XXX-XXXX",
    schoolEmail: "info@westminster.edu.ng",
    academicYear: "2023/2024",
    currentTerm: "First Term",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    attendanceAlerts: true,
    gradeUpdates: true,
    feeReminders: true,
  })

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    maintenanceMode: false,
    debugMode: false,
    sessionTimeout: "30",
  })

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true)
    setSuccess("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(`${section} settings saved successfully!`)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Manage school and system configurations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Settings
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Settings
          </Button>
        </div>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic school information and academic settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={generalSettings.schoolName}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, schoolName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="schoolEmail">School Email</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={generalSettings.schoolEmail}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, schoolEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="schoolAddress">School Address</Label>
                <Textarea
                  id="schoolAddress"
                  value={generalSettings.schoolAddress}
                  onChange={(e) => setGeneralSettings((prev) => ({ ...prev, schoolAddress: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="schoolPhone">School Phone</Label>
                  <Input
                    id="schoolPhone"
                    value={generalSettings.schoolPhone}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, schoolPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select
                    value={generalSettings.academicYear}
                    onValueChange={(value) => setGeneralSettings((prev) => ({ ...prev, academicYear: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023/2024">2023/2024</SelectItem>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2025/2026">2025/2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currentTerm">Current Term</Label>
                  <Select
                    value={generalSettings.currentTerm}
                    onValueChange={(value) => setGeneralSettings((prev) => ({ ...prev, currentTerm: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Term">First Term</SelectItem>
                      <SelectItem value="Second Term">Second Term</SelectItem>
                      <SelectItem value="Third Term">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings("General")} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how and when notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Send notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Send notifications via SMS</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, smsNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Send browser push notifications</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="attendanceAlerts">Attendance Alerts</Label>
                    <p className="text-sm text-gray-600">Alert for student absences</p>
                  </div>
                  <Switch
                    id="attendanceAlerts"
                    checked={notificationSettings.attendanceAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, attendanceAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gradeUpdates">Grade Updates</Label>
                    <p className="text-sm text-gray-600">Notify when grades are updated</p>
                  </div>
                  <Switch
                    id="gradeUpdates"
                    checked={notificationSettings.gradeUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, gradeUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="feeReminders">Fee Reminders</Label>
                    <p className="text-sm text-gray-600">Send fee payment reminders</p>
                  </div>
                  <Switch
                    id="feeReminders"
                    checked={notificationSettings.feeReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, feeReminders: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings("Notification")} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="passwordPolicy">Password Policy</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (6+ characters)</SelectItem>
                      <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                      <SelectItem value="high">High (12+ chars, symbols)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => setSystemSettings((prev) => ({ ...prev, sessionTimeout: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Login Attempt Limit</Label>
                    <p className="text-sm text-gray-600">Lock account after failed attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Whitelist</Label>
                    <p className="text-sm text-gray-600">Restrict access to specific IP addresses</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings("Security")} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>Configure system behavior and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Put system in maintenance mode</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings((prev) => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debugMode">Debug Mode</Label>
                    <p className="text-sm text-gray-600">Enable detailed error logging</p>
                  </div>
                  <Switch
                    id="debugMode"
                    checked={systemSettings.debugMode}
                    onCheckedChange={(checked) => setSystemSettings((prev) => ({ ...prev, debugMode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup">Automatic Backup</Label>
                    <p className="text-sm text-gray-600">Enable automatic database backups</p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings((prev) => ({ ...prev, autoBackup: checked }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select
                  value={systemSettings.backupFrequency}
                  onValueChange={(value) => setSystemSettings((prev) => ({ ...prev, backupFrequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings("System")} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Backup & Restore
              </CardTitle>
              <CardDescription>Manage database backups and system restore</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Create Backup</h3>
                  <p className="text-sm text-gray-600 mb-4">Create a manual backup of the database</p>
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Create Backup
                  </Button>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Restore Database</h3>
                  <p className="text-sm text-gray-600 mb-4">Restore from a previous backup</p>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Upload className="mr-2 h-4 w-4" />
                    Restore Backup
                  </Button>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Recent Backups</h3>
                <div className="space-y-2">
                  {[
                    { date: "2024-01-15 10:30 AM", size: "45.2 MB", type: "Automatic" },
                    { date: "2024-01-14 10:30 AM", size: "44.8 MB", type: "Automatic" },
                    { date: "2024-01-13 02:15 PM", size: "44.5 MB", type: "Manual" },
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{backup.date}</p>
                        <p className="text-sm text-gray-600">
                          {backup.size} • {backup.type}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
