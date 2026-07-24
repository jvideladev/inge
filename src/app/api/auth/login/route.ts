import { NextResponse } from 'next/server'
import { getAuthProvider } from '@/lib/auth'

/** POST /api/auth/login — { email, password } → sesión */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await getAuthProvider().login({
      email: body.email ?? body.usuario ?? '',
      password: body.password ?? '',
    })
    return NextResponse.json(session)
  } catch (e: any) {
    const status = e?.status ?? 500
    console.error('[POST /api/auth/login]', e?.message ?? e)
    return NextResponse.json(
      { message: e?.message ?? 'Error de autenticación' },
      { status },
    )
  }
}
