/**
 * GET  /api/ingenierias  — Lista ingenierías activas (MariaDB)
 * POST /api/ingenierias  — Crea una nueva ingeniería editable
 */
import { NextResponse } from 'next/server'
import { createIngenieria, listIngenierias } from '@/lib/ingenierias.repo'

export async function GET() {
  try {
    const ingenierias = await listIngenierias()
    return NextResponse.json(ingenierias)
  } catch (e: any) {
    console.error('[GET /api/ingenierias]', e)
    return NextResponse.json(
      { message: e?.message ?? 'Error al listar ingenierías' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const nueva = await createIngenieria({
      id: body.id,
      nombre: body.nombre,
      cliente: body.cliente ?? '',
      cuenta: body.cuenta ?? '',
      estado: body.estado ?? 'En construcción',
      creadaPor: body.creadaPor ?? 'Usuario',
      nodes: body.nodes ?? [],
      edges: body.edges ?? [],
      editable: true,
    })
    return NextResponse.json(nueva, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/ingenierias]', e)
    return NextResponse.json(
      { message: e?.message ?? 'Error al crear ingeniería' },
      { status: 500 },
    )
  }
}
