'use client'
import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { DeviceIcon } from '@/components/ui/DeviceIcons'
import { useAppStore } from '@/store/app.store'
import { useConfigStore } from '@/store/config.store'
import type { TipoDispositivo, TipoEnlace } from '@/types'

export type LayoutModo = 'horizontal' | 'vertical' | 'cuadricula' | 'conexiones'

const LAYOUTS: { modo: LayoutModo; label: string; icon: string; title: string }[] = [
  { modo: 'horizontal', label: 'Árbol H.',   icon: '⇒', title: 'Árbol horizontal (izquierda → derecha)' },
  { modo: 'vertical',   label: 'Árbol V.',   icon: '⇓', title: 'Árbol vertical (arriba → abajo)' },
  { modo: 'cuadricula', label: 'Cuadrícula', icon: '⊞', title: 'Cuadrícula uniforme' },
  { modo: 'conexiones', label: 'Conexiones', icon: '⇄', title: 'Optimizar puntos de conexión (no mueve dispositivos)' },
]

interface Props {
  tipoEnlaceActivo:    TipoEnlace
  setTipoEnlaceActivo: (t: TipoEnlace) => void
  onAutoLayout:        (modo: LayoutModo) => void
  mostrarLeyendas:     boolean
  onToggleLeyendas:    () => void
  soloLectura?:        boolean
}

// ── Flyout de auto-ajuste ─────────────────────────────────────────────────────

function AutoAjusteButton({ onAutoLayout }: { onAutoLayout: (modo: LayoutModo) => void }) {
  const temaOscuro = useAppStore((s) => s.temaOscuro)
  const [open, setOpen]       = useState(false)
  const [pos, setPos]           = useState({ top: 0, left: 0 })
  const [flyoutReady, setFlyoutReady] = useState(false)
  const btnRef    = useRef<HTMLButtonElement>(null)
  const flyoutRef = useRef<HTMLDivElement>(null)

  const updateFlyoutPosition = () => {
    const btn = btnRef.current
    const flyout = flyoutRef.current
    if (!btn || !flyout) return

    const btnRect = btn.getBoundingClientRect()
    const flyoutH = flyout.offsetHeight
    const flyoutW = flyout.offsetWidth
    const pad = 8
    const gap = 6

    let left = btnRect.right + gap
    let top = btnRect.top

    const spaceBelow = window.innerHeight - btnRect.top - pad
    const spaceAbove = btnRect.bottom - pad

    // Si no alcanza abajo, abrir hacia arriba (alineado al borde inferior del botón)
    if (flyoutH > spaceBelow && flyoutH <= spaceAbove) {
      top = btnRect.bottom - flyoutH
    } else if (flyoutH > spaceBelow) {
      top = Math.max(pad, window.innerHeight - pad - flyoutH)
    }

    if (left + flyoutW > window.innerWidth - pad) {
      left = Math.max(pad, btnRect.left - flyoutW - gap)
    }

    setPos({ top, left })
    setFlyoutReady(true)
  }

  const handleClick = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setFlyoutReady(false)
      setPos({ top: r.top, left: r.right + 6 })
    }
    setOpen(o => !o)
  }

  useLayoutEffect(() => {
    if (!open) {
      setFlyoutReady(false)
      return
    }
    updateFlyoutPosition()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onReposition = () => updateFlyoutPosition()
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  // Cierra al hacer clic fuera del botón y del flyout
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || flyoutRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div className="px-2 pb-2">
      <button
        ref={btnRef}
        onClick={handleClick}
        className={`
          w-full flex items-center justify-between px-3 py-1.5 rounded-md
          border text-xs font-medium transition-colors
          ${open
            ? 'border-blue-400 dark:border-[#4a8fff] bg-blue-50 dark:bg-[#1a2340] text-blue-600 dark:text-blue-400'
            : 'border-[#BFD0E8] dark:border-[#2a3349] bg-[#E2EAF6] dark:bg-[#1e2435] text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-[#D0E2F4] dark:hover:bg-[#1a2340]'
          }
        `}
      >
        <span>Auto ajuste</span>
        <span
          className="text-[9px] transition-transform duration-200 opacity-50"
          style={{ display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▸
        </span>
      </button>

      {open && typeof window !== 'undefined' && createPortal(
        // wrapper con clase dark para que los dark: de Tailwind apliquen
        // (el portal sale del árbol DOM normal, que puede no tener la clase dark)
        <div className={temaOscuro ? 'dark' : ''}>
          <div
            ref={flyoutRef}
            className="
              fixed z-[9999] py-1 min-w-[148px]
              rounded-lg shadow-xl
              border border-[#BFD0E8] dark:border-[#2a3349]
              bg-[#EDF2FA] dark:bg-[#161b27]
            "
            style={{
              top: pos.top,
              left: pos.left,
              visibility: flyoutReady ? 'visible' : 'hidden',
            }}
          >
            {LAYOUTS.map(({ modo, label, icon, title }, i) => (
              <button
                key={modo}
                onClick={() => { onAutoLayout(modo); setOpen(false) }}
                title={title}
                className="
                  flex items-center gap-2.5 px-3 py-2 w-full text-left
                  text-gray-700 dark:text-gray-300 text-xs
                  hover:bg-[#DDE8F5] dark:hover:bg-[#1e2435]
                  transition-colors
                "
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span className="text-sm w-5 text-center text-gray-500 dark:text-gray-500 flex-shrink-0">
                  {icon}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar({ tipoEnlaceActivo, setTipoEnlaceActivo, onAutoLayout, mostrarLeyendas, onToggleLeyendas, soloLectura = false }: Props) {
  const temaOscuro = useAppStore((s) => s.temaOscuro)
  const dispositivos = useConfigStore((s) => s.dispositivos)
  const enlaces = useConfigStore((s) => s.enlaces)
  const enlaceStyle = useConfigStore((s) => s.enlaceStyle)

  const onDragStart = (e: React.DragEvent, tipo: TipoDispositivo) => {
    if (soloLectura) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData('application/dispositivo', tipo)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="
      w-52 flex-shrink-0 flex flex-col overflow-hidden
      bg-[#EDF2FA] dark:bg-[#161b27]
      border-r border-[#BFD0E8] dark:border-[#2a3349]
    ">
      {soloLectura && (
        <div className="mx-2 mt-2 mb-1 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
          Demo · solo lectura
        </div>
      )}
      {/* Dispositivos — ocupa el espacio disponible; sólo esta sección hace scroll */}
      <div className="flex flex-col min-h-0 flex-1">
        <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-widest px-3 pt-3 pb-1 flex-shrink-0">
          Dispositivos
        </p>
        <div className="grid grid-cols-2 gap-1 px-2 pb-2 overflow-y-auto min-h-0 flex-1">
          {dispositivos.map((disp) => {
            const fill = temaOscuro ? disp.colorFillDark : disp.colorFillLight
            const stroke = temaOscuro ? disp.colorStrokeDark : disp.colorStrokeLight
            return (
              <div
                key={disp.codigo}
                draggable={!soloLectura}
                onDragStart={(e) => onDragStart(e, disp.codigo as TipoDispositivo)}
                className={`
                  flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg
                  border border-transparent
                  transition-colors select-none
                  ${soloLectura
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-grab hover:border-[#A8BFD8] dark:hover:border-[#2a3349] hover:bg-[#DDE8F5] dark:hover:bg-[#1e2435]'
                  }
                `}
                title={soloLectura ? 'Solo lectura' : `Arrastrar ${disp.label} al canvas`}
              >
                <DeviceIcon
                  tipo={disp.codigo as TipoDispositivo}
                  size={42}
                  color={fill}
                  strokeColor={stroke}
                />
                <span className="text-sm text-gray-700 dark:text-[#8b95b0] text-center leading-tight">
                  {disp.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Secciones fijas al fondo */}
      <div className="flex-shrink-0 border-t border-[#BFD0E8] dark:border-[#2a3349]">
        {/* Tipo de enlace */}
        <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-widest px-3 pt-2 pb-1">
          Tipo de enlace
        </p>
        <div className="flex flex-col gap-0.5 px-2 pb-2">
          {enlaces.map((enlace) => {
            const s      = enlaceStyle(enlace.codigo)
            const activo = tipoEnlaceActivo === enlace.codigo
            return (
              <button
                key={enlace.codigo}
                onClick={() => !soloLectura && setTipoEnlaceActivo(enlace.codigo as TipoEnlace)}
                disabled={soloLectura}
                className={`
                  flex items-center gap-2.5 px-2 py-2 rounded-md text-left w-full
                  transition-colors
                  ${soloLectura ? 'opacity-50 cursor-not-allowed' : ''}
                  ${activo
                    ? 'bg-blue-100 dark:bg-[#1e2435] border border-blue-300 dark:border-[#4a8fff]'
                    : 'hover:bg-[#DDE8F5] dark:hover:bg-[#1e2435] border border-transparent'
                  }
                `}
              >
                <svg width="26" height="6" className="flex-shrink-0">
                  <line x1="0" y1="3" x2="26" y2="3" stroke={s.stroke} strokeWidth={s.strokeWidth} strokeDasharray={s.strokeDasharray}/>
                </svg>
                <span className={`text-sm ${activo ? 'text-blue-600 dark:text-[#4a8fff] font-medium' : 'text-gray-700 dark:text-[#8b95b0]'}`}>
                  {enlace.label}
                </span>
              </button>
            )
          })}
        </div>

        <Divider />

        {/* Auto-ajuste — botón único con flyout */}
        <AutoAjusteButton onAutoLayout={onAutoLayout} />

        <Divider />

        {/* Toggle leyendas */}
        <div className="px-2 py-2">
          <button
            onClick={onToggleLeyendas}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mostrarLeyendas
                ? 'bg-blue-100 dark:bg-[#1a2340] border border-blue-300 dark:border-[#4a8fff] text-blue-600 dark:text-[#4a8fff]'
                : 'border border-[#BFD0E8] dark:border-[#2a3349] bg-[#E2EAF6] dark:bg-[#1e2435] text-gray-500 dark:text-gray-400 hover:border-blue-300 hover:text-blue-500'
            }`}
          >
            <span className="text-base">{mostrarLeyendas ? '◉' : '◎'}</span>
            Ver leyendas
          </button>
        </div>
      </div>
    </aside>
  )
}

function Divider() {
  return <div className="h-px bg-[#D0DEEF] dark:bg-[#2a3349] mx-2 my-1" />
}
