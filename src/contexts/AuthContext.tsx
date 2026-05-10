import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { AppUser } from '@/types/database'
import { getSession, saveSession, clearSession } from '@/lib/session'

interface AuthUser extends Omit<AppUser, 'password_hash'> {}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (session) {
      setUser(session.user as AuthUser)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Error al iniciar sesión')
    }
    const data = await res.json()
    saveSession({
      user: data.user,
      token: data.token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
    setUser(data.user as AuthUser)
  }, [])

  const register = useCallback(async (email: string, name: string, password: string) => {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Error al registrarse')
    }
    const data = await res.json()
    saveSession({
      user: data.user,
      token: data.token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
    setUser(data.user as AuthUser)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
    const session = getSession()
    if (session) {
      saveSession({ ...session, user: { ...session.user, ...updates } })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
