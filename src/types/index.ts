// ── Enums ─────────────────────────────────────────────────────────────────

export type EstadoIngenieria =
  | 'En construcción'
  | 'En revisión'
  | 'Aprobada'
  | 'Rechazada'
  | 'Aprovisionada'
  | 'Implementada'

export type OrigenObjeto = 'Discovery' | 'Excel' | 'Manual'

export type TipoEnlace = 'UTP' | 'Fibra' | 'Microonda' | 'Logico'

export type TipoDispositivo =
  | 'Router'
  | 'OLT'
  | 'Proveedor'
  | 'Firewall'
  | 'Medidor'
  | 'NubeTerceros'
  | 'CPE'
  | 'LAN'
  | 'Setup'
  | 'Switch'
  | 'ONT'
  | 'POP'
  | 'Colector'
  | 'NubeTP'
  | 'Radiobase'
  | 'AccessPoint'
  | 'Server'
  | 'Splitter'

export type PerfilUsuario = 'Operativo' | 'Supervisor' | 'Consulta'

export type EstadoPerfil = 'Activo' | 'Inactivo'

export interface PerfilSistema {
  id: string
  nombre: string
  descripcion: string
  estado: EstadoPerfil
  permisos: string[]
  usuariosAsignados: number
  creadoEn: string
  modificadoEn: string
}

// ── Metadatos ─────────────────────────────────────────────────────────────

export interface MetadatoDispositivo {
  hostname:    string
  modelo:      string
  ip:          string
  serial:      string
  ubicacion:   string
  fabricante:  string
  customFields: Record<string, string>
}

export interface MetadatoEnlace {
  uuid:           string
  numeroEnlace:   string
  puertoSalida:   string
  etiquetaSalida: string
  puertoLlegada:  string
  etiquetaLlegada:string
  servicios:      string
  customFields:   Record<string, string>
}

/**
 * Clase de enlace en el modelo de datos.
 * - simple: 1 par de puntas (puertoSalida / puertoLlegada en metadatos)
 * - troncal: 2..N interfaces miembro (lista `miembros`); el canvas sigue siendo 1 edge
 * La UX de troncales aún no está expuesta; el default es siempre `simple`.
 */
export type ClaseEnlace = 'simple' | 'troncal'

/** Miembro de una troncal (interfaz en un dispositivo del canvas). */
export interface MiembroTroncal {
  dispositivoId: string
  interfaz:      string
  etiqueta?:     string
  /** Rol opcional: A/B/miembro — para CMDB / validación futura */
  rol?:          'A' | 'B' | 'miembro' | string
}

// ── Nodos y Edges de React Flow ───────────────────────────────────────────

export interface DispositivoData {
  tipo:              TipoDispositivo
  label:             string
  origen:            OrigenObjeto
  registradoCMDB:    boolean
  /** Core de red; default false en alta manual, true si viene de Discovery */
  core:              boolean
  metadatos:         MetadatoDispositivo
}

export interface EnlaceData {
  tipo:           TipoEnlace
  origen:         OrigenObjeto
  registradoCMDB: boolean
  /** Core de red; default false en alta manual, true si viene de Discovery */
  core:           boolean
  metadatos:      MetadatoEnlace
  /** Default implícito: 'simple'. Sin impacto UX hasta que se implemente el editor de troncales. */
  clase?:         ClaseEnlace
  /** Id/número de troncal en CMDB u operación (solo si clase === 'troncal') */
  troncalCodigo?: string | null
  /** Interfaces miembro; vacío o ausente si es simple */
  miembros?:      MiembroTroncal[]
}

// ── Ingeniería ────────────────────────────────────────────────────────────

export interface Ingenieria {
  id:          string
  nombre:      string
  cliente:     string
  cuenta:      string
  estado:      EstadoIngenieria
  creadaPor:   string
  creadaEn:    string
  modificadaEn:string
  /** false = demo/plantilla de solo lectura */
  editable:    boolean
  /** Versión actual en BD (ingenieria_versiones.version) */
  versionActual?: number
  nodes:       any[]   // ReactFlow nodes
  edges:       any[]   // ReactFlow edges
  /** Estado de publicación hacia sistemas externos (Neo4j vía integrador) */
  publicacionEstado?: 'pendiente' | 'publicada' | 'error' | null
  publicacionEn?: string | null
  publicacionError?: string | null
  publicacionIntentos?: number
}

// ── Usuario mock ──────────────────────────────────────────────────────────

export interface Usuario {
  id:       string
  nombre:   string
  email:    string
  perfil:   PerfilUsuario
  /** Solo mock legacy; nunca viaja desde el API de auth */
  password?: string
}
