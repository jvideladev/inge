/**
 * POST /api/integracion/sincronizar-aprovisionadas
 * Dispara (manual o via cron) la lectura del WS externo de aprovisionamiento
 * y actualiza ingenierías Aprobada → Aprovisionada.
 *
 * Auth: X-Integration-Key
 * Requiere APROVISIONAMIENTO_WS_URL (si no, responde 503 con mensaje claro).
 */
import { NextResponse } from 'next/server'
import { assertIntegracionAuth } from '@/lib/integracion/auth'
import { sincronizarAprovisionadasDesdeExterno } from '@/lib/integracion/aprovisionamiento'

export async function POST(request: Request) {
  try {
    assertIntegracionAuth(request)
    const result = await sincronizarAprovisionadasDesdeExterno()

    if (!result.configured) {
      return NextResponse.json(
        {
          message: 'Web service de aprovisionamiento aún no configurado',
          hint: 'Definir APROVISIONAMIENTO_WS_URL (y opcional APROVISIONAMIENTO_API_KEY) cuando Totalplay entregue el contrato',
          ...result,
        },
        { status: 503 },
      )
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (e: any) {
    const status = e?.status ?? 500
    console.error('[POST /api/integracion/sincronizar-aprovisionadas]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status })
  }
}
