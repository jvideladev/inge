'use client'
import { useRef, useState } from 'react'
import { Topbar }  from '@/components/layout/Topbar'
import { Sidebar, type LayoutModo } from '@/components/layout/Sidebar'
import { Canvas, type CanvasHandle } from '@/components/canvas/Canvas'
import { useAppStore } from '@/store/app.store'
import { esEstadoEditableOperativo } from '@/lib/utils'
import type { TipoEnlace } from '@/types'

export function EditorIngenieria() {
  const cerrarIngenieria = useAppStore((s) => s.cerrarIngenieria)
  const temaOscuro       = useAppStore((s) => s.temaOscuro)
  const ingenieriaActiva = useAppStore((s) => s.ingenieriaActiva)
  const guardarCambios   = useAppStore((s) => s.guardarCambios)
  const usuario = useAppStore((s) => s.usuario)
  const demoSoloLectura = ingenieriaActiva?.editable === false
  const operativoBloqueado =
    usuario.perfil === 'Operativo' &&
    ingenieriaActiva != null &&
    !esEstadoEditableOperativo(ingenieriaActiva.estado)
  const soloLectura = demoSoloLectura || operativoBloqueado || usuario.perfil === 'Consulta'

  const [tipoEnlaceActivo, setTipoEnlaceActivo] = useState<TipoEnlace>('UTP')
  const [mostrarLeyendas, setMostrarLeyendas]   = useState(false)
  const canvasRef = useRef<CanvasHandle>(null)

  const handleAutoLayout = (modo: LayoutModo) => {
    if (soloLectura) return
    canvasRef.current?.autoLayout(modo)
  }

  const handleGuardar = async () => {
    if (soloLectura) return
    const graph = canvasRef.current?.getGraph()
    if (!graph) return
    await guardarCambios(graph.nodes, graph.edges)
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${temaOscuro ? 'dark' : 'light'}`}>
      <Topbar onCerrar={cerrarIngenieria} onGuardar={handleGuardar} soloLectura={soloLectura} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          tipoEnlaceActivo={tipoEnlaceActivo}
          setTipoEnlaceActivo={setTipoEnlaceActivo}
          onAutoLayout={handleAutoLayout}
          mostrarLeyendas={mostrarLeyendas}
          onToggleLeyendas={() => setMostrarLeyendas(v => !v)}
          soloLectura={soloLectura}
        />
        <Canvas
          ref={canvasRef}
          tipoEnlaceActivo={tipoEnlaceActivo}
          mostrarLeyendas={mostrarLeyendas}
          soloLectura={soloLectura}
        />
      </div>
    </div>
  )
}
