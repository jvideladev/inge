/**
 * Factory del proveedor de autenticación.
 *
 * AUTH_PROVIDER=local   → MariaDB (actual)
 * AUTH_PROVIDER=ldap    → (pendiente) LDAP/AD
 * AUTH_PROVIDER=oauth   → (pendiente) OAuth2 / OIDC
 * AUTH_PROVIDER=sso     → (pendiente) SSO corporativo
 *
 * Las rutas /api/auth/* solo hablan con getAuthProvider().
 */
import type { AuthProvider, AuthProviderName } from '@/lib/auth/types'
import { LocalAuthProvider } from '@/lib/auth/local.provider'

let cached: AuthProvider | null = null

export function getAuthProvider(): AuthProvider {
  if (cached) return cached

  const name = (process.env.AUTH_PROVIDER ?? 'local').toLowerCase() as AuthProviderName

  switch (name) {
    case 'local':
      cached = new LocalAuthProvider()
      break
    case 'ldap':
    case 'oauth':
    case 'sso':
      // Placeholders: cuando existan, importar aquí el provider real.
      throw new Error(
        `AUTH_PROVIDER=${name} aún no está implementado. Usá AUTH_PROVIDER=local por ahora.`,
      )
    default:
      cached = new LocalAuthProvider()
  }

  return cached
}

export function resetAuthProviderCache() {
  cached = null
}
