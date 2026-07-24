export interface CfgDispositivoTipo {
  codigo: string
  label: string
  iconKey: string
  iconUrl: string | null
  orden: number
  columna: number
  colorFillLight: string
  colorStrokeLight: string
  colorFillDark: string
  colorStrokeDark: string
  colorMinimap: string
  activo: boolean
}

export interface CfgEnlaceTipo {
  codigo: string
  label: string
  stroke: string
  strokeWidth: number
  strokeDasharray: string | null
  orden: number
  activo: boolean
}

export interface CfgOrigen {
  codigo: string
  label: string
  color: string
  orden: number
  activo: boolean
}

export interface CfgCampoPanel {
  id: number
  entidad: 'dispositivo' | 'enlace'
  campoKey: string
  label: string
  grupo: 'raiz' | 'metadatos' | string
  tipoInput: string
  orden: number
  visible: boolean
  editable: boolean
  requerido: boolean
  activo: boolean
}

export interface AppConfig {
  dispositivos: CfgDispositivoTipo[]
  enlaces: CfgEnlaceTipo[]
  origenes: CfgOrigen[]
  camposDispositivo: CfgCampoPanel[]
  camposEnlace: CfgCampoPanel[]
}
