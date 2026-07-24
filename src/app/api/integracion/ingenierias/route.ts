/**
 * GET /api/integracion/ingenierias
 * Lista ingenierías Aprobadas para consumo externo (Neo4j / otros).
 * Query: ?pendientes=1 → solo publicacion_estado=pendiente
 * Auth: X-Integration-Key
 */
import { NextResponse } from 'next/server'
import { assertIntegracionAuth } from '@/lib/integracion/auth'
import { buildVistaUrl } from '@/lib/integracion/urls'
import { listIngenieriasParaIntegracion } from '@/lib/ingenierias.repo'
import type { IngenieriaPublicacionResumen } from '@/types/integracion'

export async function GET(request: Request) {
  try {
    assertIntegracionAuth(request)
    const { searchParams } = new URL(request.url)
    const soloPendientes = searchParams.get('pendientes') === '1'

    const list = await listIngenieriasParaIntegracion({ soloPendientes })
    const resumen: IngenieriaPublicacionResumen[] = list.map((ing) => ({
      id: ing.id,
      nombre: ing.nombre,
      cliente: ing.cliente,
      cuenta: ing.cuenta,
      estado: ing.estado,
      version: ing.versionActual ?? 1,
      modificadaEn: ing.modificadaEn,
      publicacionEstado: ing.publicacionEstado ?? null,
      publicacionEn: ing.publicacionEn ?? null,
      publicacionIntentos: ing.publicacionIntentos ?? 0,
      vistaUrl: buildVistaUrl(ing.id),
    }))

    return NextResponse.json({
      schemaVersion: '1.1',
      count: resumen.length,
      items: resumen,
    })
  } catch (e: any) {
    const status = e?.status ?? 500
    console.error('[GET /api/integracion/ingenierias]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status })
  }
}
