/**
 * GET  /api/ingenierias  — Lista todas las ingenierías del usuario
 * POST /api/ingenierias  — Crea una nueva ingeniería
 *
 * TODO: reemplazar los datos mock por consultas reales a la BD via Prisma
 * TODO: obtener el usuario autenticado desde la sesión SSO
 */
import { NextResponse } from 'next/server'
import { INGENIERIAS_MOCK } from '@/data/mock'

export async function GET() {
  // TODO: const usuario = await getAuthUser(request)
  // TODO: const ingenierias = await prisma.ingenieria.findMany({ where: { activa: true } })
  return NextResponse.json(INGENIERIAS_MOCK)
}

export async function POST(request: Request) {
  const body = await request.json()
  // TODO: const nueva = await prisma.ingenieria.create({ data: { ...body, creadaPor: usuario.id } })
  const nueva = { ...body, id: `ing-${Date.now()}`, creadaEn: new Date().toISOString(), modificadaEn: new Date().toISOString() }
  return NextResponse.json(nueva, { status: 201 })
}
