/**
 * Seed de configuración desde los valores hardcodeados actuales.
 * Uso: npx tsx scripts/seed-config.ts
 */
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const DISPOSITIVOS = [
  { codigo: 'Router', label: 'Router', icon_key: 'Router', orden: 1, columna: 1, color_fill_light: '#EFF6FF', color_stroke_light: '#2563EB', color_fill_dark: '#1E3A5F', color_stroke_dark: '#2563EB', color_minimap: '#2563EB' },
  { codigo: 'OLT', label: 'OLT', icon_key: 'OLT', orden: 2, columna: 1, color_fill_light: '#F5F3FF', color_stroke_light: '#7C3AED', color_fill_dark: '#180D36', color_stroke_dark: '#7C3AED', color_minimap: '#7C3AED' },
  { codigo: 'Proveedor', label: 'Proveedor', icon_key: 'Proveedor', orden: 3, columna: 1, color_fill_light: '#EFF6FF', color_stroke_light: '#3B82F6', color_fill_dark: '#0B1F3A', color_stroke_dark: '#3B82F6', color_minimap: '#3B82F6' },
  { codigo: 'Firewall', label: 'Firewall', icon_key: 'Firewall', orden: 4, columna: 1, color_fill_light: '#FEF2F2', color_stroke_light: '#DC2626', color_fill_dark: '#2A0A0A', color_stroke_dark: '#DC2626', color_minimap: '#DC2626' },
  { codigo: 'Medidor', label: 'Medidor', icon_key: 'Medidor', orden: 5, columna: 1, color_fill_light: '#F0FDF4', color_stroke_light: '#16A34A', color_fill_dark: '#0A1F10', color_stroke_dark: '#16A34A', color_minimap: '#16A34A' },
  { codigo: 'NubeTerceros', label: 'Nube terceros', icon_key: 'NubeTerceros', orden: 6, columna: 1, color_fill_light: '#F8FAFC', color_stroke_light: '#64748B', color_fill_dark: '#0F172A', color_stroke_dark: '#64748B', color_minimap: '#64748B' },
  { codigo: 'CPE', label: 'CPE', icon_key: 'CPE', orden: 7, columna: 1, color_fill_light: '#FFFBEB', color_stroke_light: '#D97706', color_fill_dark: '#1C1408', color_stroke_dark: '#D97706', color_minimap: '#D97706' },
  { codigo: 'LAN', label: 'LAN', icon_key: 'LAN', orden: 8, columna: 1, color_fill_light: '#EFF6FF', color_stroke_light: '#2563EB', color_fill_dark: '#0B1F3A', color_stroke_dark: '#2563EB', color_minimap: '#2563EB' },
  { codigo: 'Setup', label: 'Setup', icon_key: 'Setup', orden: 9, columna: 1, color_fill_light: '#FAF5FF', color_stroke_light: '#7C3AED', color_fill_dark: '#180D36', color_stroke_dark: '#7C3AED', color_minimap: '#7C3AED' },
  { codigo: 'Switch', label: 'Switch', icon_key: 'Switch', orden: 10, columna: 2, color_fill_light: '#F0FDFA', color_stroke_light: '#0D9488', color_fill_dark: '#052018', color_stroke_dark: '#0D9488', color_minimap: '#0D9488' },
  { codigo: 'ONT', label: 'ONT', icon_key: 'ONT', orden: 11, columna: 2, color_fill_light: '#FFFBEB', color_stroke_light: '#D97706', color_fill_dark: '#1C1408', color_stroke_dark: '#D97706', color_minimap: '#D97706' },
  { codigo: 'POP', label: 'POP', icon_key: 'POP', orden: 12, columna: 2, color_fill_light: '#ECFEFF', color_stroke_light: '#0891B2', color_fill_dark: '#042F2E', color_stroke_dark: '#0891B2', color_minimap: '#0891B2' },
  { codigo: 'Colector', label: 'Colector', icon_key: 'Colector', orden: 13, columna: 2, color_fill_light: '#F0FDF4', color_stroke_light: '#059669', color_fill_dark: '#052e1a', color_stroke_dark: '#059669', color_minimap: '#059669' },
  { codigo: 'NubeTP', label: 'Nube TP', icon_key: 'NubeTP', orden: 14, columna: 2, color_fill_light: '#EFF6FF', color_stroke_light: '#1D4ED8', color_fill_dark: '#0B1F3A', color_stroke_dark: '#1D4ED8', color_minimap: '#1D4ED8' },
  { codigo: 'Radiobase', label: 'Radiobase', icon_key: 'Radiobase', orden: 15, columna: 2, color_fill_light: '#FAF5FF', color_stroke_light: '#9333EA', color_fill_dark: '#1E0A36', color_stroke_dark: '#9333EA', color_minimap: '#9333EA' },
  { codigo: 'AccessPoint', label: 'Access point', icon_key: 'AccessPoint', orden: 16, columna: 2, color_fill_light: '#FFF7ED', color_stroke_light: '#EA580C', color_fill_dark: '#1C1008', color_stroke_dark: '#EA580C', color_minimap: '#EA580C' },
  { codigo: 'Server', label: 'Server', icon_key: 'Server', orden: 17, columna: 2, color_fill_light: '#F0FDF4', color_stroke_light: '#16A34A', color_fill_dark: '#0A1F10', color_stroke_dark: '#16A34A', color_minimap: '#16A34A' },
  { codigo: 'Splitter', label: 'Splitter', icon_key: 'Splitter', orden: 18, columna: 2, color_fill_light: '#FAF5FF', color_stroke_light: '#A855F7', color_fill_dark: '#1E0A36', color_stroke_dark: '#A855F7', color_minimap: '#A855F7' },
]

const ENLACES = [
  { codigo: 'UTP', label: 'Enlace UTP', stroke: '#2563EB', stroke_width: 2, stroke_dasharray: null, orden: 1 },
  { codigo: 'Fibra', label: 'Fibra óptica', stroke: '#D97706', stroke_width: 2, stroke_dasharray: null, orden: 2 },
  { codigo: 'Microonda', label: 'Microonda', stroke: '#7C3AED', stroke_width: 2, stroke_dasharray: '8 4', orden: 3 },
  { codigo: 'Logico', label: 'Enlace lógico', stroke: '#0D9488', stroke_width: 1.5, stroke_dasharray: '3 3', orden: 4 },
]

const ORIGENES = [
  { codigo: 'Discovery', label: 'Discovery', color: '#16A34A', orden: 1 },
  { codigo: 'Excel', label: 'Excel', color: '#2563EB', orden: 2 },
  { codigo: 'Manual', label: 'Manual', color: '#CA8A04', orden: 3 },
]

const CAMPOS_DISP = [
  { campo_key: 'label', label: 'Nombre', grupo: 'raiz', orden: 1 },
  { campo_key: 'hostname', label: 'Hostname', grupo: 'metadatos', orden: 2 },
  { campo_key: 'modelo', label: 'Modelo', grupo: 'metadatos', orden: 3 },
  { campo_key: 'ip', label: 'IP / Dirección', grupo: 'metadatos', orden: 4 },
  { campo_key: 'serial', label: 'Serial', grupo: 'metadatos', orden: 5 },
  { campo_key: 'ubicacion', label: 'Ubicación', grupo: 'metadatos', orden: 6 },
  { campo_key: 'fabricante', label: 'Fabricante', grupo: 'metadatos', orden: 7 },
]

const CAMPOS_ENL = [
  { campo_key: 'numeroEnlace', label: 'Nombre enlace', grupo: 'metadatos', orden: 1 },
  { campo_key: 'uuid', label: 'UUID', grupo: 'metadatos', orden: 2 },
  { campo_key: 'puertoSalida', label: 'Puerto origen', grupo: 'metadatos', orden: 3 },
  { campo_key: 'etiquetaSalida', label: 'Etiqueta origen', grupo: 'metadatos', orden: 4 },
  { campo_key: 'puertoLlegada', label: 'Puerto destino', grupo: 'metadatos', orden: 5 },
  { campo_key: 'etiquetaLlegada', label: 'Etiqueta destino', grupo: 'metadatos', orden: 6 },
  { campo_key: 'servicios', label: 'Servicios', grupo: 'metadatos', orden: 7 },
]

async function main() {
  const { getPool } = await import('../src/lib/db')
  const pool = getPool()

  for (const d of DISPOSITIVOS) {
    await pool.execute(
      `INSERT INTO cfg_dispositivo_tipo
        (codigo, label, icon_key, orden, columna, color_fill_light, color_stroke_light,
         color_fill_dark, color_stroke_dark, color_minimap, activo)
       VALUES
        (:codigo, :label, :icon_key, :orden, :columna, :color_fill_light, :color_stroke_light,
         :color_fill_dark, :color_stroke_dark, :color_minimap, 1)
       ON DUPLICATE KEY UPDATE
         label=VALUES(label), icon_key=VALUES(icon_key), orden=VALUES(orden), columna=VALUES(columna),
         color_fill_light=VALUES(color_fill_light), color_stroke_light=VALUES(color_stroke_light),
         color_fill_dark=VALUES(color_fill_dark), color_stroke_dark=VALUES(color_stroke_dark),
         color_minimap=VALUES(color_minimap), activo=1`,
      d,
    )
  }

  for (const e of ENLACES) {
    await pool.execute(
      `INSERT INTO cfg_enlace_tipo
        (codigo, label, stroke, stroke_width, stroke_dasharray, orden, activo)
       VALUES
        (:codigo, :label, :stroke, :stroke_width, :stroke_dasharray, :orden, 1)
       ON DUPLICATE KEY UPDATE
         label=VALUES(label), stroke=VALUES(stroke), stroke_width=VALUES(stroke_width),
         stroke_dasharray=VALUES(stroke_dasharray), orden=VALUES(orden), activo=1`,
      e,
    )
  }

  for (const o of ORIGENES) {
    await pool.execute(
      `INSERT INTO cfg_origen (codigo, label, color, orden, activo)
       VALUES (:codigo, :label, :color, :orden, 1)
       ON DUPLICATE KEY UPDATE label=VALUES(label), color=VALUES(color), orden=VALUES(orden), activo=1`,
      o,
    )
  }

  for (const c of CAMPOS_DISP) {
    await pool.execute(
      `INSERT INTO cfg_campo_panel
        (entidad, campo_key, label, grupo, tipo_input, orden, visible, editable, requerido, activo)
       VALUES
        ('dispositivo', :campo_key, :label, :grupo, 'text', :orden, 1, 1, 0, 1)
       ON DUPLICATE KEY UPDATE label=VALUES(label), grupo=VALUES(grupo), orden=VALUES(orden), visible=1, editable=1, activo=1`,
      c,
    )
  }

  for (const c of CAMPOS_ENL) {
    await pool.execute(
      `INSERT INTO cfg_campo_panel
        (entidad, campo_key, label, grupo, tipo_input, orden, visible, editable, requerido, activo)
       VALUES
        ('enlace', :campo_key, :label, :grupo, 'text', :orden, 1, 1, 0, 1)
       ON DUPLICATE KEY UPDATE label=VALUES(label), grupo=VALUES(grupo), orden=VALUES(orden), visible=1, editable=1, activo=1`,
      c,
    )
  }

  const [[{ c: nDisp }]]: any = await pool.query('SELECT COUNT(*) c FROM cfg_dispositivo_tipo')
  const [[{ c: nEnl }]]: any = await pool.query('SELECT COUNT(*) c FROM cfg_enlace_tipo')
  const [[{ c: nOri }]]: any = await pool.query('SELECT COUNT(*) c FROM cfg_origen')
  const [[{ c: nCam }]]: any = await pool.query('SELECT COUNT(*) c FROM cfg_campo_panel')
  console.log(`OK — dispositivos:${nDisp} enlaces:${nEnl} origenes:${nOri} campos:${nCam}`)
  await pool.end()
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
