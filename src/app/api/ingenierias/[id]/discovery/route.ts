/**
 * POST /api/ingenierias/[id]/discovery
 * Mock de Discovery: requiere IP; reemplaza la topología con datos de ejemplo (core=true).
 * Cuando Totalplay entregue el servicio real, se cambia el conector en lib/discovery.
 */
import { NextResponse } from 'next/server'
import { getIngenieriaById, updateTopologia } from '@/lib/ingenierias.repo'
import { mockDiscoveryPorIp } from '@/lib/discovery/mock'
import { esEstadoEditableOperativo } from '@/lib/utils'

interface Params { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Params) {
  try {
    const { id } = await context.params
    const body = await request.json().catch(() => ({}))
    const ip = String(body.ip ?? '').trim()
    const usuario = String(body.usuario ?? 'Usuario')

    if (!ip) {
      return NextResponse.json({ message: 'Se requiere la IP para Discovery' }, { status: 400 })
    }

    const ing = await getIngenieriaById(id)
    if (!ing) return NextResponse.json({ message: 'No encontrada' }, { status: 404 })
    if (!ing.editable) {
      return NextResponse.json({ message: 'Ingeniería de demo: solo lectura' }, { status: 403 })
    }
    if (!esEstadoEditableOperativo(ing.estado)) {
      return NextResponse.json(
        { message: `Discovery solo en En construcción o Rechazada (estado: ${ing.estado})` },
        { status: 409 },
      )
    }

    // TODO: reemplazar mock por DISCOVERY_BASE_URL + API key de Totalplay
    const { nodes, edges } = mockDiscoveryPorIp(ip)
    const updated = await updateTopologia(id, nodes, edges, usuario)

    return NextResponse.json({
      ...updated,
      discovery: { mock: true, ip, message: 'Topología reemplazada con mock de Discovery' },
    })
  } catch (e: any) {
    const status = e?.status ?? 500
    console.error('[POST /api/ingenierias/:id/discovery]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status })
  }
}
