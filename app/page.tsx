"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, Lock, Settings, Bug, Key } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data))

        // Redirect based on role
        switch (data.role) {
          case "admin":
            router.push("/admin")
            break
          case "teacher":
            router.push(`/teacher/${data.id}`)
            break
          case "student":
            router.push(`/student/${data.id}`)
            break
          default:
            setError("Unknown user role")
        }
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <img
              src="/placeholder.svg?height=60&width=60&text=WC"
              alt="Westminster College Logo"
              width={60}
              height={60}
              className="rounded-lg bg-white p-2"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Westminster College</h1>
              <p className="text-blue-200">Excellence in Education</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <blockquote className="text-xl text-white/90 mb-4">
            "Education is the most powerful weapon which you can use to change the world."
          </blockquote>
          <cite className="text-blue-200">- Nelson Mandela</cite>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-blue-200 text-sm">Students</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-blue-200 text-sm">Teachers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white">15+</div>
              <div className="text-blue-200 text-sm">Years</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="/placeholder.svg?height=80&width=80&text=WC"
              alt="Westminster College Logo"
              width={80}
              height={80}
              className="mx-auto rounded-lg bg-white p-2 shadow-lg mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Westminster College</h1>
            <p className="text-gray-600">School Management Portal</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-center text-gray-600">Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Need help?</p>
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" size="sm" onClick={() => router.push("/debug")} className="text-xs">
                      <Bug className="h-3 w-3 mr-1" />
                      Debug
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push("/setup")} className="text-xs">
                      <Settings className="h-3 w-3 mr-1" />
                      Setup
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/password-setup")}
                      className="text-xs"
                    >
                      <Key className="h-3 w-3 mr-1" />
                      Passwords
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center mb-2">Demo Credentials:</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    <strong>Admin:</strong> admin / admin123
                  </div>
                  <div>
                    <strong>Teacher:</strong> john.smith / teacher123
                  </div>
                  <div>
                    <strong>Student:</strong> [username] / student123
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
