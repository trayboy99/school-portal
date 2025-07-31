"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Building2, Calendar, Users, BookOpen } from "lucide-react"
import { AcademicCalendarSection } from "./academic-calendar-section"
import { DepartmentsManagementSection } from "./departments-management-section"

export function SettingsSection() {
  const [activeTab, setActiveTab] = useState("academic")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>Configure system-wide settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="academic" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Academic Calendar
              </TabsTrigger>
              <TabsTrigger value="departments" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Departments
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Settings
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                System Config
              </TabsTrigger>
            </TabsList>

            <TabsContent value="academic" className="space-y-4">
              <AcademicCalendarSection />
            </TabsContent>

            <TabsContent value="departments" className="space-y-4">
              <DepartmentsManagementSection />
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management Settings
                  </CardTitle>
                  <CardDescription>Configure user roles, permissions, and authentication settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">User settings configuration coming soon...</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                  <CardDescription>Configure system-wide preferences and defaults</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">System configuration settings coming soon...</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
