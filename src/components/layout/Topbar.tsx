'use client'
import { useAppStore } from '@/store/app.store'
import { estadoColor } from '@/lib/utils'
import type { EstadoIngenieria } from '@/types'
import { UserMenu } from '@/components/layout/UserMenu'

const TRANSICIONES: Record<string, Partial<Record<EstadoIngenieria, EstadoIngenieria[]>>> = {
  Operativo: {
    'Nueva':       ['En revisión'],
    'Rechazada':   ['Nueva', 'En revisión'],
  },
  Supervisor: {
    'En revisión': ['Aprobada', 'Rechazada'],
    'Aprobada':    ['Aprovisionada'],
    'Aprovisionada':['Implementada'],
  },
}

interface Props {
  onCerrar: () => void
}

export function Topbar({ onCerrar }: Props) {
  const ing               = useAppStore((s) => s.ingenieriaActiva)
  const usuario           = useAppStore((s) => s.usuario)
  const temaOscuro        = useAppStore((s) => s.temaOscuro)
  const toggleTema        = useAppStore((s) => s.toggleTema)
  const cambiarEstado     = useAppStore((s) => s.cambiarEstado)
  const cambiosSinGuardar = useAppStore((s) => s.cambiosSinGuardar)

  const totalNodes = ing?.nodes.length ?? 0
  const totalEdges = ing?.edges.length ?? 0
  const sinCMDB    = ing
    ? [...ing.nodes, ...ing.edges].filter((x: any) => x.data?.registradoCMDB === false).length
    : 0

  const estadoActual = ing?.estado
  const transiciones = estadoActual
    ? (TRANSICIONES[usuario.perfil]?.[estadoActual] ?? [])
    : []

  const isConsulta = usuario.perfil === 'Consulta'

  return (
    <header className="
      h-12 flex items-center px-4 gap-2.5 flex-shrink-0 z-10
      bg-[#3c465a] dark:bg-[#252d3d]
      border-b border-slate-600 dark:border-slate-700
      shadow-lg
    ">
      {/* Logo */}
      <button
        onClick={onCerrar}
        className="text-base font-bold text-white hover:text-white/80 mr-1 flex-shrink-0"
      >
        Ingenierías
      </button>
      <span className="text-white/30 flex-shrink-0">|</span>

      {/* Nombre */}
      <span className="text-sm font-medium text-white/90 truncate max-w-[200px] flex-shrink-0">
        {ing?.nombre}
      </span>

      {ing && (
        <>
          {/* Estado badge */}
          <span className={`text-sm font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${estadoColor(ing.estado)}`}>
            {ing.estado}
          </span>

          {/* Sin guardar */}
          {cambiosSinGuardar && (
            <span className="text-sm px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex-shrink-0">
              ● Sin guardar
            </span>
          )}

          {/* Fuera de CMDB */}
          {sinCMDB > 0 && (
            <span className="text-sm px-2 py-0.5 rounded-md bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 flex-shrink-0">
              ⚠ {sinCMDB} fuera de CMDB
            </span>
          )}

          {/* Dispositivos / enlaces */}
          <span className="text-sm text-white bg-white/10 dark:bg-white/10 px-2 py-0.5 rounded-md flex-shrink-0">
            {totalNodes} disp. · {totalEdges} enlaces
          </span>

          {/* Botones de transición */}
          {!isConsulta && transiciones.length > 0 && (
            <div className="flex gap-1 flex-shrink-0">
              {transiciones.map((t) => {
                let cls = ''
                if (t === 'En revisión')   cls = 'bg-amber-500 hover:bg-amber-600 text-white'
                else if (t === 'Aprobada')      cls = 'bg-green-600 hover:bg-green-700 text-white'
                else if (t === 'Rechazada')     cls = 'bg-red-600 hover:bg-red-700 text-white'
                else if (t === 'Aprovisionada') cls = 'bg-teal-600 hover:bg-teal-700 text-white'
                else if (t === 'Implementada')  cls = 'bg-purple-600 hover:bg-purple-700 text-white'
                else if (t === 'Nueva')         cls = 'bg-[#3c465f] hover:bg-[#2f384e] text-white'
                return (
                  <button
                    key={t}
                    onClick={() => ing && cambiarEstado(ing.id, t)}
                    className={`text-sm font-semibold px-3 py-1 rounded-md transition-colors ${cls}`}
                  >
                    → {t}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      <div className="flex-1" />

      <UserMenu />

      {/* Toggle tema */}
      <button
        onClick={toggleTema}
        className="h-9 rounded-xl border border-white/25 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/15 flex-shrink-0"
      >
        {temaOscuro ? '☀ Claro' : '🌙 Oscuro'}
      </button>
    </header>
  )
}
