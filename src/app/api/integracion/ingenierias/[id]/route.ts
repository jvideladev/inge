/**
 * GET /api/integracion/ingenierias/[id]
 * Payload completo de una ingeniería aprobada (nodes + edges + metadatos).
 * Auth: X-Integration-Key
 */
import { NextResponse } from 'next/server'
import { assertIntegracionAuth } from '@/lib/integracion/auth'
import { buildPublicacionPayload } from '@/lib/integracion/payload'
import { getIngenieriaById } from '@/lib/ingenierias.repo'

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Params) {
  try {
    assertIntegracionAuth(request)
    const { id } = await context.params
    const ing = await getIngenieriaById(id)
    if (!ing) {
      return NextResponse.json({ message: 'No encontrada' }, { status: 404 })
    }
    if (ing.estado !== 'Aprobada') {
      return NextResponse.json(
        { message: `La ingeniería no está Aprobada (estado actual: ${ing.estado})` },
        { status: 409 },
      )
    }

    const payload = buildPublicacionPayload(ing, ing.publicacionEstado ?? 'pendiente')
    return NextResponse.json(payload)
  } catch (e: any) {
    const status = e?.status ?? 500
    console.error('[GET /api/integracion/ingenierias/:id]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status })
  }
}
