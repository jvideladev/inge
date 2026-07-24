import { NextResponse } from 'next/server'
import { getAppConfig } from '@/lib/config.repo'

/** GET /api/config — configuración activa para el runtime del app */
export async function GET() {
  try {
    const config = await getAppConfig()
    return NextResponse.json(config)
  } catch (e: any) {
    console.error('[GET /api/config]', e)
    return NextResponse.json({ message: e?.message ?? 'Error al cargar configuración' }, { status: 500 })
  }
}
