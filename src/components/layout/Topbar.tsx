'use client'
import { useCallback, useRef, useState } from 'react'
import { useAppStore } from '@/store/app.store'
import { estadoColor } from '@/lib/utils'
import type { EstadoIngenieria } from '@/types'
import { UserMenu } from '@/components/layout/UserMenu'

const iconProps = {
  width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
}

const SaveIcon = () => (
  <svg {...iconProps}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const BackIcon = () => (
  <svg {...iconProps}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

function GuardadoToast({ open, visible }: { open: boolean; visible: boolean }) {
  if (!open) return null
  return (
    <div className={`
      fixed bottom-8 right-6 z-[9999]
      flex items-center gap-2.5
      bg-white dark:bg-[#1e2435]
      border border-emerald-200 dark:border-emerald-700
      text-emerald-700 dark:text-emerald-400
      text-sm font-medium
      px-4 py-3 rounded-2xl
      shadow-lg shadow-emerald-100/60 dark:shadow-none
      pointer-events-none select-none
      transition-all duration-300 ease-out
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
    `}>
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <circle cx="8.5" cy="8.5" r="7.25" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 9 L7.5 11.5 L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Ingeniería guardada
    </div>
  )
}

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

  const [toastOpen, setToastOpen]       = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const t1 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const t2 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const guardar = useCallback(() => {
    clearTimeout(t1.current)
    clearTimeout(t2.current)
    setToastOpen(true)
    setToastVisible(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setToastVisible(true)))
    t1.current = setTimeout(() => setToastVisible(false), 2200)
    t2.current = setTimeout(() => setToastOpen(false),    2550)
  }, [])

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

      {/* Toggle tema — solo icono (igual que el grid) */}
      <button
        onClick={toggleTema}
        title={temaOscuro ? 'Tema claro' : 'Tema oscuro'}
        aria-label={temaOscuro ? 'Tema claro' : 'Tema oscuro'}
        className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white text-base transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/15 flex-shrink-0"
      >
        {temaOscuro ? '☀' : '🌙'}
      </button>

      {/* Guardar */}
      <button
        onClick={guardar}
        className="h-9 flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/15 flex-shrink-0"
      >
        <SaveIcon /> Guardar
      </button>

      {/* Volver */}
      <button
        onClick={onCerrar}
        className="h-9 flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/15 flex-shrink-0"
      >
        <BackIcon /> Volver
      </button>

      <GuardadoToast open={toastOpen} visible={toastVisible} />
    </header>
  )
}
