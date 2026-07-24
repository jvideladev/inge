import { getIngenieriaById } from '@/lib/ingenierias.repo'
import { VistaCanvas } from '@/components/vista/VistaCanvas'
import { estadoColor } from '@/lib/utils'
import type { EstadoIngenieria } from '@/types'

export const dynamic = 'force-dynamic'

interface Params {
  params: Promise<{ id: string }>
}

const ESTADOS_VISTA: EstadoIngenieria[] = [
  'Aprobada',
  'Aprovisionada',
  'Implementada',
]

/**
 * Vista HTML para popup / iframe del sistema de RFC.
 * Auth: pendiente (hoy pública si la ingeniería está en estado publicable).
 */
export default async function VistaIngenieriaPage({ params }: Params) {
  const { id } = await params
  const ing = await getIngenieriaById(id)

  if (!ing) {
    return (
      <Shell>
        <Empty title="Ingeniería no encontrada" detail={`No existe el id ${id}.`} />
      </Shell>
    )
  }

  if (!ESTADOS_VISTA.includes(ing.estado)) {
    return (
      <Shell>
        <Empty
          title="Vista no disponible"
          detail={`La ingeniería está en estado "${ing.estado}". Solo se publica la vista a partir de Aprobada.`}
        />
      </Shell>
    )
  }

  return (
    <Shell>
      <header className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-base font-semibold text-gray-900 truncate max-w-[min(100%,28rem)]">
            {ing.nombre}
          </h1>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoColor(ing.estado)}`}>
            {ing.estado}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Cliente: {ing.cliente || '—'} · Cuenta: {ing.cuenta || '—'} · v{ing.versionActual ?? 1}
        </p>
      </header>
      <main className="flex-1 min-h-0 bg-gray-50">
        <VistaCanvas nodes={ing.nodes} edges={ing.edges} />
      </main>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100 text-gray-900">
      {children}
    </div>
  )
}

function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">{detail}</p>
      </div>
    </div>
  )
}
