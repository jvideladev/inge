/**
 * GET /api/auth/me
 * Devuelve el usuario autenticado desde la sesión SSO/LDAP.
 */
import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: validar la sesión SSO y obtener el usuario:
  // const session = await getServerSession()
  // if (!session) return NextResponse.json({ message: 'No autenticado' }, { status: 401 })
  // const usuario = await prisma.usuario.findUnique({ where: { email: session.user.email } })
  // return NextResponse.json(usuario)

  // Mock temporal:
  return NextResponse.json({
    id:     'u1',
    nombre: 'Carlos Méndez',
    perfil: 'Operativo',
    email:  'cmendez@totalplay.com.mx',
  })
}
