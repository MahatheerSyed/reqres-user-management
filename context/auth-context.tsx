"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  token: string | null
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for token in localStorage
    const storedToken = localStorage.getItem("token")
    setToken(storedToken)

    // Redirect to login if no token and not already on login page
    if (!storedToken && pathname !== "/") {
      router.push("/")
    }
  }, [pathname, router])

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    router.push("/")
  }

  return <AuthContext.Provider value={{ token, logout, isAuthenticated: !!token }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

