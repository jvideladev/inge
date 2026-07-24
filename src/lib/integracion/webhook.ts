import { buildPublicacionPayload } from '@/lib/integracion/payload'
import type { Ingenieria } from '@/types'

/**
 * Aviso push opcional al aprobar.
 * Si INTEGRACION_WEBHOOK_URL está definida, POST del payload.
 * El otro sistema también puede hacer pull con GET /api/integracion/...
 */
export async function notifyPublicacionWebhook(ing: Ingenieria): Promise<{
  ok: boolean
  skipped?: boolean
  status?: number
  error?: string
}> {
  const url = process.env.INTEGRACION_WEBHOOK_URL?.trim()
  if (!url) return { ok: true, skipped: true }

  const payload = buildPublicacionPayload(ing, 'pendiente')
  const key = process.env.INTEGRACION_API_KEY?.trim()

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'X-Integration-Key': key } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { ok: false, status: res.status, error: text.slice(0, 400) || res.statusText }
    }
    return { ok: true, status: res.status }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Error de webhook' }
  }
}
