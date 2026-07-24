/**
 * PATCH /api/ingenierias/[id]/estado — Cambia el estado (solo editables).
 * Body: { estado, usuario, perfil?, comentario? }
 * Rechazada exige comentario. En revisión acepta comentario opcional.
 * Si pasa a Aprobada: marca publicación pendiente y avisa webhook.
 * Si pasa a Aprovisionada: genera versión histórica.
 */
import { NextResponse } from 'next/server'
import { updateEstado, registrarIntentoPublicacion, getIngenieriaById } from '@/lib/ingenierias.repo'
import { addComentario } from '@/lib/comentarios.repo'
import { notifyPublicacionWebhook } from '@/lib/integracion/webhook'
import type { EstadoIngenieria } from '@/types'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Params) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const estado = body.estado as EstadoIngenieria
    const usuario = body.usuario ?? 'Usuario'
    const perfil = body.perfil ?? null
    const comentario = typeof body.comentario === 'string' ? body.comentario.trim() : ''

    if (!estado) {
      return NextResponse.json({ message: 'estado requerido' }, { status: 400 })
    }

    if (estado === 'Rechazada' && !comentario) {
      return NextResponse.json(
        { message: 'Al rechazar se requiere un comentario' },
        { status: 400 },
      )
    }

    let updated = await updateEstado(id, estado, usuario)

    if (comentario) {
      await addComentario({
        ingenieriaId: id,
        usuario,
        perfil,
        texto: comentario,
        estadoDestino: estado,
      })
    }

    let webhook: { ok: boolean; skipped?: boolean; error?: string } | undefined
    if (estado === 'Aprobada') {
      webhook = await notifyPublicacionWebhook(updated)
      if (!webhook.skipped) {
        await registrarIntentoPublicacion(id, webhook.ok, webhook.error)
        updated = (await getIngenieriaById(id)) ?? updated
      }
    }

    return NextResponse.json({ ...updated, webhook })
  } catch (e: any) {
    const status = e?.status ?? 500
    console.error('[PATCH /api/ingenierias/:id/estado]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status })
  }
}
