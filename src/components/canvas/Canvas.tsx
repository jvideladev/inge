'use client'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import ReactFlow, {
  Controls, ControlButton, Panel,
  addEdge, useNodesState, useEdgesState,
  type Connection, type Node, type Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './canvas-cursor.css'

import DispositivoNode from './DispositivoNode'
import EnlaceEdge     from './EnlaceEdge'
import { FabMenu }    from './FabMenu'
import { PropiedadesPanel, type SelectedItem, type PanelModo } from '@/components/layout/PropiedadesPanel'
import { useAppStore } from '@/store/app.store'
import { ENLACE_STYLE, ORIGEN_COLOR, generarId } from '@/lib/utils'
import type { TipoDispositivo, TipoEnlace, DispositivoData, EnlaceData } from '@/types'
import type { LayoutModo } from '@/components/layout/Sidebar'

const NODE_TYPES  = { dispositivo: DispositivoNode }
const EDGE_TYPES  = { enlace: EnlaceEdge }

// 5 zoom levels — n/24 con n múltiplo de 4, garantiza gap/DPR entero
// para DPR ∈ {1, 1.25, 1.5, 1.75, 2} → sin artefacto de fondo en ningún nivel
// n=8 → 33%  n=12 → 50%  n=24 → 100%  n=36 → 150%  n=48 → 200%
const ZOOM_LEVELS = [8/24, 12/24, 24/24, 36/24, 48/24] as const  // ≈ [0.333, 0.5, 1.0, 1.5, 2.0]


// ── Custom minimap panel ───────────────────────────────────────────────────────
const MM_W = 140
const MM_H = 82
const MM_NODE_COLORS: Partial<Record<TipoDispositivo, string>> = {
  Router: '#2563EB', Switch: '#0D9488', Firewall: '#DC2626',
  Server: '#16A34A', OLT: '#7C3AED', ONT: '#D97706',
  NubeTP: '#2563EB', NubeTerceros: '#94A3B8', AccessPoint: '#E07830',
  Proveedor: '#4B9EE8', Medidor: '#22C55E', CPE: '#F59E0B',
  LAN: '#3B82F6', Setup: '#9333EA', POP: '#06B6D4',
  Colector: '#10B981', Radiobase: '#C084FC', Splitter: '#A855F7',
}

function MinimapPanel({ nodes, open, onToggle, temaOscuro }: {
  nodes: Node[]; open: boolean; onToggle: () => void; temaOscuro: boolean
}) {
  const bg = temaOscuro ? '#0f1117' : '#f0f2f7'
  const hasNodes = nodes.length > 0
  const xs = hasNodes ? nodes.map(n => n.position.x) : [0]
  const ys = hasNodes ? nodes.map(n => n.position.y) : [0]
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const bW   = Math.max(Math.max(...xs) - minX + 80, 1)
  const bH   = Math.max(Math.max(...ys) - minY + 80, 1)
  const scale = Math.min((MM_W - 12) / bW, (MM_H - 12) / bH)
  const offX  = (MM_W - bW * scale) / 2
  const offY  = (MM_H - bH * scale) / 2

  return (
    <div
      className="rounded-lg overflow-hidden shadow-xl border border-gray-200 dark:border-[#2a3349]"
      style={{ width: MM_W }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-gray-100 dark:bg-[#1e2435] border-b border-gray-200 dark:border-[#2a3349] select-none">
        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">Mapa</span>
        <button
          onClick={onToggle}
          title={open ? 'Minimizar' : 'Restaurar'}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-base leading-none w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-[#2a3349] transition-colors"
        >
          {open ? '−' : '□'}
        </button>
      </div>

      {/* Map content */}
      {open && (
        <svg width={MM_W} height={MM_H} style={{ background: bg, display: 'block' }}>
          {nodes.map(n => {
            const x = (n.position.x - minX) * scale + offX
            const y = (n.position.y - minY) * scale + offY
            const color = MM_NODE_COLORS[n.data?.tipo as TipoDispositivo] ?? '#9098B0'
            return <rect key={n.id} x={x} y={y} width={7} height={7} rx={2} fill={color} />
          })}
        </svg>
      )}
    </div>
  )
}

const DEFAULT_META = {
  hostname: '', modelo: '', ip: '', serial: '',
  ubicacion: '', fabricante: '', customFields: {}
}

export interface CanvasHandle {
  autoLayout: (modo: LayoutModo) => void
}

// ── Legend panel ──────────────────────────────────────────────────────────────
const ORIGENES_LEYENDA = [
  { label: 'Discovery', color: ORIGEN_COLOR['Discovery'] },
  { label: 'Excel',     color: ORIGEN_COLOR['Excel']     },
  { label: 'Manual',    color: ORIGEN_COLOR['Manual']    },
] as const

function LeyendasPanel() {
  return (
    <div className="rounded-lg overflow-hidden shadow-xl border border-gray-200 dark:border-[#2a3349] bg-white dark:bg-[#161b27]">
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-[#5a6380] uppercase tracking-widest mb-1.5">Origen</p>
        {ORIGENES_LEYENDA.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2 py-1">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
          </div>
        ))}
      </div>
      <div className="h-px bg-gray-100 dark:bg-[#2a3349] mx-3" />
      <div className="px-3 pt-1.5 pb-2.5">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-[#5a6380] uppercase tracking-widest mb-1.5">CMDB</p>
        <div className="flex items-center gap-2 py-1">
          <svg width="13" height="13" viewBox="0 0 14 14" className="flex-shrink-0">
            <polyline points="1,8 5,12 13,2" stroke="#0D9488" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-300">Registrado</span>
        </div>
        <div className="flex items-center gap-2 py-1">
          <svg width="13" height="13" viewBox="0 0 14 14" className="flex-shrink-0">
            <polyline points="1,8 5,12 13,2" stroke="#9098B0" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-300">Sin CMDB</span>
        </div>
      </div>
    </div>
  )
}

interface Props {
  tipoEnlaceActivo: TipoEnlace
  mostrarLeyendas:  boolean
}

// ── Optimizar conexiones ──────────────────────────────────────────────────────
const SRC_HANDLES = ['top', 'right', 'bottom', 'left'] as const
const TGT_HANDLES = ['top-t', 'right-t', 'bottom-t', 'left-t'] as const
const DEFAULT_W = 64, DEFAULT_H = 82

function handlePos(node: Node, h: string): { x: number; y: number } {
  const w = node.width  ?? DEFAULT_W
  const hh = node.height ?? DEFAULT_H
  const { x, y } = node.position
  if (h === 'top'    || h === 'top-t')    return { x: x + w / 2, y }
  if (h === 'right'  || h === 'right-t')  return { x: x + w,     y: y + hh / 2 }
  if (h === 'bottom' || h === 'bottom-t') return { x: x + w / 2, y: y + hh }
  return { x, y: y + hh / 2 } // left / left-t
}

function optimizarConexiones(nodes: Node[], edges: Edge[]): Edge[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const dist = (a: {x:number;y:number}, b: {x:number;y:number}) =>
    Math.hypot(a.x - b.x, a.y - b.y)

  return edges.map(edge => {
    const src = nodeMap.get(edge.source)
    const tgt = nodeMap.get(edge.target)
    if (!src || !tgt) return edge

    let bestSH: string = 'right', bestTH: string = 'left-t', bestD = Infinity
    for (const sh of SRC_HANDLES) {
      for (const th of TGT_HANDLES) {
        const d = dist(handlePos(src, sh), handlePos(tgt, th))
        if (d < bestD) { bestD = d; bestSH = sh; bestTH = th }
      }
    }
    return { ...edge, sourceHandle: bestSH, targetHandle: bestTH }
  })
}

// ── Auto-layout ───────────────────────────────────────────────────────────────
function aplicarLayout(nodes: Node[], edges: Edge[], modo: LayoutModo): Node[] {
  if (modo === 'conexiones') return nodes // handled separately
  if (nodes.length === 0) return nodes

  if (modo === 'cuadricula') {
    const cols = Math.ceil(Math.sqrt(nodes.length))
    const W = 200, H = 160
    return nodes.map((n, i) => ({
      ...n,
      position: { x: (i % cols) * W + 60, y: Math.floor(i / cols) * H + 60 }
    }))
  }

  // BFS para asignar niveles
  const adj: Record<string, string[]> = {}
  const inDegree: Record<string, number> = {}
  nodes.forEach((n) => { adj[n.id] = []; inDegree[n.id] = 0 })
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target)
    if (inDegree[e.target] !== undefined) inDegree[e.target]++
  })

  const roots = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id)
  const startNodes = roots.length > 0 ? roots : [nodes[0].id]

  const level: Record<string, number> = {}
  const queue = [...startNodes]
  startNodes.forEach((id) => { level[id] = 0 })

  let head = 0
  while (head < queue.length) {
    const id = queue[head++]
    for (const next of adj[id] ?? []) {
      if (level[next] === undefined) {
        level[next] = level[id] + 1
        queue.push(next)
      }
    }
  }
  nodes.forEach((n) => { if (level[n.id] === undefined) level[n.id] = 0 })

  // Agrupar por nivel
  const byLevel: Record<number, string[]> = {}
  Object.entries(level).forEach(([id, lv]) => {
    byLevel[lv] = byLevel[lv] ?? []
    byLevel[lv].push(id)
  })

  const W = modo === 'horizontal' ? 220 : 180
  const H = modo === 'horizontal' ? 160 : 200
  const positioned = new Map<string, { x: number; y: number }>()

  Object.entries(byLevel).forEach(([lvStr, ids]) => {
    const lv = parseInt(lvStr)
    ids.forEach((id, i) => {
      const offset = i - (ids.length - 1) / 2
      if (modo === 'horizontal') {
        positioned.set(id, { x: lv * W + 60, y: offset * H + 300 })
      } else {
        positioned.set(id, { x: offset * W + 400, y: lv * H + 60 })
      }
    })
  })

  return nodes.map((n) => ({
    ...n,
    position: positioned.get(n.id) ?? n.position
  }))
}

// ── Component ─────────────────────────────────────────────────────────────────
export const Canvas = forwardRef<CanvasHandle, Props>(function Canvas({ tipoEnlaceActivo, mostrarLeyendas }, ref) {
  const temaOscuro       = useAppStore((s) => s.temaOscuro)
  const ingenieriaActiva = useAppStore((s) => s.ingenieriaActiva)
  const guardarCambios   = useAppStore((s) => s.guardarCambios)
  const marcarCambios    = useAppStore((s) => s.marcarCambios)

  const [nodes, setNodes, onNodesChange] = useNodesState(ingenieriaActiva?.nodes ?? [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(ingenieriaActiva?.edges ?? [])
  const [selectedItem, setSelectedItem]  = useState<SelectedItem | null>(null)
  const [panelModo, setPanelModo]        = useState<PanelModo>('fijo')
  const [pendingDelete, setPendingDelete] = useState<{
    tipo: 'node' | 'edge'; id: string; nombre: string
  } | null>(null)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const bgCanvasRef     = useRef<HTMLCanvasElement>(null)
  const bgViewport      = useRef({ x: 0, y: 0, zoom: 1 })
  const bgColorRef      = useRef('')
  const dotColorRef     = useRef('')
  // Tracks which index in ZOOM_LEVELS the user is on — avoids relying on stale getViewport()
  const zoomIdxRef      = useRef(3) // default = nivel 4 = ZOOM_LEVELS[3] = 1.5
  const [rfInstance, setRfInstance] = useState<any>(null)
  const [minimapOpen, setMinimapOpen]    = useState(true)
  const [locked, setLocked]              = useState(false)
  const [isLinkDrag, setIsLinkDrag]      = useState(false)
  const edgeUpdateSuccessful = useRef(true)

  // Track changes
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes)
    const hasPositionChange = changes.some((c: any) => c.type === 'position' && c.dragging === false)
    const hasDeletion = changes.some((c: any) => c.type === 'remove')
    if (hasPositionChange || hasDeletion) marcarCambios()
  }, [onNodesChange, marcarCambios])

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes)
    const hasDeletion = changes.some((c: any) => c.type === 'remove')
    if (hasDeletion) marcarCambios()
  }, [onEdgesChange, marcarCambios])

  // Drop dispositivo from sidebar
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const tipo = e.dataTransfer.getData('application/dispositivo') as TipoDispositivo
    if (!tipo || !rfInstance) return

    const bounds = reactFlowWrapper.current?.getBoundingClientRect()
    if (!bounds) return
    const position = rfInstance.screenToFlowPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top })

    const newNode: Node = {
      id:   generarId('node'),
      type: 'dispositivo',
      position,
      data: {
        tipo,
        label:          tipo,
        origen:         'Manual',
        registradoCMDB: false,
        metadatos:      { ...DEFAULT_META, hostname: tipo }
      } as DispositivoData
    }
    setNodes((ns) => [...ns, newNode])
    marcarCambios()
  }, [rfInstance, setNodes, marcarCambios])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }

  const isValidConnection = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return false
    return connection.source !== connection.target
  }, [])

  // Connect nodes
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return
    if (connection.source === connection.target) return
    const style = ENLACE_STYLE[tipoEnlaceActivo]
    setEdges((es) => addEdge({
      ...connection,
      type: 'enlace',
      style,
      data: {
        tipo:           tipoEnlaceActivo,
        origen:         'Manual',
        registradoCMDB: false,
        metadatos: {
          numeroEnlace: '', puertoSalida: '', etiquetaSalida: '',
          puertoLlegada: '', etiquetaLlegada: '', servicios: '',
          customFields: {}
        }
      } as EnlaceData
    }, es))
    marcarCambios()
  }, [tipoEnlaceActivo, setEdges, marcarCambios])

  // Select node / edge
  const onNodeClick = (_: React.MouseEvent, node: Node) =>
    setSelectedItem({ kind: 'node', item: node })

  const onEdgeClick = (_: React.MouseEvent, edge: Edge) =>
    setSelectedItem({ kind: 'edge', item: edge })

  const onPaneClick = () => setSelectedItem(null)

  // Update node data from panel
  const updateNodeData = useCallback((nodeId: string, partial: Partial<DispositivoData>) => {
    setNodes((ns) => ns.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...partial } } : n
    ))
    setSelectedItem((prev) =>
      prev?.kind === 'node' && prev.item.id === nodeId
        ? { ...prev, item: { ...prev.item, data: { ...prev.item.data, ...partial } } }
        : prev
    )
    marcarCambios()
  }, [setNodes, marcarCambios])

  // Update edge data from panel
  const updateEdgeData = useCallback((edgeId: string, partial: Partial<EnlaceData>) => {
    setEdges((es) => es.map((e) => {
      if (e.id !== edgeId) return e
      const newData = { ...e.data, ...partial }
      const style = ENLACE_STYLE[newData.tipo as TipoEnlace] ?? e.style
      return { ...e, data: newData, style }
    }))
    setSelectedItem((prev) =>
      prev?.kind === 'edge' && prev.item.id === edgeId
        ? { ...prev, item: { ...prev.item, data: { ...prev.item.data, ...partial } } }
        : prev
    )
    marcarCambios()
  }, [setEdges, marcarCambios])

  // Reconnect edge to different handles by dragging the endpoint
  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false
    setIsLinkDrag(true)
  }, [])

  const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
    if (!newConnection.source || !newConnection.target) return
    if (newConnection.source === newConnection.target) return   // no self-loops
    edgeUpdateSuccessful.current = true
    // Update in-place: preserve edge ID and all data, only change connection endpoints
    setEdges(es => es.map(e =>
      e.id !== oldEdge.id ? e : {
        ...e,
        source:       newConnection.source!,
        target:       newConnection.target!,
        sourceHandle: newConnection.sourceHandle ?? null,
        targetHandle: newConnection.targetHandle ?? null,
      }
    ))
    setSelectedItem(prev =>
      prev?.kind === 'edge' && prev.item.id === oldEdge.id ? null : prev
    )
    marcarCambios()
  }, [setEdges, marcarCambios])

  const onEdgeUpdateEnd = useCallback((_: MouseEvent | TouchEvent, edge: Edge) => {
    setIsLinkDrag(false)
    if (!edgeUpdateSuccessful.current) {
      // Drop fallido o self-loop: restaurar el enlace si ReactFlow lo quitó
      setEdges(es => es.some(e => e.id === edge.id) ? es : [...es, edge])
    }
    edgeUpdateSuccessful.current = true
  }, [setEdges])

  // Delete node / edge (actual execution — only called after confirmation)
  const deleteNode = useCallback((nodeId: string) => {
    setNodes(ns => ns.filter(n => n.id !== nodeId))
    setSelectedItem(null)
    marcarCambios()
  }, [setNodes, marcarCambios])

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges(es => es.filter(e => e.id !== edgeId))
    setSelectedItem(null)
    marcarCambios()
  }, [setEdges, marcarCambios])

  // Request confirmation before deleting
  const solicitarBorradoNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    const nombre = (node?.data as DispositivoData)?.label ?? nodeId
    setPendingDelete({ tipo: 'node', id: nodeId, nombre })
  }, [nodes])

  const solicitarBorradoEdge = useCallback((edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId)
    const nombre = (edge?.data as EnlaceData)?.metadatos?.numeroEnlace || 'enlace'
    setPendingDelete({ tipo: 'edge', id: edgeId, nombre })
  }, [edges])

  const confirmarBorrado = useCallback(() => {
    if (!pendingDelete) return
    if (pendingDelete.tipo === 'node') deleteNode(pendingDelete.id)
    else deleteEdge(pendingDelete.id)
    setPendingDelete(null)
  }, [pendingDelete, deleteNode, deleteEdge])

  const cancelarBorrado = useCallback(() => setPendingDelete(null), [])

  const bgColor  = temaOscuro ? '#0f1117' : '#f0f2f7'
  const dotColor = temaOscuro ? '#2a3349' : '#c8ccd8'

  // Keep color refs always current without triggering re-renders
  bgColorRef.current  = bgColor
  dotColorRef.current = dotColor

  // Canvas-based dot background — physical-pixel resolution to avoid bilinear scaling artifacts
  const drawBg = useCallback(() => {
    const canvas = bgCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width, h = canvas.height
    if (!w || !h) return

    const dpr = window.devicePixelRatio || 1
    const { x, y, zoom } = bgViewport.current

    ctx.fillStyle = bgColorRef.current
    ctx.fillRect(0, 0, w, h)

    const gap = Math.round(24 * zoom * dpr)
    if (gap < 3) return
    const ox = Math.round(x * dpr)
    const oy = Math.round(y * dpr)
    const sx = ((ox % gap) + gap) % gap - gap
    const sy = ((oy % gap) + gap) % gap - gap
    const dotR = Math.max(1, Math.round(dpr))

    ctx.fillStyle = dotColorRef.current
    for (let px = sx; px < w + gap; px += gap)
      for (let py = sy; py < h + gap; py += gap) {
        ctx.beginPath()
        ctx.arc(px, py, dotR, 0, Math.PI * 2)
        ctx.fill()
      }
  }, []) // stable — reads only from refs

  const onMove = useCallback((_: any, { x, y, zoom }: { x: number; y: number; zoom: number }) => {
    bgViewport.current = { x, y, zoom }
    drawBg()
    // Keep zoomIdx in sync so button navigation works after scroll-wheel zoom
    const nearest = ZOOM_LEVELS.reduce<number>((best, z, i) =>
      Math.abs(z - zoom) < Math.abs(ZOOM_LEVELS[best] - zoom) ? i : best, 0)
    zoomIdxRef.current = nearest
  }, [drawBg])
  const onMoveEnd = onMove

  // Initialize canvas size on mount and after every resize
  useEffect(() => {
    const el = reactFlowWrapper.current
    if (!el || !rfInstance) return
    let timer: ReturnType<typeof setTimeout>
    const obs = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const canvas = bgCanvasRef.current
        if (canvas) { const dpr = window.devicePixelRatio || 1; canvas.width = Math.round(el.offsetWidth * dpr); canvas.height = Math.round(el.offsetHeight * dpr); canvas.style.width = el.offsetWidth + 'px'; canvas.style.height = el.offsetHeight + 'px' }
        // Solo redibuja el canvas sin llamar fitView — preserva el nivel de zoom activo
        const v = rfInstance.getViewport()
        bgViewport.current = v
        drawBg()
      }, 200)
    })
    obs.observe(el)
    return () => { clearTimeout(timer); obs.disconnect() }
  }, [rfInstance, drawBg])

  // Initial draw after rfInstance is ready — size canvas with DPR before first draw
  useEffect(() => {
    if (!rfInstance) return
    const el = reactFlowWrapper.current
    if (el) {
      const canvas = bgCanvasRef.current
      if (canvas) {
        const dpr = window.devicePixelRatio || 1
        canvas.width  = Math.round(el.offsetWidth  * dpr)
        canvas.height = Math.round(el.offsetHeight * dpr)
        canvas.style.width  = el.offsetWidth  + 'px'
        canvas.style.height = el.offsetHeight + 'px'
      }
    }
    // fitView (from prop) runs in a useEffect inside ReactFlow after this one;
    // wait one tick, then enforce the default zoom level explicitly
    setTimeout(() => {
      zoomIdxRef.current = 3   // nivel 4 = ZOOM_LEVELS[3] = 1.5
      rfInstance.zoomTo(ZOOM_LEVELS[3], { duration: 0 })
      requestAnimationFrame(() => {
        const v = rfInstance.getViewport()
        bgViewport.current = { x: v.x, y: v.y, zoom: ZOOM_LEVELS[3] }
        drawBg()
      })
    }, 150)
  }, [rfInstance, drawBg])

  // Redraw when theme colors change
  useEffect(() => { drawBg() }, [bgColor, dotColor, drawBg])

  // Delete key shows confirmation dialog (RF's deleteKeyCode is disabled)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Delete') return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      if (!selectedItem) return
      e.preventDefault()
      if (selectedItem.kind === 'node') solicitarBorradoNode(selectedItem.item.id)
      else solicitarBorradoEdge(selectedItem.item.id)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selectedItem, solicitarBorradoNode, solicitarBorradoEdge])

  // Auto-layout
  const handleAutoLayout = useCallback((modo: LayoutModo) => {
    if (modo === 'conexiones') {
      setEdges(es => optimizarConexiones(nodes, es))
      marcarCambios()
      return
    }
    setNodes((ns) => aplicarLayout(ns, edges, modo))
    marcarCambios()
    setTimeout(() => {
      rfInstance?.fitView({ padding: 0.2 })
      setTimeout(() => {
        if (rfInstance) {
          const v = rfInstance.getViewport()
          bgViewport.current = v
          drawBg()
        }
      }, 60)
    }, 50)
  }, [nodes, edges, setNodes, setEdges, marcarCambios, rfInstance, drawBg])

  // Expose handleAutoLayout to parent via ref
  useImperativeHandle(ref, () => ({ autoLayout: handleAutoLayout }), [handleAutoLayout])

  const doZoomIn = useCallback(() => {
    if (!rfInstance) return
    const next = Math.min(zoomIdxRef.current + 1, ZOOM_LEVELS.length - 1)
    const target = ZOOM_LEVELS[next]
    zoomIdxRef.current = next
    rfInstance.zoomTo(target, { duration: 0 })
    requestAnimationFrame(() => {
      const { x, y } = rfInstance.getViewport()
      bgViewport.current = { x, y, zoom: target }
      drawBg()
    })
  }, [rfInstance, drawBg])

  const doZoomOut = useCallback(() => {
    if (!rfInstance) return
    const next = Math.max(zoomIdxRef.current - 1, 0)
    const target = ZOOM_LEVELS[next]
    zoomIdxRef.current = next
    rfInstance.zoomTo(target, { duration: 0 })
    requestAnimationFrame(() => {
      const { x, y } = rfInstance.getViewport()
      bgViewport.current = { x, y, zoom: target }
      drawBg()
    })
  }, [rfInstance, drawBg])

  const handleGuardar = () => guardarCambios(nodes, edges)

  const handleExportExcel = () =>
    alert('Exportación a Excel (pendiente de implementar con servicio real)')

  const handleExportPDF = () =>
    alert('Exportación a PDF (pendiente de implementar con servicio real)')

  const handleFullscreen = () =>
    reactFlowWrapper.current?.requestFullscreen?.()

  // Solo el enlace seleccionado puede re-enrutarse arrastrando sus extremos.
  // updatable: false en todos los demás previene confusión cuando varios enlaces
  // comparten el mismo punto de conexión.
  const selectedEdgeId = selectedItem?.kind === 'edge' ? selectedItem.item.id : null
  const displayEdges = useMemo(
    () => edges.map(e => ({ ...e, updatable: e.id === selectedEdgeId })),
    [edges, selectedEdgeId]
  )

  return (
    <div className="flex flex-1 overflow-hidden">
      <div
        ref={reactFlowWrapper}
        className="flex-1 relative"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <canvas ref={bgCanvasRef} className="absolute inset-0 pointer-events-none" />
        <ReactFlow
          nodes={nodes}
          edges={displayEdges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onConnectStart={() => setIsLinkDrag(true)}
          onConnectEnd={() => setIsLinkDrag(false)}
          isValidConnection={isValidConnection}
          onEdgeUpdateStart={onEdgeUpdateStart}
          onEdgeUpdate={onEdgeUpdate}
          onEdgeUpdateEnd={onEdgeUpdateEnd}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onInit={setRfInstance}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.15, maxZoom: ZOOM_LEVELS[3] }}
          minZoom={0.3}
          maxZoom={2.1}
          deleteKeyCode={null}
          connectionRadius={40}
          edgeUpdaterRadius={12}
          className={`touch-none${isLinkDrag ? ' rf-link-drag' : ''}`}
          proOptions={{ hideAttribution: true }}
          onMove={onMove}
          onMoveEnd={onMoveEnd}
          nodesDraggable={!locked}
          nodesConnectable={!locked}
          elementsSelectable={!locked}
        >
          <Controls
            showZoom={false} showFitView={false} showInteractive={false}
            className="!bottom-4 !left-4 !top-auto !right-auto !shadow-none"
          >
            <ControlButton onClick={doZoomIn} title="Acercar">
              <svg viewBox="0 0 32 32" fill="currentColor"><path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z"/></svg>
            </ControlButton>
            <ControlButton onClick={doZoomOut} title="Alejar">
              <svg viewBox="0 0 32 5" fill="currentColor"><path d="M0 0h32v4.2H0z"/></svg>
            </ControlButton>
            <ControlButton onClick={() => rfInstance?.fitView({ padding: 0.15 })} title="Ajustar vista">
              <svg viewBox="0 0 32 30" fill="currentColor"><path d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215V29.5h5.215c2.577 0 4.631-2.054 4.631-4.631v-5.215h-3.692v5.215zM4.631 25.77a.939.939 0 01-.939-.939v-5.215H0v5.215C0 27.408 2.054 29.5 4.631 29.5h5.215v-3.692H4.631z"/></svg>
            </ControlButton>
            <ControlButton
              onClick={() => setLocked(l => !l)}
              title={locked ? 'Desbloquear canvas' : 'Bloquear canvas'}
            >
              {locked ? (
                <svg viewBox="0 0 25 32" fill="currentColor"><path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238C0 30.619 1.37 32 3.048 32h18.285c1.677 0 3.048-1.381 3.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.59 0 4.724 2.133 4.724 4.724v3.048z"/></svg>
              ) : (
                <svg viewBox="0 0 25 32" fill="currentColor"><path d="M21.333 10.667H6.762V7.619C6.762 5.029 8.895 2.895 11.486 2.895c2.59 0 4.723 2.134 4.723 4.724h3.048C19.257 3.429 15.828 0 11.638 0 7.448 0 4.019 3.429 4.019 7.619v3.048H2.495A2.49 2.49 0 000 13.143v16.19C0 30.78 1.143 32 2.495 32H21.333c1.353 0 2.476-1.22 2.476-2.667v-16.19c0-1.447-1.123-2.476-2.476-2.476zm-9.143 13.866a3.048 3.048 0 110-6.095 3.048 3.048 0 010 6.095z"/></svg>
              )}
            </ControlButton>
          </Controls>
          <Panel position="bottom-right" style={{ marginRight: 175, marginBottom: 8 }}>
            <MinimapPanel
              nodes={nodes}
              open={minimapOpen}
              onToggle={() => setMinimapOpen(o => !o)}
              temaOscuro={temaOscuro}
            />
          </Panel>
          {mostrarLeyendas && (
            <Panel position="bottom-left" style={{ marginLeft: 8, marginBottom: 160 }}>
              <LeyendasPanel />
            </Panel>
          )}
        </ReactFlow>

        <FabMenu
          onGuardar={handleGuardar}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onFullscreen={handleFullscreen}
        />

        {/* Delete confirmation modal */}
        {pendingDelete && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={cancelarBorrado}
          >
            <div
              className="bg-white dark:bg-[#161b27] border border-gray-200 dark:border-[#2a3349] rounded-xl shadow-2xl p-6 max-w-sm mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Confirmar eliminación
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                {'¿Eliminar '}
                {pendingDelete.tipo === 'node' ? 'el dispositivo' : 'el enlace'}
                {' '}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  &ldquo;{pendingDelete.nombre}&rdquo;
                </span>
                {'?'}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelarBorrado}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#2a3349] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e2435] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarBorrado}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* "Mostrar propiedades" button when panel is hidden */}
        {panelModo === 'oculto' && selectedItem && (
          <button
            onClick={() => setPanelModo('fijo')}
            className="
              absolute right-0 top-1/2 -translate-y-1/2 z-20
              bg-white dark:bg-[#161b27]
              border border-r-0 border-gray-200 dark:border-[#2a3349]
              rounded-l-lg px-1.5 py-3 text-[9px] text-gray-500 dark:text-gray-400
              hover:text-blue-500 hover:border-blue-400 transition-colors shadow-md
            "
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            title="Mostrar propiedades"
          >
            ◀ Props
          </button>
        )}
      </div>

      {/* Panel fijo (sólo se renderiza en modo fijo para mantener el flex layout) */}
      {panelModo !== 'oculto' && (
        <PropiedadesPanel
          selectedItem={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdateNode={updateNodeData}
          onUpdateEdge={updateEdgeData}
          onDeleteNode={solicitarBorradoNode}
          onDeleteEdge={solicitarBorradoEdge}
          panelModo={panelModo}
          onChangeModo={setPanelModo}
        />
      )}
    </div>
  )
})
