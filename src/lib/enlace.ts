import type { ClaseEnlace, EnlaceData, MiembroTroncal, OrigenObjeto, TipoEnlace } from '@/types'

const META_VACIA = {
  uuid: '',
  numeroEnlace: '',
  puertoSalida: '',
  etiquetaSalida: '',
  puertoLlegada: '',
  etiquetaLlegada: '',
  servicios: '',
  customFields: {} as Record<string, string>,
}

/** Crea un enlace simple (default de producto; sin UX de troncal). */
export function crearEnlaceSimple(params: {
  tipo: TipoEnlace
  origen?: OrigenObjeto
  registradoCMDB?: boolean
  core?: boolean
  metadatos?: Partial<EnlaceData['metadatos']>
}): EnlaceData {
  return {
    tipo: params.tipo,
    origen: params.origen ?? 'Manual',
    registradoCMDB: params.registradoCMDB ?? false,
    core: params.core ?? false,
    clase: 'simple',
    troncalCodigo: null,
    miembros: [],
    metadatos: { ...META_VACIA, ...params.metadatos, customFields: params.metadatos?.customFields ?? {} },
  }
}

/**
 * Normaliza data de edge legada (sin `clase` / `core`) a modelo actual.
 * No cambia comportamiento visual: todo lo sin clase queda como simple; core default false.
 */
export function normalizeEnlaceData(raw: Partial<EnlaceData> | null | undefined): EnlaceData {
  const base = raw ?? {}
  const clase: ClaseEnlace = base.clase === 'troncal' ? 'troncal' : 'simple'
  const miembros: MiembroTroncal[] = Array.isArray(base.miembros) ? base.miembros : []

  return {
    tipo: (base.tipo as TipoEnlace) || 'UTP',
    origen: (base.origen as OrigenObjeto) || 'Manual',
    registradoCMDB: Boolean(base.registradoCMDB),
    core: Boolean(base.core),
    clase,
    troncalCodigo: clase === 'troncal' ? (base.troncalCodigo ?? null) : null,
    miembros: clase === 'troncal' ? miembros : [],
    metadatos: {
      ...META_VACIA,
      ...(base.metadatos ?? {}),
      customFields: base.metadatos?.customFields ?? {},
    },
  }
}

/** True si el enlace es troncal con al menos 2 miembros (regla de negocio mínima). */
export function esTroncalValida(data: EnlaceData | null | undefined): boolean {
  if (!data || data.clase !== 'troncal') return false
  return (data.miembros?.length ?? 0) >= 2
}
