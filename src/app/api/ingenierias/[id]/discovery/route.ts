/**
 * POST /api/ingenierias/[id]/discovery
 * Consulta el Servicio de Discovery de Totalplay y genera los nodos y edges
 * correspondientes en la ingeniería.
 */
import { NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Params) {
  const { id } = await context.params
  const { cuenta } = await request.json()

  // TODO: llamar al Servicio Discovery de Totalplay:
  // const DISCOVERY_URL = process.env.DISCOVERY_BASE_URL
  // const DISCOVERY_KEY = process.env.DISCOVERY_API_KEY
  // const discoveryData = await fetch(`${DISCOVERY_URL}/cuenta/${cuenta}`, {
  //   headers: { 'Authorization': `Bearer ${DISCOVERY_KEY}` }
  // }).then(r => r.json())

  // TODO: mapear la respuesta del Discovery al formato de nodos/edges del canvas:
  // const { nodes, edges } = mapDiscoveryToCanvas(discoveryData)

  // TODO: guardar en BD y devolver ingeniería actualizada:
  // const updated = await prisma.ingenieria.update({ where: { id }, data: { nodes, edges } })

  return NextResponse.json({
    message: 'Integración con Discovery pendiente de implementar',
    ingenieriaId: id,
    cuenta,
  }, { status: 501 })
}
