// ── Enums ─────────────────────────────────────────────────────────────────

export type EstadoIngenieria =
  | 'Nueva'
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

// ── Nodos y Edges de React Flow ───────────────────────────────────────────

export interface DispositivoData {
  tipo:              TipoDispositivo
  label:             string
  origen:            OrigenObjeto
  registradoCMDB:    boolean
  metadatos:         MetadatoDispositivo
}

export interface EnlaceData {
  tipo:           TipoEnlace
  origen:         OrigenObjeto
  registradoCMDB: boolean
  metadatos:      MetadatoEnlace
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
  nodes:       any[]   // ReactFlow nodes
  edges:       any[]   // ReactFlow edges
}

// ── Usuario mock ──────────────────────────────────────────────────────────

export interface Usuario {
  id:       string
  nombre:   string
  email:    string
  password: string
  perfil:   PerfilUsuario
}
