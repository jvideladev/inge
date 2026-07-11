'use client'
import { useState } from 'react'

interface FabAction {
  icon:    string
  label:   string
  color:   string
  onClick: () => void
}

interface Props {
  onGuardar:    () => void
  onExportPDF:  () => void
  onExportExcel:() => void
  onFullscreen: () => void
}

export function FabMenu({ onGuardar, onExportPDF, onExportExcel, onFullscreen }: Props) {
  const [open, setOpen] = useState(false)

  const actions: FabAction[] = [
    { icon: '💾', label: 'Guardar',  color: '#2563EB', onClick: onGuardar      },
    { icon: '📄', label: 'PDF',      color: '#DC2626', onClick: onExportPDF    },
    { icon: '📊', label: 'Excel',    color: '#16A34A', onClick: onExportExcel  },
    { icon: '⛶',  label: 'Pantalla', color: '#7C3AED', onClick: onFullscreen   },
  ]

  const angles = [90, 120, 150, 180]
  const R   = 96
  const SZ  = 240

  // Centro del botón FAB principal dentro del contenedor
  // FAB: bottom-0 right-0, w-14 h-14 (56px) → centro en (SZ-28, SZ-28)
  const FAB_CX = SZ - 28
  const FAB_CY = SZ - 28

  return (
    <div
      className="absolute bottom-4 right-4 z-20"
      style={{ width: SZ, height: SZ, pointerEvents: 'none' }}
    >
      {/* Botones radiales — siempre montados para poder animar entrada Y salida */}
      {actions.map((action, i) => {
        const rad = (angles[i] * Math.PI) / 180
        // Posición final del borde superior-izquierdo del botón (w-12 h-12 = 48px → radio 24px)
        const x = SZ - 26 + Math.cos(rad) * R - 23
        const y = SZ - 26 - Math.sin(rad) * R - 23

        // Desplazamiento necesario para llevar el botón desde su posición final al centro del FAB
        // (usado cuando está cerrado: translate lleva el botón "de vuelta" al FAB)
        const tx = FAB_CX - 24 - x   // 24 = radio del botón (48/2)
        const ty = FAB_CY - 24 - y

        const delay   = open ? i * 55 : (actions.length - 1 - i) * 35
        const easing  = open
          ? `transform 0.35s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms, opacity 0.2s ease ${delay}ms`
          : `transform 0.22s cubic-bezier(0.55,0,1,0.45) ${delay}ms, opacity 0.18s ease ${delay}ms`

        return (
          <button
            key={action.label}
            onClick={() => { action.onClick(); setOpen(false) }}
            title={action.label}
            className="absolute w-12 h-12 rounded-full flex flex-col items-center justify-center text-white shadow-lg"
            style={{
              left: x,
              top:  y,
              backgroundColor: action.color,
              pointerEvents:   open ? 'auto' : 'none',
              opacity:         open ? 1 : 0,
              transform:       open
                ? 'translate(0px, 0px) scale(1)'
                : `translate(${tx}px, ${ty}px) scale(0.25)`,
              transition: easing,
            }}
          >
            <span className="text-xl leading-none">{action.icon}</span>
            <span className="text-[10px] font-medium leading-none mt-0.5">{action.label}</span>
          </button>
        )
      })}

      {/* Botón principal */}
      <button
        onClick={() => setOpen(o => !o)}
        className="absolute bottom-0 right-0 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl"
        style={{
          backgroundColor: '#DC2626',
          boxShadow: open
            ? '0 4px 24px rgba(220,38,38,0.7)'
            : '0 4px 20px rgba(220,38,38,0.5)',
          pointerEvents: 'auto',
          transition: 'box-shadow 0.25s ease',
        }}
        title={open ? 'Cerrar menú' : 'Acciones'}
      >
        <svg
          width="22" height="22" viewBox="0 0 22 22"
          style={{
            transform:  open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <line x1="11" y1="3" x2="11" y2="19" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
          <line x1="3"  y1="11" x2="19" y2="11" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
