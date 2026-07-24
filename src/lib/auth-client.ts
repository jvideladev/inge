/** Clave de sesión en localStorage (solo cliente) */
export const AUTH_STORAGE_KEY = 'ingenierias-auth'

export interface StoredAuth {
  token: string
  provider: string
  expiresAt: string
  user: {
    id: string
    nombre: string
    email: string
    perfil: string
  }
}

export function readStoredAuth(): StoredAuth | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as StoredAuth
    if (!data?.token || !data?.user?.id) return null
    if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

export function writeStoredAuth(session: StoredAuth) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function authHeaders(): Record<string, string> {
  const session = readStoredAuth()
  if (!session?.token) return {}
  return { Authorization: `Bearer ${session.token}` }
}
