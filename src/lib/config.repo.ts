import { getPool, type ResultSetHeader, type RowDataPacket } from '@/lib/db'
import type {
  AppConfig,
  CfgCampoPanel,
  CfgDispositivoTipo,
  CfgEnlaceTipo,
  CfgOrigen,
} from '@/types/config'

interface DispRow extends RowDataPacket {
  codigo: string
  label: string
  icon_key: string
  icon_url: string | null
  orden: number
  columna: number
  color_fill_light: string
  color_stroke_light: string
  color_fill_dark: string
  color_stroke_dark: string
  color_minimap: string
  activo: number
}

interface EnlRow extends RowDataPacket {
  codigo: string
  label: string
  stroke: string
  stroke_width: number | string
  stroke_dasharray: string | null
  orden: number
  activo: number
}

interface OriRow extends RowDataPacket {
  codigo: string
  label: string
  color: string
  orden: number
  activo: number
}

interface CampoRow extends RowDataPacket {
  id: number
  entidad: 'dispositivo' | 'enlace'
  campo_key: string
  label: string
  grupo: string
  tipo_input: string
  orden: number
  visible: number
  editable: number
  requerido: number
  activo: number
}

function mapDisp(r: DispRow): CfgDispositivoTipo {
  return {
    codigo: r.codigo,
    label: r.label,
    iconKey: r.icon_key,
    iconUrl: r.icon_url,
    orden: r.orden,
    columna: r.columna,
    colorFillLight: r.color_fill_light,
    colorStrokeLight: r.color_stroke_light,
    colorFillDark: r.color_fill_dark,
    colorStrokeDark: r.color_stroke_dark,
    colorMinimap: r.color_minimap,
    activo: Boolean(r.activo),
  }
}

function mapEnl(r: EnlRow): CfgEnlaceTipo {
  return {
    codigo: r.codigo,
    label: r.label,
    stroke: r.stroke,
    strokeWidth: Number(r.stroke_width),
    strokeDasharray: r.stroke_dasharray,
    orden: r.orden,
    activo: Boolean(r.activo),
  }
}

function mapOri(r: OriRow): CfgOrigen {
  return {
    codigo: r.codigo,
    label: r.label,
    color: r.color,
    orden: r.orden,
    activo: Boolean(r.activo),
  }
}

function mapCampo(r: CampoRow): CfgCampoPanel {
  return {
    id: r.id,
    entidad: r.entidad,
    campoKey: r.campo_key,
    label: r.label,
    grupo: r.grupo,
    tipoInput: r.tipo_input,
    orden: r.orden,
    visible: Boolean(r.visible),
    editable: Boolean(r.editable),
    requerido: Boolean(r.requerido),
    activo: Boolean(r.activo),
  }
}

export async function getAppConfig(): Promise<AppConfig> {
  const pool = getPool()
  const [disps] = await pool.query<DispRow[]>(
    `SELECT * FROM cfg_dispositivo_tipo WHERE activo = 1 ORDER BY orden ASC, label ASC`,
  )
  const [enls] = await pool.query<EnlRow[]>(
    `SELECT * FROM cfg_enlace_tipo WHERE activo = 1 ORDER BY orden ASC, label ASC`,
  )
  const [oris] = await pool.query<OriRow[]>(
    `SELECT * FROM cfg_origen WHERE activo = 1 ORDER BY orden ASC, label ASC`,
  )
  const [campos] = await pool.query<CampoRow[]>(
    `SELECT * FROM cfg_campo_panel WHERE activo = 1 AND visible = 1 ORDER BY entidad, orden ASC`,
  )

  return {
    dispositivos: disps.map(mapDisp),
    enlaces: enls.map(mapEnl),
    origenes: oris.map(mapOri),
    camposDispositivo: campos.filter((c) => c.entidad === 'dispositivo').map(mapCampo),
    camposEnlace: campos.filter((c) => c.entidad === 'enlace').map(mapCampo),
  }
}

/** Lista completa para pantallas de admin (incluye inactivos) */
export async function listDispositivoTiposAdmin(): Promise<CfgDispositivoTipo[]> {
  const pool = getPool()
  const [rows] = await pool.query<DispRow[]>(
    `SELECT * FROM cfg_dispositivo_tipo ORDER BY orden ASC, label ASC`,
  )
  return rows.map(mapDisp)
}

export async function listEnlaceTiposAdmin(): Promise<CfgEnlaceTipo[]> {
  const pool = getPool()
  const [rows] = await pool.query<EnlRow[]>(
    `SELECT * FROM cfg_enlace_tipo ORDER BY orden ASC, label ASC`,
  )
  return rows.map(mapEnl)
}

export async function listCamposPanelAdmin(entidad?: 'dispositivo' | 'enlace'): Promise<CfgCampoPanel[]> {
  const pool = getPool()
  const [rows] = entidad
    ? await pool.query<CampoRow[]>(
        `SELECT * FROM cfg_campo_panel WHERE entidad = :entidad ORDER BY orden ASC`,
        { entidad },
      )
    : await pool.query<CampoRow[]>(`SELECT * FROM cfg_campo_panel ORDER BY entidad, orden ASC`)
  return rows.map(mapCampo)
}

export async function updateDispositivoTipo(
  codigo: string,
  data: Partial<CfgDispositivoTipo>,
): Promise<CfgDispositivoTipo> {
  const pool = getPool()
  const fields: string[] = []
  const params: Record<string, unknown> = { codigo }

  const map: Record<string, keyof CfgDispositivoTipo | string> = {
    label: 'label',
    iconKey: 'icon_key',
    iconUrl: 'icon_url',
    orden: 'orden',
    columna: 'columna',
    colorFillLight: 'color_fill_light',
    colorStrokeLight: 'color_stroke_light',
    colorFillDark: 'color_fill_dark',
    colorStrokeDark: 'color_stroke_dark',
    colorMinimap: 'color_minimap',
    activo: 'activo',
  }

  for (const [jsKey, col] of Object.entries(map)) {
    if ((data as any)[jsKey] !== undefined) {
      fields.push(`${col} = :${jsKey}`)
      params[jsKey] = jsKey === 'activo' ? ((data as any)[jsKey] ? 1 : 0) : (data as any)[jsKey]
    }
  }

  if (fields.length === 0) throw Object.assign(new Error('Sin cambios'), { status: 400 })

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE cfg_dispositivo_tipo SET ${fields.join(', ')} WHERE codigo = :codigo`,
    params as any,
  )
  if (result.affectedRows === 0) throw Object.assign(new Error('No encontrado'), { status: 404 })

  const [rows] = await pool.query<DispRow[]>(
    `SELECT * FROM cfg_dispositivo_tipo WHERE codigo = :codigo LIMIT 1`,
    { codigo },
  )
  return mapDisp(rows[0])
}

export async function updateEnlaceTipo(
  codigo: string,
  data: Partial<CfgEnlaceTipo>,
): Promise<CfgEnlaceTipo> {
  const pool = getPool()
  const fields: string[] = []
  const params: Record<string, unknown> = { codigo }

  const map: Record<string, string> = {
    label: 'label',
    stroke: 'stroke',
    strokeWidth: 'stroke_width',
    strokeDasharray: 'stroke_dasharray',
    orden: 'orden',
    activo: 'activo',
  }

  for (const [jsKey, col] of Object.entries(map)) {
    if ((data as any)[jsKey] !== undefined) {
      fields.push(`${col} = :${jsKey}`)
      params[jsKey] = jsKey === 'activo' ? ((data as any)[jsKey] ? 1 : 0) : (data as any)[jsKey]
    }
  }

  if (fields.length === 0) throw Object.assign(new Error('Sin cambios'), { status: 400 })

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE cfg_enlace_tipo SET ${fields.join(', ')} WHERE codigo = :codigo`,
    params as any,
  )
  if (result.affectedRows === 0) throw Object.assign(new Error('No encontrado'), { status: 404 })

  const [rows] = await pool.query<EnlRow[]>(
    `SELECT * FROM cfg_enlace_tipo WHERE codigo = :codigo LIMIT 1`,
    { codigo },
  )
  return mapEnl(rows[0])
}

export async function updateCampoPanel(
  id: number,
  data: Partial<CfgCampoPanel>,
): Promise<CfgCampoPanel> {
  const pool = getPool()
  const fields: string[] = []
  const params: Record<string, unknown> = { id }

  const map: Record<string, string> = {
    label: 'label',
    grupo: 'grupo',
    tipoInput: 'tipo_input',
    orden: 'orden',
    visible: 'visible',
    editable: 'editable',
    requerido: 'requerido',
    activo: 'activo',
  }

  for (const [jsKey, col] of Object.entries(map)) {
    if ((data as any)[jsKey] !== undefined) {
      fields.push(`${col} = :${jsKey}`)
      const v = (data as any)[jsKey]
      params[jsKey] = typeof v === 'boolean' ? (v ? 1 : 0) : v
    }
  }

  if (fields.length === 0) throw Object.assign(new Error('Sin cambios'), { status: 400 })

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE cfg_campo_panel SET ${fields.join(', ')} WHERE id = :id`,
    params as any,
  )
  if (result.affectedRows === 0) throw Object.assign(new Error('No encontrado'), { status: 404 })

  const [rows] = await pool.query<CampoRow[]>(
    `SELECT * FROM cfg_campo_panel WHERE id = :id LIMIT 1`,
    { id },
  )
  return mapCampo(rows[0])
}

export async function reorderDispositivos(codigosOrdenados: string[]): Promise<void> {
  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    for (let i = 0; i < codigosOrdenados.length; i++) {
      await conn.execute(
        `UPDATE cfg_dispositivo_tipo SET orden = ? WHERE codigo = ?`,
        [i + 1, codigosOrdenados[i]],
      )
    }
    await conn.commit()
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

export async function reorderCamposPanel(
  entidad: 'dispositivo' | 'enlace',
  idsOrdenados: number[],
): Promise<void> {
  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    for (let i = 0; i < idsOrdenados.length; i++) {
      await conn.execute(
        `UPDATE cfg_campo_panel SET orden = ? WHERE id = ? AND entidad = ?`,
        [i + 1, idsOrdenados[i], entidad],
      )
    }
    await conn.commit()
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}
