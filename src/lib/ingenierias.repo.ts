import type { EstadoIngenieria, Ingenieria } from '@/types'
import { getPool, type ResultSetHeader, type RowDataPacket } from '@/lib/db'
import { normalizeEnlaceData } from '@/lib/enlace'
import { proyectarTopologia } from '@/lib/proyeccion'

interface IngenieriaRow extends RowDataPacket {
  id: string
  nombre: string
  cliente: string
  cuenta: string
  estado: EstadoIngenieria
  creada_por: string
  creada_en: Date | string
  modificada_en: Date | string
  nodes_json: string
  edges_json: string
  editable: number
  version_actual: number
  publicacion_estado?: string | null
  publicacion_en?: Date | string | null
  publicacion_error?: string | null
  publicacion_intentos?: number
}

function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toISOString()
}

function parseJsonArray(raw: string): any[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Asegura clase/miembros en edges (compatible con datos previos sin troncal). */
function normalizeEdges(edges: any[]): any[] {
  return (edges ?? []).map((edge) => ({
    ...edge,
    data: normalizeEnlaceData(edge?.data),
  }))
}

function mapRow(row: IngenieriaRow): Ingenieria {
  return {
    id: row.id,
    nombre: row.nombre,
    cliente: row.cliente,
    cuenta: row.cuenta,
    estado: row.estado,
    creadaPor: row.creada_por,
    creadaEn: toIso(row.creada_en),
    modificadaEn: toIso(row.modificada_en),
    nodes: parseJsonArray(row.nodes_json),
    edges: normalizeEdges(parseJsonArray(row.edges_json)),
    editable: Boolean(row.editable),
    versionActual: row.version_actual,
    publicacionEstado: (row.publicacion_estado as Ingenieria['publicacionEstado']) ?? null,
    publicacionEn: row.publicacion_en ? toIso(row.publicacion_en) : null,
    publicacionError: row.publicacion_error ?? null,
    publicacionIntentos: row.publicacion_intentos ?? 0,
  }
}

async function insertVersion(params: {
  ingenieriaId: string
  version: number
  estado: EstadoIngenieria
  nodes: any[]
  edges: any[]
  creadoPor: string
  nota?: string | null
}) {
  const pool = getPool()
  await pool.execute(
    `INSERT INTO ingenieria_versiones
      (ingenieria_id, version, estado, nodes_json, edges_json, nota, creado_por, creado_en)
     VALUES
      (:ingenieriaId, :version, :estado, :nodesJson, :edgesJson, :nota, :creadoPor, UTC_TIMESTAMP(3))`,
    {
      ingenieriaId: params.ingenieriaId,
      version: params.version,
      estado: params.estado,
      nodesJson: JSON.stringify(params.nodes ?? []),
      edgesJson: JSON.stringify(params.edges ?? []),
      nota: params.nota ?? null,
      creadoPor: params.creadoPor,
    },
  )
}

export async function listIngenierias(): Promise<Ingenieria[]> {
  const pool = getPool()
  const [rows] = await pool.query<IngenieriaRow[]>(
    `SELECT * FROM ingenierias WHERE activa = 1 ORDER BY modificada_en DESC`,
  )
  return rows.map(mapRow)
}

export async function getIngenieriaById(id: string): Promise<Ingenieria | null> {
  const pool = getPool()
  const [rows] = await pool.query<IngenieriaRow[]>(
    `SELECT * FROM ingenierias WHERE id = :id AND activa = 1 LIMIT 1`,
    { id },
  )
  return rows[0] ? mapRow(rows[0]) : null
}

export async function createIngenieria(
  data: Omit<Ingenieria, 'id' | 'creadaEn' | 'modificadaEn' | 'editable' | 'versionActual'> & {
    id?: string
    editable?: boolean
  },
): Promise<Ingenieria> {
  const pool = getPool()
  const id = data.id ?? `ing-${Date.now()}`
  const editable = data.editable ?? true
  const nodes = data.nodes ?? []
  const edges = data.edges ?? []

  await pool.execute(
    `INSERT INTO ingenierias
      (id, nombre, cliente, cuenta, estado, creada_por, creada_en, modificada_en,
       nodes_json, edges_json, editable, activa, version_actual)
     VALUES
      (:id, :nombre, :cliente, :cuenta, :estado, :creadaPor, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3),
       :nodesJson, :edgesJson, :editable, 1, 1)`,
    {
      id,
      nombre: data.nombre,
      cliente: data.cliente ?? '',
      cuenta: data.cuenta ?? '',
      estado: data.estado ?? 'En construcción',
      creadaPor: data.creadaPor,
      nodesJson: JSON.stringify(nodes),
      edgesJson: JSON.stringify(normalizeEdges(edges)),
      editable: editable ? 1 : 0,
    },
  )

  // Versiones históricas solo al pasar a Aprovisionada (no al crear)
  await proyectarTopologia(id, nodes, normalizeEdges(edges))

  const created = await getIngenieriaById(id)
  if (!created) throw new Error('No se pudo leer la ingeniería recién creada')
  return created
}

export async function updateTopologia(
  id: string,
  nodes: any[],
  edges: any[],
  usuario: string,
): Promise<Ingenieria> {
  const actual = await getIngenieriaById(id)
  if (!actual) throw Object.assign(new Error('No encontrada'), { status: 404 })
  if (!actual.editable) throw Object.assign(new Error('Ingeniería de demo: solo lectura'), { status: 403 })

  const pool = getPool()
  const edgesNorm = normalizeEdges(edges ?? [])

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE ingenierias
     SET nodes_json = :nodesJson,
         edges_json = :edgesJson,
         modificada_en = UTC_TIMESTAMP(3)
     WHERE id = :id AND editable = 1 AND activa = 1`,
    {
      id,
      nodesJson: JSON.stringify(nodes ?? []),
      edgesJson: JSON.stringify(edgesNorm),
    },
  )

  if (result.affectedRows === 0) {
    throw Object.assign(new Error('No se pudo guardar (bloqueada o inexistente)'), { status: 403 })
  }

  // Histórico de versiones: solo al pasar a Aprovisionada (no en cada guardado)
  await proyectarTopologia(id, nodes ?? [], edgesNorm)

  const updated = await getIngenieriaById(id)
  if (!updated) throw new Error('No se pudo leer tras guardar')
  return updated
}

export async function updateEstado(
  id: string,
  estado: EstadoIngenieria,
  usuario: string,
): Promise<Ingenieria> {
  const actual = await getIngenieriaById(id)
  if (!actual) throw Object.assign(new Error('No encontrada'), { status: 404 })
  if (!actual.editable) throw Object.assign(new Error('Ingeniería de demo: solo lectura'), { status: 403 })

  const pool = getPool()
  const marcaPublicacion = estado === 'Aprobada'
  const generaVersion = estado === 'Aprovisionada'
  const nextVersion = generaVersion ? (actual.versionActual ?? 0) + 1 : (actual.versionActual ?? 0)

  if (marcaPublicacion) {
    await pool.execute(
      `UPDATE ingenierias
       SET estado = :estado,
           modificada_en = UTC_TIMESTAMP(3),
           publicacion_estado = 'pendiente',
           publicacion_en = UTC_TIMESTAMP(3),
           publicacion_error = NULL,
           publicacion_intentos = COALESCE(publicacion_intentos, 0)
       WHERE id = :id AND editable = 1 AND activa = 1`,
      { id, estado },
    )
  } else if (generaVersion) {
    await pool.execute(
      `UPDATE ingenierias
       SET estado = :estado,
           modificada_en = UTC_TIMESTAMP(3),
           version_actual = :version
       WHERE id = :id AND editable = 1 AND activa = 1`,
      { id, estado, version: nextVersion },
    )
  } else {
    await pool.execute(
      `UPDATE ingenierias
       SET estado = :estado,
           modificada_en = UTC_TIMESTAMP(3)
       WHERE id = :id AND editable = 1 AND activa = 1`,
      { id, estado },
    )
  }

  if (generaVersion) {
    await insertVersion({
      ingenieriaId: id,
      version: nextVersion,
      estado,
      nodes: actual.nodes,
      edges: actual.edges,
      creadoPor: usuario,
      nota: `Versión histórica al aprovisionar (v${nextVersion})`,
    })
  }

  await proyectarTopologia(id, actual.nodes ?? [], actual.edges ?? [])

  const updated = await getIngenieriaById(id)
  if (!updated) throw new Error('No se pudo leer tras cambiar estado')
  return updated
}

export async function listIngenieriasParaIntegracion(opts?: {
  soloPendientes?: boolean
}): Promise<Ingenieria[]> {
  const pool = getPool()
  const soloPendientes = opts?.soloPendientes ?? false
  const [rows] = soloPendientes
    ? await pool.query<IngenieriaRow[]>(
        `SELECT * FROM ingenierias
         WHERE activa = 1 AND estado = 'Aprobada' AND publicacion_estado = 'pendiente'
         ORDER BY modificada_en ASC`,
      )
    : await pool.query<IngenieriaRow[]>(
        `SELECT * FROM ingenierias
         WHERE activa = 1 AND estado = 'Aprobada'
         ORDER BY modificada_en DESC`,
      )
  return rows.map(mapRow)
}

export async function marcarPublicacionAck(
  id: string,
  ok: boolean,
  errorMsg?: string,
): Promise<Ingenieria> {
  const pool = getPool()
  if (ok) {
    await pool.execute(
      `UPDATE ingenierias
       SET publicacion_estado = 'publicada',
           publicacion_en = UTC_TIMESTAMP(3),
           publicacion_error = NULL,
           publicacion_intentos = publicacion_intentos + 1,
           neo4j_sync_at = UTC_TIMESTAMP(3),
           modificada_en = UTC_TIMESTAMP(3)
       WHERE id = :id AND activa = 1`,
      { id },
    )
  } else {
    await pool.execute(
      `UPDATE ingenierias
       SET publicacion_estado = 'error',
           publicacion_en = UTC_TIMESTAMP(3),
           publicacion_error = :err,
           publicacion_intentos = publicacion_intentos + 1,
           modificada_en = UTC_TIMESTAMP(3)
       WHERE id = :id AND activa = 1`,
      { id, err: (errorMsg ?? 'Error de publicación').slice(0, 500) },
    )
  }
  const updated = await getIngenieriaById(id)
  if (!updated) throw Object.assign(new Error('No encontrada'), { status: 404 })
  return updated
}

export async function registrarIntentoPublicacion(
  id: string,
  ok: boolean,
  errorMsg?: string,
): Promise<void> {
  const pool = getPool()
  if (ok) {
    await pool.execute(
      `UPDATE ingenierias
       SET publicacion_intentos = publicacion_intentos + 1,
           publicacion_en = UTC_TIMESTAMP(3),
           publicacion_error = NULL
       WHERE id = :id`,
      { id },
    )
  } else {
    await pool.execute(
      `UPDATE ingenierias
       SET publicacion_estado = 'error',
           publicacion_intentos = publicacion_intentos + 1,
           publicacion_en = UTC_TIMESTAMP(3),
           publicacion_error = :err
       WHERE id = :id`,
      { id, err: (errorMsg ?? 'Error').slice(0, 500) },
    )
  }
}

export async function softDeleteIngenieria(id: string): Promise<void> {
  const actual = await getIngenieriaById(id)
  if (!actual) throw Object.assign(new Error('No encontrada'), { status: 404 })
  if (!actual.editable) throw Object.assign(new Error('Ingeniería de demo: no se puede eliminar'), { status: 403 })

  const pool = getPool()
  await pool.execute(
    `UPDATE ingenierias SET activa = 0, modificada_en = UTC_TIMESTAMP(3) WHERE id = :id AND editable = 1`,
    { id },
  )
}

export async function upsertDemoIngenieria(ing: Ingenieria): Promise<void> {
  const pool = getPool()
  await pool.execute(
    `INSERT INTO ingenierias
      (id, nombre, cliente, cuenta, estado, creada_por, creada_en, modificada_en,
       nodes_json, edges_json, editable, activa, version_actual)
     VALUES
      (:id, :nombre, :cliente, :cuenta, :estado, :creadaPor, :creadaEn, :modificadaEn,
       :nodesJson, :edgesJson, 0, 1, 1)
     ON DUPLICATE KEY UPDATE
       nombre = VALUES(nombre),
       cliente = VALUES(cliente),
       cuenta = VALUES(cuenta),
       estado = VALUES(estado),
       creada_por = VALUES(creada_por),
       nodes_json = VALUES(nodes_json),
       edges_json = VALUES(edges_json),
       editable = 0,
       activa = 1,
       modificada_en = VALUES(modificada_en)`,
    {
      id: ing.id,
      nombre: ing.nombre,
      cliente: ing.cliente,
      cuenta: ing.cuenta,
      estado: ing.estado,
      creadaPor: ing.creadaPor,
      creadaEn: new Date(ing.creadaEn),
      modificadaEn: new Date(ing.modificadaEn),
      nodesJson: JSON.stringify(ing.nodes ?? []),
      edgesJson: JSON.stringify(ing.edges ?? []),
    },
  )

  // Versión 1 solo si no existe
  await pool.execute(
    `INSERT IGNORE INTO ingenieria_versiones
      (ingenieria_id, version, estado, nodes_json, edges_json, nota, creado_por, creado_en)
     VALUES
      (:id, 1, :estado, :nodesJson, :edgesJson, 'Ingeniería demo (solo lectura)', :creadaPor, :creadaEn)`,
    {
      id: ing.id,
      estado: ing.estado,
      nodesJson: JSON.stringify(ing.nodes ?? []),
      edgesJson: JSON.stringify(ing.edges ?? []),
      creadaPor: ing.creadaPor,
      creadaEn: new Date(ing.creadaEn),
    },
  )

  await proyectarTopologia(ing.id, ing.nodes ?? [], normalizeEdges(ing.edges ?? []))
}
