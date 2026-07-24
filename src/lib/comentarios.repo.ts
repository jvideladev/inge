import { getPool, type RowDataPacket } from '@/lib/db'

export interface IngenieriaComentario {
  id: number
  ingenieriaId: string
  usuario: string
  perfil: string | null
  texto: string
  estadoDestino: string | null
  creadoEn: string
}

interface ComentarioRow extends RowDataPacket {
  id: number
  ingenieria_id: string
  usuario: string
  perfil: string | null
  texto: string
  estado_destino: string | null
  creado_en: Date | string
}

function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toISOString()
}

function mapRow(row: ComentarioRow): IngenieriaComentario {
  return {
    id: row.id,
    ingenieriaId: row.ingenieria_id,
    usuario: row.usuario,
    perfil: row.perfil,
    texto: row.texto,
    estadoDestino: row.estado_destino,
    creadoEn: toIso(row.creado_en),
  }
}

export async function listComentarios(ingenieriaId: string): Promise<IngenieriaComentario[]> {
  const pool = getPool()
  const [rows] = await pool.query<ComentarioRow[]>(
    `SELECT * FROM ingenieria_comentarios
     WHERE ingenieria_id = :id
     ORDER BY creado_en ASC, id ASC`,
    { id: ingenieriaId },
  )
  return rows.map(mapRow)
}

export async function addComentario(params: {
  ingenieriaId: string
  usuario: string
  perfil?: string | null
  texto: string
  estadoDestino?: string | null
}): Promise<IngenieriaComentario> {
  const texto = params.texto.trim()
  if (!texto) throw Object.assign(new Error('Comentario vacío'), { status: 400 })

  const pool = getPool()
  const [result] = await pool.execute(
    `INSERT INTO ingenieria_comentarios
      (ingenieria_id, usuario, perfil, texto, estado_destino, creado_en)
     VALUES
      (:ingenieriaId, :usuario, :perfil, :texto, :estadoDestino, UTC_TIMESTAMP(3))`,
    {
      ingenieriaId: params.ingenieriaId,
      usuario: params.usuario,
      perfil: params.perfil ?? null,
      texto,
      estadoDestino: params.estadoDestino ?? null,
    },
  )
  const insertId = Number((result as { insertId?: number }).insertId)
  const [rows] = await pool.query<ComentarioRow[]>(
    `SELECT * FROM ingenieria_comentarios WHERE id = :id LIMIT 1`,
    { id: insertId },
  )
  if (!rows[0]) throw new Error('No se pudo leer el comentario')
  return mapRow(rows[0])
}
