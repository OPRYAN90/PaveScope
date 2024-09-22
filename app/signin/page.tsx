'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmail, signInWithGoogle } from '../../lib/auth'
import Link from 'next/link'
import { Button } from "../../components/Login/ui/button"
import { Input } from "../../components/Login/ui/input"
import { Label } from "../../components/Login/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Home } from 'lucide-react' // Import the Home icon

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await signInWithEmail(email, password)
      router.push('/dashboard')
    } catch (error) {
      console.error("Error signing in with email", error)
      setError('Failed to sign in. Please check your credentials and try again.')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      router.push('/dashboard')
    } catch (error) {
      console.error("Error signing in with Google", error)
      setError('Failed to sign in with Google. Please try again.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative">
      {/* Home button in the top-left corner */}
      <Link href="/" className="absolute top-4 left-4">
        <Button variant="ghost" size="icon" className="w-10 h-10">
          <Home className="h-6 w-6" />
        </Button>
      </Link>

      <div className="w-full max-w-md px-4 py-8">
        <Card className="overflow-hidden shadow-xl rounded-2xl border border-blue-100">
          <CardHeader className="space-y-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <CardTitle className="text-3xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-blue-100">
              Access your PaveScope account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                />
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Sign In
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter className="bg-gray-50 p-6 rounded-b-2xl">
            <p className="text-sm text-gray-600 text-center w-full">
              Don't have an account?{' '}
              <Link href="/get-started" className="font-medium text-blue-600 hover:underline transition duration-200">
                Get Started
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}