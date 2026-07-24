import type { NextRequest } from 'next/server'

/** Extrae el token Bearer o X-Auth-Token del request */
export function extractBearerToken(request: Request | NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (auth?.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim() || null
  }
  const custom = request.headers.get('x-auth-token')
  return custom?.trim() || null
}
