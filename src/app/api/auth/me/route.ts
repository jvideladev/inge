/**
 * GET /api/auth/me — usuario de la sesión actual (provider-agnostic).
 */
import { NextResponse } from 'next/server'
import { getAuthProvider } from '@/lib/auth'
import { extractBearerToken } from '@/lib/auth/request'

export async function GET(request: Request) {
  try {
    const token = extractBearerToken(request)
    if (!token) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 })
    }
    const user = await getAuthProvider().validateToken(token)
    if (!user) {
      return NextResponse.json({ message: 'Sesión inválida o expirada' }, { status: 401 })
    }
    return NextResponse.json(user)
  } catch (e: any) {
    console.error('[GET /api/auth/me]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 500 })
  }
}
