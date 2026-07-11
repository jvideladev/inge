/**
 * GET    /api/ingenierias/[id]  — Obtiene una ingeniería por ID
 * PATCH  /api/ingenierias/[id]  — Actualiza nodos y edges (guardado del canvas)
 * DELETE /api/ingenierias/[id]  — Elimina una ingeniería
 */
import { NextResponse } from 'next/server'
import { INGENIERIAS_MOCK } from '@/data/mock'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, context: Params) {
  const { id } = await context.params
  // TODO: const ing = await prisma.ingenieria.findUniqueOrThrow({ where: { id } })
  const ing = INGENIERIAS_MOCK.find((i) => i.id === id)
  if (!ing) return NextResponse.json({ message: 'No encontrada' }, { status: 404 })
  return NextResponse.json(ing)
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params
  const body = await request.json()
  // TODO: const updated = await prisma.ingenieria.update({ where: { id }, data: { ...body, modificadaEn: new Date() } })
  return NextResponse.json({ ...body, id, modificadaEn: new Date().toISOString() })
}

export async function DELETE(_req: Request, context: Params) {
  const { id } = await context.params
  // TODO: await prisma.ingenieria.update({ where: { id }, data: { activa: false } })
  return new NextResponse(null, { status: 204 })
}
