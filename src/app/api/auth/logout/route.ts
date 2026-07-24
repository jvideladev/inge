import { NextResponse } from 'next/server'
import { getAuthProvider } from '@/lib/auth'
import { extractBearerToken } from '@/lib/auth/request'

/** POST /api/auth/logout — invalida la sesión actual */
export async function POST(request: Request) {
  try {
    const token = extractBearerToken(request)
    if (token) await getAuthProvider().logout(token)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[POST /api/auth/logout]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 500 })
  }
}
