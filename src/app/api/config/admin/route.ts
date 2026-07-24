import { NextResponse } from 'next/server'
import {
  listCamposPanelAdmin,
  listDispositivoTiposAdmin,
  listEnlaceTiposAdmin,
  reorderCamposPanel,
  reorderDispositivos,
  updateCampoPanel,
  updateDispositivoTipo,
  updateEnlaceTipo,
} from '@/lib/config.repo'

/** GET /api/config/admin — todo (incl. inactivos) para pantallas de config */
export async function GET() {
  try {
    const [dispositivos, enlaces, campos] = await Promise.all([
      listDispositivoTiposAdmin(),
      listEnlaceTiposAdmin(),
      listCamposPanelAdmin(),
    ])
    return NextResponse.json({
      dispositivos,
      enlaces,
      camposDispositivo: campos.filter((c) => c.entidad === 'dispositivo'),
      camposEnlace: campos.filter((c) => c.entidad === 'enlace'),
    })
  } catch (e: any) {
    console.error('[GET /api/config/admin]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 500 })
  }
}

/** PATCH /api/config/admin — actualiza un ítem de configuración */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { kind } = body

    if (kind === 'dispositivo') {
      const updated = await updateDispositivoTipo(body.codigo, body.data ?? {})
      return NextResponse.json(updated)
    }
    if (kind === 'enlace') {
      const updated = await updateEnlaceTipo(body.codigo, body.data ?? {})
      return NextResponse.json(updated)
    }
    if (kind === 'campo') {
      const updated = await updateCampoPanel(Number(body.id), body.data ?? {})
      return NextResponse.json(updated)
    }
    if (kind === 'reorder-dispositivos') {
      await reorderDispositivos(body.codigos ?? [])
      return NextResponse.json({ ok: true })
    }
    if (kind === 'reorder-campos') {
      await reorderCamposPanel(body.entidad, body.ids ?? [])
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ message: 'kind inválido' }, { status: 400 })
  } catch (e: any) {
    const status = e?.status ?? 500
    console.error('[PATCH /api/config/admin]', e)
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status })
  }
}
