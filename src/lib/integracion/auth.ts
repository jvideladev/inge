import type { NextRequest } from 'next/server'

/**
 * Autenticación simple para el API de integración.
 * Header: X-Integration-Key: <INTEGRACION_API_KEY>
 * Si INTEGRACION_API_KEY no está definida, en desarrollo se permite el acceso
 * (solo local); en production se exige la key.
 */
export function assertIntegracionAuth(request: Request | NextRequest): void {
  const expected = process.env.INTEGRACION_API_KEY?.trim()
  const isProd = process.env.NODE_ENV === 'production'

  if (!expected) {
    if (isProd) {
      throw Object.assign(new Error('INTEGRACION_API_KEY no configurada'), { status: 503 })
    }
    return
  }

  const provided =
    request.headers.get('x-integration-key') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!provided || provided !== expected) {
    throw Object.assign(new Error('No autorizado (integration key)'), { status: 401 })
  }
}
