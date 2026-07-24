/**
 * Consumo del web service externo de aprovisionamiento (RFC / otro aplicativo).
 * Cuando una ingeniería resulta aprovisionada allá, actualizamos estado → Aprovisionada.
 *
 * Contrato del WS remoto: PENDIENTE de Totalplay.
 * Mientras tanto este módulo está listo para enchufar URL + key y un mapper.
 */
import { getIngenieriaById, updateEstado } from '@/lib/ingenierias.repo'
import type { AprovisionamientoExternoItem } from '@/types/integracion'

export type SyncAprovisionadasResult = {
  configured: boolean
  fetched: number
  updated: string[]
  skipped: { id: string; reason: string }[]
  errors: { id?: string; error: string }[]
}

function parseItems(body: unknown): AprovisionamientoExternoItem[] {
  if (!body || typeof body !== 'object') return []
  const obj = body as Record<string, unknown>
  const raw = Array.isArray(obj) ? obj : obj.items ?? obj.data ?? obj.ingenierias
  if (!Array.isArray(raw)) return []
  return raw
    .map((x) => {
      if (!x || typeof x !== 'object') return null
      const row = x as Record<string, unknown>
      const id = String(row.id ?? row.ingenieriaId ?? row.ingenieria_id ?? '').trim()
      if (!id) return null
      return {
        id,
        estado: row.estado != null ? String(row.estado) : undefined,
        aprovisionadaEn: row.aprovisionadaEn != null ? String(row.aprovisionadaEn) : undefined,
        referenciaRfc: row.referenciaRfc != null ? String(row.referenciaRfc) : undefined,
      } satisfies AprovisionamientoExternoItem
    })
    .filter(Boolean) as AprovisionamientoExternoItem[]
}

function pareceAprovisionada(item: AprovisionamientoExternoItem): boolean {
  const e = (item.estado ?? 'Aprovisionada').toLowerCase()
  return (
    e === 'aprovisionada' ||
    e === 'provisioned' ||
    e === 'aprovisionado' ||
    e === 'ok'
  )
}

/**
 * Llama al WS externo (si está configurado) y marca Aprobada → Aprovisionada.
 * Si APROVISIONAMIENTO_WS_URL no está definida, retorna configured: false.
 */
export async function sincronizarAprovisionadasDesdeExterno(): Promise<SyncAprovisionadasResult> {
  const url = process.env.APROVISIONAMIENTO_WS_URL?.trim()
  const result: SyncAprovisionadasResult = {
    configured: Boolean(url),
    fetched: 0,
    updated: [],
    skipped: [],
    errors: [],
  }

  if (!url) {
    result.errors.push({
      error: 'APROVISIONAMIENTO_WS_URL no configurada — sync omitido (pendiente de spec Totalplay)',
    })
    return result
  }

  try {
    const headers: Record<string, string> = { Accept: 'application/json' }
    const key = process.env.APROVISIONAMIENTO_API_KEY?.trim()
    if (key) {
      headers['X-Api-Key'] = key
      headers.Authorization = `Bearer ${key}`
    }

    const res = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30_000),
    })
    if (!res.ok) {
      result.errors.push({ error: `WS externo HTTP ${res.status}` })
      return result
    }

    const body = await res.json()
    const items = parseItems(body)
    result.fetched = items.length

    for (const item of items) {
      if (!pareceAprovisionada(item)) {
        result.skipped.push({ id: item.id, reason: `estado externo no aplicable: ${item.estado ?? '(vacío)'}` })
        continue
      }
      try {
        const local = await getIngenieriaById(item.id)
        if (!local) {
          result.skipped.push({ id: item.id, reason: 'no existe en este sistema' })
          continue
        }
        if (local.estado === 'Aprovisionada' || local.estado === 'Implementada') {
          result.skipped.push({ id: item.id, reason: `ya está en ${local.estado}` })
          continue
        }
        if (local.estado !== 'Aprobada') {
          result.skipped.push({ id: item.id, reason: `estado local ${local.estado} (se espera Aprobada)` })
          continue
        }
        await updateEstado(item.id, 'Aprovisionada', 'sistema-aprovisionamiento')
        result.updated.push(item.id)
      } catch (e: any) {
        result.errors.push({ id: item.id, error: e?.message ?? String(e) })
      }
    }
  } catch (e: any) {
    result.errors.push({ error: e?.message ?? String(e) })
  }

  return result
}
