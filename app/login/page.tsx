"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ensureUserAndPatient } from "@/lib/supaHelpers"
import { createAuthError, logAuthError, getAuthErrorMessage } from "@/lib/errorHandling"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log("User already logged in, redirecting to dashboard")
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      console.log("Login attempt:", { email })
      
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        console.error("Login error:", authError)
        const error = createAuthError('login', authError.message, { email })
        logAuthError(error)
        setError(getAuthErrorMessage(error))
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        console.error("No user returned from login")
        const error = createAuthError('login', 'No user returned from login', { email })
        logAuthError(error)
        setError(getAuthErrorMessage(error))
        setIsLoading(false)
        return
      }

      console.log("Login successful, user:", authData.user.id)

      // Wait for session to be established
      let sessionEstablished = false
      let attempts = 0
      const maxAttempts = 10

      while (!sessionEstablished && attempts < maxAttempts) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          sessionEstablished = true
          console.log("Session established, redirecting to dashboard")
          break
        }
        await new Promise(resolve => setTimeout(resolve, 500))
        attempts++
      }

      if (!sessionEstablished) {
        console.error("Session not established after login")
        const error = createAuthError('session', 'Session not established after login', { email, userId: authData.user.id })
        logAuthError(error)
        setError(getAuthErrorMessage(error))
        setIsLoading(false)
        return
      }

      // Ensure user and patient records exist
      try {
        await ensureUserAndPatient()
        console.log("User and patient records ensured")
      } catch (error) {
        console.error("Error ensuring user/patient records:", error)
        // Continue anyway, this is not critical for the redirect
      }

      // Redirect to dashboard
      router.push("/dashboard")
      
    } catch (error) {
      console.error("Unexpected login error:", error)
      const authError = createAuthError('login', 'Unexpected login error', { error: error instanceof Error ? error.message : String(error), email })
      logAuthError(authError)
      setError(getAuthErrorMessage(authError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
            Welcome Back
          </CardTitle>
          <p className="text-muted-foreground">Sign in to your ElderGrid account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
