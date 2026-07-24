/**
 * Contrato de autenticación.
 * Implementaciones: local (MariaDB), futuro ldap / oauth / sso.
 */
export type AuthProviderName = 'local' | 'ldap' | 'oauth' | 'sso'

export interface AuthUser {
  id: string
  nombre: string
  email: string
  perfil: string
}

export interface AuthSession {
  token: string
  provider: AuthProviderName
  expiresAt: string
  user: AuthUser
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthProvider {
  readonly name: AuthProviderName
  login(credentials: LoginCredentials): Promise<AuthSession>
  validateToken(token: string): Promise<AuthUser | null>
  logout(token: string): Promise<void>
}
