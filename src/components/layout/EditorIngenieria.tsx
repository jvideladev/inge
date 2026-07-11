'use client'
import { useRef, useState } from 'react'
import { Topbar }  from '@/components/layout/Topbar'
import { Sidebar, type LayoutModo } from '@/components/layout/Sidebar'
import { Canvas, type CanvasHandle } from '@/components/canvas/Canvas'
import { useAppStore } from '@/store/app.store'
import type { TipoEnlace } from '@/types'

export function EditorIngenieria() {
  const cerrarIngenieria = useAppStore((s) => s.cerrarIngenieria)
  const temaOscuro       = useAppStore((s) => s.temaOscuro)

  const [tipoEnlaceActivo, setTipoEnlaceActivo] = useState<TipoEnlace>('UTP')
  const [mostrarLeyendas, setMostrarLeyendas]   = useState(false)
  const canvasRef = useRef<CanvasHandle>(null)

  const handleAutoLayout = (modo: LayoutModo) => {
    canvasRef.current?.autoLayout(modo)
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${temaOscuro ? 'dark' : 'light'}`}>
      <Topbar onCerrar={cerrarIngenieria} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          tipoEnlaceActivo={tipoEnlaceActivo}
          setTipoEnlaceActivo={setTipoEnlaceActivo}
          onAutoLayout={handleAutoLayout}
          mostrarLeyendas={mostrarLeyendas}
          onToggleLeyendas={() => setMostrarLeyendas(v => !v)}
        />
        <Canvas
          ref={canvasRef}
          tipoEnlaceActivo={tipoEnlaceActivo}
          mostrarLeyendas={mostrarLeyendas}
        />
      </div>
    </div>
  )
}
