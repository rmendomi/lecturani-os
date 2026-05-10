import type { AppUser } from '@/types/database'

const SESSION_KEY = 'cuento_contigo_session'

export interface SessionData {
  user: Omit<AppUser, 'password_hash'>
  token: string
  expiresAt: number
}

export function saveSession(data: SessionData): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data))
}

export function getSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SessionData
    if (Date.now() > data.expiresAt) {
      clearSession()
      return null
    }
    return data
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}

export function getCurrentUser(): Omit<AppUser, 'password_hash'> | null {
  return getSession()?.user ?? null
}
