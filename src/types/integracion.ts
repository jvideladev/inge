/**
 * Contrato de integración post-aprobación (RFC / aprovisionamiento).
 * Otro sistema consume este payload para el RFC; la vista HTML abre en popup.
 */
export type PublicacionEstado = 'pendiente' | 'publicada' | 'error'

export interface IngenieriaPublicacionPayload {
  /** Versión del contrato (para consumidores) */
  schemaVersion: '1.0' | '1.1'
  evento: 'ingenieria.aprobada'
  publicadoEn: string
  /**
   * URL HTML de solo lectura para abrir en popup / iframe del sistema RFC.
   * Auth de la página: pendiente de definición (hoy sin autenticación).
   */
  vistaUrl: string
  ingenieria: {
    id: string
    nombre: string
    cliente: string
    cuenta: string
    estado: string
    version: number
    creadaPor: string
    creadaEn: string
    modificadaEn: string
    publicacionEstado: PublicacionEstado | null
  }
  /** Topología React Flow (dispositivos + posiciones) */
  nodes: any[]
  /** Enlaces (simple/troncal + metadatos) */
  edges: any[]
}

export interface IngenieriaPublicacionResumen {
  id: string
  nombre: string
  cliente: string
  cuenta: string
  estado: string
  version: number
  modificadaEn: string
  publicacionEstado: PublicacionEstado | null
  publicacionEn: string | null
  publicacionIntentos: number
  /** URL HTML para popup RFC */
  vistaUrl: string
}

/**
 * Ítem esperado del web service externo de aprovisionamiento (contrato tentativo).
 * Se ajustará cuando Totalplay entregue el spec real.
 */
export interface AprovisionamientoExternoItem {
  id: string
  estado?: string
  aprovisionadaEn?: string
  referenciaRfc?: string
}
