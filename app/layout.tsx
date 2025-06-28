import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { TeacherAuthProvider } from "@/contexts/teacher-auth-context"
import { StudentAuthProvider } from "@/contexts/student-auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "School Portal",
  description: "Westminster School Management System",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TeacherAuthProvider>
            <StudentAuthProvider>{children}</StudentAuthProvider>
          </TeacherAuthProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
