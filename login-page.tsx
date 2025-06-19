"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Lock, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      const success = await login(username, password)
      if (success) {
        // Redirect based on user type will be handled by the dashboard component
        router.push("/")
      } else {
        setError("Invalid email or password. Please try again.")
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
        {/* Left Panel - School Branding */}
        <div className="bg-slate-900 p-8 flex flex-col justify-center items-center text-white relative">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-24 h-24 border-4 border-white rounded-lg flex items-center justify-center mb-6">
              <div className="text-4xl font-bold">W</div>
            </div>
          </div>

          {/* School Name */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Westminster</h1>
            <h2 className="text-4xl font-bold mb-2">College</h2>
            <h3 className="text-4xl font-bold">Lagos</h3>
          </div>

          {/* Tagline */}
          <p className="text-lg text-center opacity-90">"Nurturing Excellence, Shaping Futures."</p>
        </div>

        {/* Right Panel - Login Form */}
        <div className="p-8 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the school portal</h2>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Sign in to your account</h3>
              <p className="text-sm text-gray-600">Students, Teachers, Parents & Admin can login here</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="username"
                    type="email"
                    placeholder="Enter your email address"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6 text-center">
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <strong>Test Credentials:</strong>
                </p>
                <p>Admin: admin / password</p>
                <p>Teacher: [teacher-email] / teacher123</p>
                <p>Student: [student-email] / student123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
