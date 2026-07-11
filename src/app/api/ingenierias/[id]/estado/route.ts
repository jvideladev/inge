/**
 * PATCH /api/ingenierias/[id]/estado — Cambia el estado de una ingeniería
 * Si el nuevo estado es "Aprovisionada", actualiza la CMDB automáticamente.
 */
import { NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params
  const { estado } = await request.json()

  // TODO: const ing = await prisma.ingenieria.update({ where: { id }, data: { estado } })

  // TODO: si estado === 'Aprovisionada', llamar al Conector CMDB:
  // if (estado === 'Aprovisionada') {
  //   await cmdbConector.actualizar(ing)
  // }

  // TODO: registrar en audit log:
  // await prisma.auditLog.create({ data: { ingenieriaId: id, accion: 'CAMBIO_ESTADO', detalle: estado } })

  return NextResponse.json({ id, estado, modificadaEn: new Date().toISOString() })
}
