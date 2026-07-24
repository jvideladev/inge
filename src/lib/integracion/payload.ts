import type { Ingenieria } from '@/types'
import type { IngenieriaPublicacionPayload, PublicacionEstado } from '@/types/integracion'
import { buildVistaUrl } from '@/lib/integracion/urls'

export function buildPublicacionPayload(
  ing: Ingenieria,
  publicacionEstado: PublicacionEstado | null = 'pendiente',
): IngenieriaPublicacionPayload {
  return {
    schemaVersion: '1.1',
    evento: 'ingenieria.aprobada',
    publicadoEn: new Date().toISOString(),
    vistaUrl: buildVistaUrl(ing.id),
    ingenieria: {
      id: ing.id,
      nombre: ing.nombre,
      cliente: ing.cliente,
      cuenta: ing.cuenta,
      estado: ing.estado,
      version: ing.versionActual ?? 1,
      creadaPor: ing.creadaPor,
      creadaEn: ing.creadaEn,
      modificadaEn: ing.modificadaEn,
      publicacionEstado,
    },
    nodes: ing.nodes ?? [],
    edges: ing.edges ?? [],
  }
}
