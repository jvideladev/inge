/**
 * GET    /api/ingenierias/[id]  — Detalle
 * PATCH  /api/ingenierias/[id]  — Guarda topología (solo editables)
 * DELETE /api/ingenierias/[id]  — Baja lógica (solo editables)
 */
import { NextResponse } from 'next/server'
import {
  getIngenieriaById,
  softDeleteIngenieria,
  updateTopologia,
} from '@/lib/ingenierias.repo'

interface Params { params: Promise<{ id: string }> }

function errorResponse(e: any) {
  const status = e?.status ?? 500
  return NextResponse.json({ message: e?.message ?? 'Error' }, { status })
}

export async function GET(_req: Request, context: Params) {
  try {
    const { id } = await context.params
    const ing = await getIngenieriaById(id)
    if (!ing) return NextResponse.json({ message: 'No encontrada' }, { status: 404 })
    return NextResponse.json(ing)
  } catch (e: any) {
    console.error('[GET /api/ingenierias/:id]', e)
    return errorResponse(e)
  }
}

export async function PATCH(request: Request, context: Params) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const usuario = body.usuario ?? body.creadaPor ?? 'Usuario'
    const updated = await updateTopologia(id, body.nodes ?? [], body.edges ?? [], usuario)
    return NextResponse.json(updated)
  } catch (e: any) {
    console.error('[PATCH /api/ingenierias/:id]', e)
    return errorResponse(e)
  }
}

export async function DELETE(_req: Request, context: Params) {
  try {
    const { id } = await context.params
    await softDeleteIngenieria(id)
    return new NextResponse(null, { status: 204 })
  } catch (e: any) {
    console.error('[DELETE /api/ingenierias/:id]', e)
    return errorResponse(e)
  }
}
