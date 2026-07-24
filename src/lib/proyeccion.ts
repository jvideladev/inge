/**
 * Proyección híbrida: nodes/edges (foto) → tablas relacionales.
 * La fuente de verdad del canvas sigue siendo el JSON.
 */
import { getPool, type RowDataPacket } from '@/lib/db'
import { normalizeEnlaceData } from '@/lib/enlace'

function str(v: unknown, max = 255): string {
  if (v == null) return ''
  return String(v).slice(0, max)
}

function strOrNull(v: unknown, max = 255): string | null {
  const s = str(v, max).trim()
  return s ? s : null
}

function jsonOrNull(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0) {
    return null
  }
  try {
    return JSON.stringify(v)
  } catch {
    return null
  }
}

interface IfaceRow {
  dispositivo_id: string
  nombre: string
  rol: string | null
  etiqueta: string | null
  ip_segmento: string | null
  mascara: string | null
  gateway: string | null
  vlan: string | null
  descripcion: string | null
  origen_dato: 'explicita' | 'derivada'
  enlace_id: string
  custom_fields_json: string | null
}

/** Regenera la proyección relacional de una ingeniería desde su foto JSON. */
export async function proyectarTopologia(
  ingenieriaId: string,
  nodes: any[],
  edges: any[],
): Promise<void> {
  const pool = getPool()
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    await conn.execute(
      `DELETE FROM ingenieria_enlace_miembros WHERE ingenieria_id = :id`,
      { id: ingenieriaId },
    )
    await conn.execute(
      `DELETE FROM ingenieria_interfaces WHERE ingenieria_id = :id`,
      { id: ingenieriaId },
    )
    await conn.execute(
      `DELETE FROM ingenieria_enlaces WHERE ingenieria_id = :id`,
      { id: ingenieriaId },
    )
    await conn.execute(
      `DELETE FROM ingenieria_dispositivos WHERE ingenieria_id = :id`,
      { id: ingenieriaId },
    )

    const ifaces: IfaceRow[] = []
    const ifaceKey = new Set<string>()

    const pushIface = (row: IfaceRow) => {
      const nombre = row.nombre.trim()
      if (!nombre) return
      const key = `${row.dispositivo_id}|${nombre}|${row.enlace_id}`
      if (ifaceKey.has(key)) return
      ifaceKey.add(key)
      ifaces.push({ ...row, nombre })
    }

    for (const node of nodes ?? []) {
      if (!node?.id) continue
      const data = node.data ?? {}
      const meta = data.metadatos ?? {}

      await conn.execute(
        `INSERT INTO ingenieria_dispositivos
          (ingenieria_id, id, tipo, label, origen, registrado_cmdb,
           hostname, modelo, ip, serial, ubicacion, fabricante,
           pos_x, pos_y, custom_fields_json, proyectado_en)
         VALUES
          (:ingenieriaId, :id, :tipo, :label, :origen, :cmdb,
           :hostname, :modelo, :ip, :serial, :ubicacion, :fabricante,
           :posX, :posY, :customJson, UTC_TIMESTAMP(3))`,
        {
          ingenieriaId,
          id: str(node.id, 64),
          tipo: str(data.tipo, 64),
          label: str(data.label ?? meta.hostname ?? node.id, 255),
          origen: str(data.origen ?? 'Manual', 64),
          cmdb: data.registradoCMDB ? 1 : 0,
          hostname: strOrNull(meta.hostname, 128),
          modelo: strOrNull(meta.modelo, 128),
          ip: strOrNull(meta.ip, 64),
          serial: strOrNull(meta.serial, 128),
          ubicacion: strOrNull(meta.ubicacion, 255),
          fabricante: strOrNull(meta.fabricante, 128),
          posX: typeof node.position?.x === 'number' ? node.position.x : null,
          posY: typeof node.position?.y === 'number' ? node.position.y : null,
          customJson: jsonOrNull(meta.customFields),
        },
      )

      // Interfaces explícitas en el nodo (preparado para UI futura)
      const explicitas = Array.isArray(data.interfaces) ? data.interfaces : []
      for (const iface of explicitas) {
        pushIface({
          dispositivo_id: str(node.id, 64),
          nombre: str(iface?.nombre ?? iface?.name ?? '', 128),
          rol: strOrNull(iface?.rol, 32),
          etiqueta: strOrNull(iface?.etiqueta, 128),
          ip_segmento: strOrNull(iface?.ipSegmento ?? iface?.ip_segmento, 64),
          mascara: strOrNull(iface?.mascara, 64),
          gateway: strOrNull(iface?.gateway, 64),
          vlan: strOrNull(iface?.vlan, 64),
          descripcion: strOrNull(iface?.descripcion, 400),
          origen_dato: 'explicita',
          enlace_id: '',
          custom_fields_json: jsonOrNull(iface?.customFields),
        })
      }
    }

    for (const edge of edges ?? []) {
      if (!edge?.id) continue
      const data = normalizeEnlaceData(edge.data)
      const meta = data.metadatos
      const sourceId = str(edge.source, 64)
      const targetId = str(edge.target, 64)
      const edgeId = str(edge.id, 64)

      await conn.execute(
        `INSERT INTO ingenieria_enlaces
          (ingenieria_id, id, source_id, target_id, tipo, origen, registrado_cmdb,
           clase, troncal_codigo, uuid_enlace, numero_enlace,
           puerto_salida, etiqueta_salida, puerto_llegada, etiqueta_llegada,
           servicios, custom_fields_json, proyectado_en)
         VALUES
          (:ingenieriaId, :id, :sourceId, :targetId, :tipo, :origen, :cmdb,
           :clase, :troncal, :uuid, :numero,
           :pSalida, :eSalida, :pLlegada, :eLlegada,
           :servicios, :customJson, UTC_TIMESTAMP(3))`,
        {
          ingenieriaId,
          id: edgeId,
          sourceId,
          targetId,
          tipo: str(data.tipo, 64),
          origen: str(data.origen, 64),
          cmdb: data.registradoCMDB ? 1 : 0,
          clase: data.clase ?? 'simple',
          troncal: strOrNull(data.troncalCodigo, 128),
          uuid: strOrNull(meta.uuid, 128),
          numero: strOrNull(meta.numeroEnlace, 128),
          pSalida: strOrNull(meta.puertoSalida, 128),
          eSalida: strOrNull(meta.etiquetaSalida, 128),
          pLlegada: strOrNull(meta.puertoLlegada, 128),
          eLlegada: strOrNull(meta.etiquetaLlegada, 128),
          servicios: strOrNull(meta.servicios, 255),
          customJson: jsonOrNull(meta.customFields),
        },
      )

      if (meta.puertoSalida && sourceId) {
        pushIface({
          dispositivo_id: sourceId,
          nombre: str(meta.puertoSalida, 128),
          rol: 'salida',
          etiqueta: strOrNull(meta.etiquetaSalida, 128),
          ip_segmento: null,
          mascara: null,
          gateway: null,
          vlan: null,
          descripcion: null,
          origen_dato: 'derivada',
          enlace_id: edgeId,
          custom_fields_json: null,
        })
      }
      if (meta.puertoLlegada && targetId) {
        pushIface({
          dispositivo_id: targetId,
          nombre: str(meta.puertoLlegada, 128),
          rol: 'llegada',
          etiqueta: strOrNull(meta.etiquetaLlegada, 128),
          ip_segmento: null,
          mascara: null,
          gateway: null,
          vlan: null,
          descripcion: null,
          origen_dato: 'derivada',
          enlace_id: edgeId,
          custom_fields_json: null,
        })
      }

      if (data.clase === 'troncal' && Array.isArray(data.miembros)) {
        let orden = 0
        for (const m of data.miembros) {
          const dispId = str(m?.dispositivoId, 64)
          const interfaz = str(m?.interfaz, 128)
          if (!dispId || !interfaz) continue

          await conn.execute(
            `INSERT INTO ingenieria_enlace_miembros
              (ingenieria_id, enlace_id, dispositivo_id, interfaz, etiqueta, rol, orden, proyectado_en)
             VALUES
              (:ingenieriaId, :enlaceId, :dispositivoId, :interfaz, :etiqueta, :rol, :orden, UTC_TIMESTAMP(3))`,
            {
              ingenieriaId,
              enlaceId: edgeId,
              dispositivoId: dispId,
              interfaz,
              etiqueta: strOrNull(m?.etiqueta, 128),
              rol: strOrNull(m?.rol, 32),
              orden: orden++,
            },
          )

          pushIface({
            dispositivo_id: dispId,
            nombre: interfaz,
            rol: strOrNull(m?.rol, 32) ?? 'miembro',
            etiqueta: strOrNull(m?.etiqueta, 128),
            ip_segmento: null,
            mascara: null,
            gateway: null,
            vlan: null,
            descripcion: null,
            origen_dato: 'derivada',
            enlace_id: edgeId,
            custom_fields_json: null,
          })
        }
      }
    }

    for (const iface of ifaces) {
      await conn.execute(
        `INSERT INTO ingenieria_interfaces
          (ingenieria_id, dispositivo_id, nombre, rol, etiqueta,
           ip_segmento, mascara, gateway, vlan, descripcion,
           origen_dato, enlace_id, custom_fields_json, proyectado_en)
         VALUES
          (:ingenieriaId, :dispositivoId, :nombre, :rol, :etiqueta,
           :ipSeg, :mascara, :gateway, :vlan, :descripcion,
           :origenDato, :enlaceId, :customJson, UTC_TIMESTAMP(3))`,
        {
          ingenieriaId,
          dispositivoId: iface.dispositivo_id,
          nombre: iface.nombre,
          rol: iface.rol,
          etiqueta: iface.etiqueta,
          ipSeg: iface.ip_segmento,
          mascara: iface.mascara,
          gateway: iface.gateway,
          vlan: iface.vlan,
          descripcion: iface.descripcion,
          origenDato: iface.origen_dato,
          enlaceId: iface.enlace_id,
          customJson: iface.custom_fields_json,
        },
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

/** Proyecta todas las ingenierías activas (backfill). */
export async function proyectarTodasLasIngenierias(): Promise<{ id: string; ok: boolean; error?: string }[]> {
  const pool = getPool()
  const [rows] = await pool.query<
    (RowDataPacket & { id: string; nodes_json: string; edges_json: string })[]
  >(`SELECT id, nodes_json, edges_json FROM ingenierias WHERE activa = 1`)

  const results: { id: string; ok: boolean; error?: string }[] = []
  for (const row of rows) {
    try {
      const nodes = JSON.parse(row.nodes_json)
      const edges = JSON.parse(row.edges_json)
      await proyectarTopologia(row.id, Array.isArray(nodes) ? nodes : [], Array.isArray(edges) ? edges : [])
      results.push({ id: row.id, ok: true })
    } catch (e: any) {
      results.push({ id: row.id, ok: false, error: e?.message ?? String(e) })
    }
  }
  return results
}
