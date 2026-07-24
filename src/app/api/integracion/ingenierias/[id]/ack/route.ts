/**
 * POST /api/integracion/ingenierias/[id]/ack
 * El sistema consumidor confirma que tomó / guardó la ingeniería (ej. en Neo4j).
 * Body: { ok: true } | { ok: false, error: "..." }
 * Auth: X-Integration-Key
 */
import { NextResponse } from 'next/server'
import { assertIntegracionAuth } from '@/lib/integracion/auth'
import { getIngenieriaById, marcarPublicacionAck } from '@/lib/ingenierias.repo'

interface Params { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Params) {
  try {
    assertIntegracionAuth(request)
    const { id } = await context.params
    const body = await request.json().catch(() => ({}))
    const ok = body.ok !== false

    const ing = await getIngenieriaById(id)
    if (!ing) return NextResponse.json({ message: 'No encontrada' }, { status: 404 })
    if (ing.estado !== 'Aprobada') {
      return NextResponse.json({ message: 'Solo se puede confirmar ingenierías Aprobadas' }, { status: 409 })
    }

    const updated = await marcarPublicacionAck(id, ok, body.error)
    return NextResponse.json({
      id: updated.id,
      publicacionEstado: updated.publicacionEstado,
      publicacionEn: updated.publicacionEn,
      publicacionIntentos: updated.publicacionIntentos,
      publicacionError: updated.publicacionError,
    })
  } catch (e: any) {
    const status = e?.status ?? 500
    console.error('[POST /api/integracion/ingenierias/:id/ack]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status })
  }
}
