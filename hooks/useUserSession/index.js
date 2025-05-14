"use client"

import { useState, useEffect } from 'react'

// Define the role types
export type UserRole = 'admin' | 'agent' | 'manager' | 'user' | undefined

// Mock function that would eventually be replaced with actual auth logic
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simulate auth check
    const checkAuth = async () => {
      // In a real app, this would check cookies, tokens, etc.
      // Check if we're in a browser environment before using localStorage
      if (typeof window !== 'undefined') {
        const userAuthState = localStorage.getItem('user_auth_state')
        setIsAuthenticated(userAuthState === 'authenticated')
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])
  
  return { isAuthenticated, isLoading }
}

// The main hook for accessing user session information
export function useUserSession() {
  const [role, setRole] = useState<UserRole>(undefined)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [user, setUser] = useState(null)
  const { isAuthenticated, isLoading } = useAuth()
  
  useEffect(() => {
    // In a real app, this would come from your auth provider
    if (isAuthenticated && typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('user_role') as UserRole
      const storedName = localStorage.getItem('user_name') || ''
      const storedEmail = localStorage.getItem('user_email') || ''
      
      setRole(storedRole || 'agent')  // Default to 'agent' if no role is found
      setName(storedName || 'Demo User')
      setEmail(storedEmail || 'user@example.com')
      
      // Set mock user object for components that expect this structure
      setUser({
        email: storedEmail || 'user@example.com',
        user_metadata: {
          name: storedName || 'Demo User'
        }
      })
    } else {
      setRole(undefined)
      setName('')
      setEmail('')
      setUser(null)
    }
  }, [isAuthenticated])
  
  // Function to update the user's role (for demo purposes)
  const setUserRole = (newRole: UserRole) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_role', newRole as string)
      setRole(newRole)
    }
  }
  
  // Login function (for demo purposes)
  const login = (userRole: UserRole = 'agent') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_auth_state', 'authenticated')
      localStorage.setItem('user_role', userRole as string)
      localStorage.setItem('user_name', 'Demo User')
      localStorage.setItem('user_email', 'user@example.com')
      setRole(userRole)
      setName('Demo User')
      setEmail('user@example.com')
    }
  }
  
  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_auth_state')
      localStorage.removeItem('user_role')
      localStorage.removeItem('user_name')
      localStorage.removeItem('user_email')
      setRole(undefined)
      setName('')
      setEmail('')
    }
  }
  
  return {
    isAuthenticated,
    isLoading,
    role,
    name,
    email,
    user,
    session: { user },
    setUserRole,
    login,
    logout
  }
}

// Export as default and named export for compatibility with different import styles
export default useUserSession 