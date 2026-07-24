/**
 * GET  /api/ingenierias/[id]/comentarios — lista conversación
 * POST /api/ingenierias/[id]/comentarios — agrega comentario (sin cambiar estado)
 */
import { NextResponse } from 'next/server'
import { getIngenieriaById } from '@/lib/ingenierias.repo'
import { addComentario, listComentarios } from '@/lib/comentarios.repo'

interface Params { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: Params) {
  try {
    const { id } = await context.params
    const ing = await getIngenieriaById(id)
    if (!ing) return NextResponse.json({ message: 'No encontrada' }, { status: 404 })
    const items = await listComentarios(id)
    return NextResponse.json({ items })
  } catch (e: any) {
    console.error('[GET /api/ingenierias/:id/comentarios]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 500 })
  }
}

export async function POST(request: Request, context: Params) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const ing = await getIngenieriaById(id)
    if (!ing) return NextResponse.json({ message: 'No encontrada' }, { status: 404 })

    const created = await addComentario({
      ingenieriaId: id,
      usuario: body.usuario ?? 'Usuario',
      perfil: body.perfil ?? null,
      texto: body.texto ?? '',
      estadoDestino: body.estadoDestino ?? null,
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e: any) {
    const status = e?.status ?? 500
    console.error('[POST /api/ingenierias/:id/comentarios]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status })
  }
}
