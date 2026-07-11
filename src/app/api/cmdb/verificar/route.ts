/**
 * GET /api/cmdb/verificar?hostname=ROUT-0032
 * Verifica si un dispositivo está registrado en la CMDB de Totalplay.
 */
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const hostname = searchParams.get('hostname')
  if (!hostname) return NextResponse.json({ message: 'hostname requerido' }, { status: 400 })

  // TODO: llamar al Conector CMDB de Totalplay:
  // const CMDB_URL = process.env.CMDB_BASE_URL
  // const CMDB_KEY = process.env.CMDB_API_KEY
  // const result = await fetch(`${CMDB_URL}/ci?hostname=${hostname}`, {
  //   headers: { 'Authorization': `Bearer ${CMDB_KEY}` }
  // }).then(r => r.json())
  // return NextResponse.json({ registrado: result.found, datos: result.data })

  return NextResponse.json({ message: 'Integración con CMDB pendiente de implementar' }, { status: 501 })
}
