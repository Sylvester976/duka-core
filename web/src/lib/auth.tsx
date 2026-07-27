import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiClient } from '../api/client'

export interface DashboardUser {
  id: string
  name: string
  email: string
  role: 'owner' | 'staff' | 'platform_admin'
  tenant_id: string | null
}

interface AuthContextValue {
  user: DashboardUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    apiClient
      .get<DashboardUser>('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post<{ token: string; user: DashboardUser }>('/auth/login', {
      email,
      password,
    })
    localStorage.setItem('auth_token', data.token)
    setUser(data.user)
  }

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      localStorage.removeItem('auth_token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
