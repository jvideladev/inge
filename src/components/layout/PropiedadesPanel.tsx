'use client'
import { useRef, useState, useCallback } from 'react'
import { ORIGEN_COLOR } from '@/lib/utils'
import type { DispositivoData, EnlaceData, MetadatoDispositivo, MetadatoEnlace, TipoEnlace } from '@/types'
import type { Node, Edge } from 'reactflow'

export type PanelModo = 'fijo' | 'flotante' | 'oculto'

export type SelectedItem =
  | { kind: 'node'; item: Node }
  | { kind: 'edge'; item: Edge }

interface Props {
  selectedItem: SelectedItem | null
  onClose:      () => void
  onUpdateNode: (nodeId: string, data: Partial<DispositivoData>) => void
  onUpdateEdge: (edgeId: string, data: Partial<EnlaceData>) => void
  onDeleteNode: (nodeId: string) => void
  onDeleteEdge: (edgeId: string) => void
  panelModo:    PanelModo
  onChangeModo: (m: PanelModo) => void
}

const TIPOS_ENLACE: TipoEnlace[] = ['UTP', 'Fibra', 'Microonda', 'Logico']

// ── Toast ─────────────────────────────────────────────────────────────────────

function useToast() {
  const [open, setOpen]       = useState(false)
  const [visible, setVisible] = useState(false)
  const t1 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const t2 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const fire = useCallback(() => {
    clearTimeout(t1.current)
    clearTimeout(t2.current)
    setOpen(true)
    setVisible(false)
    // Double rAF so the initial opacity-0 renders before the transition kicks in
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    t1.current = setTimeout(() => setVisible(false), 2200)
    t2.current = setTimeout(() => setOpen(false),    2550)
  }, [])

  return { open, visible, fire }
}

function Toast({ open, visible }: { open: boolean; visible: boolean }) {
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
        <circle cx="8.5" cy="8.5" r="7.25" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 9 L7.5 11.5 L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Campo agregado
    </div>
  )
}

// ── Draggable panel ───────────────────────────────────────────────────────────

function useDraggable(initialX: number, initialY: number) {
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current) return
      setPos({ x: dragStart.current.px + ev.clientX - dragStart.current.mx, y: dragStart.current.py + ev.clientY - dragStart.current.my })
    }
    const onUp = () => { dragStart.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pos])

  return { pos, onMouseDown }
}

// ── Node properties ───────────────────────────────────────────────────────────

function NodeProps({ node, onUpdateNode }: { node: Node; onUpdateNode: (id: string, d: Partial<DispositivoData>) => void }) {
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')
  const toast = useToast()
  const data: DispositivoData = node.data
  const origenColor = ORIGEN_COLOR[data.origen]

  const updateMeta = (key: keyof MetadatoDispositivo, value: string) =>
    onUpdateNode(node.id, { metadatos: { ...data.metadatos, [key]: value } })

  const addCustomField = () => {
    if (!newKey.trim()) return
    onUpdateNode(node.id, { metadatos: { ...data.metadatos, customFields: { ...data.metadatos.customFields, [newKey]: newVal } } })
    setNewKey(''); setNewVal('')
    toast.fire()
  }

  const removeCustomField = (k: string) => {
    const cf = { ...data.metadatos.customFields }
    delete cf[k]
    onUpdateNode(node.id, { metadatos: { ...data.metadatos, customFields: cf } })
  }

  return (
    <>
      {/* CMDB badge */}
      <div className="mx-3 mt-3">
        {data.registradoCMDB ? (
          <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-400 text-teal-600 dark:text-teal-400 rounded-md px-2.5 py-2 text-sm font-medium">
            <CmdbCheck /> Registrado en CMDB
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800/40 border border-[#BFD0E8] dark:border-gray-700 text-gray-500 rounded-md px-2.5 py-2 text-sm">
            <CmdbX /> No registrado en CMDB
          </div>
        )}
      </div>

      {/* Origen badge */}
      <div className="mx-3 mt-2 mb-2">
        <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium border"
          style={{ backgroundColor: `${origenColor}18`, borderColor: `${origenColor}40`, color: origenColor }}>
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: origenColor }}/>
          Origen: {data.origen}
        </div>
      </div>

      <PanelDivider />

      {/* Campos estándar */}
      <div className="px-3 pt-2 pb-3 flex flex-col gap-2">
        {([
          ['label',      'Nombre'],
          ['hostname',   'Hostname'],
          ['modelo',     'Modelo'],
          ['ip',         'IP / Dirección'],
          ['serial',     'Serial'],
          ['ubicacion',  'Ubicación'],
          ['fabricante', 'Fabricante'],
        ] as [string, string][]).map(([key, label]) => {
          const isLabel = key === 'label'
          const val = isLabel ? data.label : (data.metadatos[key as keyof MetadatoDispositivo] as string)
          return (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-wider mb-1">{label}</p>
              <input
                className="w-full text-sm px-2.5 py-1.5 rounded border bg-white dark:bg-[#1e2435] border-[#BFD0E8] dark:border-[#2a3349] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={val}
                onChange={(e) => isLabel ? onUpdateNode(node.id, { label: e.target.value }) : updateMeta(key as keyof MetadatoDispositivo, e.target.value)}
              />
            </div>
          )
        })}
      </div>

      <PanelDivider />

      {/* Agregar campo personalizado */}
      <div className="px-3 pt-2 flex flex-col gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-wider mb-1">Título</p>
          <input
            placeholder="Nombre del campo"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="w-full text-sm px-2.5 py-1.5 rounded border bg-white dark:bg-[#1e2435] border-[#BFD0E8] dark:border-[#2a3349] text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-wider mb-1">Valor</p>
          <input
            placeholder="Contenido del campo"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomField()}
            className="w-full text-sm px-2.5 py-1.5 rounded border bg-white dark:bg-[#1e2435] border-[#BFD0E8] dark:border-[#2a3349] text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="px-3 pt-2 pb-3">
        <button
          onClick={addCustomField}
          className="w-full text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg py-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          + Agregar campo
        </button>
      </div>

      {/* Campos personalizados — se muestran debajo del botón */}
      {Object.keys(data.metadatos.customFields).length > 0 && (
        <>
          <PanelDivider />
          <div className="px-3 pt-2 pb-4 flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-wider">
              Campos personalizados
            </p>
            {Object.entries(data.metadatos.customFields).map(([k, v]) => (
              <div key={k}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-wider truncate">{k}</p>
                  <button
                    onClick={() => removeCustomField(k)}
                    title="Eliminar campo"
                    className="ml-2 flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <input
                  value={v}
                  onChange={(e) => onUpdateNode(node.id, { metadatos: { ...data.metadatos, customFields: { ...data.metadatos.customFields, [k]: e.target.value } } })}
                  className="w-full text-sm px-2.5 py-1.5 rounded border bg-white dark:bg-[#1e2435] border-[#BFD0E8] dark:border-[#2a3349] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </>
      )}

      <Toast open={toast.open} visible={toast.visible} />
    </>
  )
}

// ── Edge properties ───────────────────────────────────────────────────────────

function EdgeProps({ edge, onUpdateEdge }: { edge: Edge; onUpdateEdge: (id: string, d: Partial<EnlaceData>) => void }) {
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')
  const toast = useToast()
  const data: EnlaceData = edge.data
  const origenColor = ORIGEN_COLOR[data.origen]

  const updateMeta = (key: keyof MetadatoEnlace, value: string) =>
    onUpdateEdge(edge.id, { metadatos: { ...data.metadatos, [key]: value } })

  const addCustomField = () => {
    if (!newKey.trim()) return
    onUpdateEdge(edge.id, { metadatos: { ...data.metadatos, customFields: { ...data.metadatos.customFields, [newKey]: newVal } } })
    setNewKey(''); setNewVal('')
    toast.fire()
  }

  const removeCustomField = (k: string) => {
    const cf = { ...data.metadatos.customFields }
    delete cf[k]
    onUpdateEdge(edge.id, { metadatos: { ...data.metadatos, customFields: cf } })
  }

  return (
    <>
      {/* CMDB badge */}
      <div className="mx-3 mt-3">
        {data.registradoCMDB ? (
          <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 border border-teal-400 text-teal-600 dark:text-teal-400 rounded-md px-2.5 py-2 text-sm font-medium">
            <CmdbCheck /> Registrado en CMDB
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800/40 border border-[#BFD0E8] dark:border-gray-700 text-gray-500 rounded-md px-2.5 py-2 text-sm">
            <CmdbX /> No registrado en CMDB
          </div>
        )}
      </div>

      {/* Origen badge */}
      <div className="mx-3 mt-2 mb-2">
        <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium border"
          style={{ backgroundColor: `${origenColor}18`, borderColor: `${origenColor}40`, color: origenColor }}>
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: origenColor }}/>
          Origen: {data.origen}
        </div>
      </div>

      <PanelDivider />

      {/* Tipo de enlace */}
      <div className="px-3 pt-2 pb-1 flex items-center gap-2">
        <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-wider flex-shrink-0">Tipo de enlace</p>
        <select
          value={data.tipo}
          onChange={(e) => onUpdateEdge(edge.id, { tipo: e.target.value as TipoEnlace, metadatos: data.metadatos })}
          className="flex-1 text-sm px-2.5 py-1.5 rounded border bg-white dark:bg-[#1e2435] border-[#BFD0E8] dark:border-[#2a3349] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {TIPOS_ENLACE.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Campos del enlace */}
      <div className="px-3 pt-1 pb-3 flex flex-col gap-2">
        {([
          ['uuid',            'UUID'],
          ['numeroEnlace',    'Nombre enlace'],
          ['puertoSalida',    'Puerto origen'],
          ['etiquetaSalida',  'Etiqueta origen'],
          ['puertoLlegada',   'Puerto destino'],
          ['etiquetaLlegada', 'Etiqueta destino'],
          ['servicios',       'Servicios'],
        ] as [keyof MetadatoEnlace, string][]).map(([key, label]) => (
          <div key={key}>
            <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-wider mb-1">{label}</p>
            <input
              className="w-full text-sm px-2.5 py-1.5 rounded border bg-white dark:bg-[#1e2435] border-[#BFD0E8] dark:border-[#2a3349] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={data.metadatos[key] as string}
              onChange={(e) => updateMeta(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <PanelDivider />

      {/* Agregar campo personalizado */}
      <div className="px-3 pt-2 flex flex-col gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-wider mb-1">Título</p>
          <input
            placeholder="Nombre del campo"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="w-full text-sm px-2.5 py-1.5 rounded border bg-white dark:bg-[#1e2435] border-[#BFD0E8] dark:border-[#2a3349] text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-wider mb-1">Valor</p>
          <input
            placeholder="Contenido del campo"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomField()}
            className="w-full text-sm px-2.5 py-1.5 rounded border bg-white dark:bg-[#1e2435] border-[#BFD0E8] dark:border-[#2a3349] text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="px-3 pt-2 pb-3">
        <button
          onClick={addCustomField}
          className="w-full text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg py-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          + Agregar campo
        </button>
      </div>

      {/* Campos personalizados — se muestran debajo del botón */}
      {Object.keys(data.metadatos.customFields).length > 0 && (
        <>
          <PanelDivider />
          <div className="px-3 pt-2 pb-4 flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-wider">
              Campos personalizados
            </p>
            {Object.entries(data.metadatos.customFields).map(([k, v]) => (
              <div key={k}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-600 dark:text-[#5a6380] uppercase tracking-wider truncate">{k}</p>
                  <button
                    onClick={() => removeCustomField(k)}
                    title="Eliminar campo"
                    className="ml-2 flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <input
                  value={v}
                  onChange={(e) => onUpdateEdge(edge.id, { metadatos: { ...data.metadatos, customFields: { ...data.metadatos.customFields, [k]: e.target.value } } })}
                  className="w-full text-sm px-2.5 py-1.5 rounded border bg-white dark:bg-[#1e2435] border-[#BFD0E8] dark:border-[#2a3349] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </>
      )}

      <Toast open={toast.open} visible={toast.visible} />
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function PropiedadesPanel({ selectedItem, onClose, onUpdateNode, onUpdateEdge, onDeleteNode, onDeleteEdge, panelModo, onChangeModo }: Props) {
  const { pos, onMouseDown } = useDraggable(
    typeof window !== 'undefined' ? Math.max(window.innerWidth - 270, 10) : 800,
    80
  )

  if (!selectedItem || panelModo === 'oculto') return null

  const isNode = selectedItem.kind === 'node'

  const panelContent = (
    <div className={`
      flex flex-col overflow-hidden
      bg-[#EDF2FA] dark:bg-[#161b27]
      ${panelModo === 'fijo' ? 'border-l border-[#BFD0E8] dark:border-[#2a3349]' : 'rounded-xl border border-[#BFD0E8] dark:border-[#2a3349] shadow-2xl'}
    `}
      style={panelModo === 'fijo' ? { width: 248 } : { width: 256, maxHeight: '82vh' }}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 border-b border-[#D0DEEF] dark:border-[#2a3349] flex-shrink-0 ${panelModo === 'flotante' ? 'cursor-move select-none' : ''}`}
        onMouseDown={panelModo === 'flotante' ? onMouseDown : undefined}
      >
        <span className="text-base font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[150px]">
          {isNode
            ? (selectedItem.item.data as DispositivoData).label
            : `Enlace ${(selectedItem.item.data as EnlaceData).metadatos?.numeroEnlace || ''}`}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => isNode ? onDeleteNode(selectedItem.item.id) : onDeleteEdge(selectedItem.item.id)}
            title="Eliminar"
            className="w-6 h-6 flex items-center justify-center rounded text-sm text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >🗑</button>
          <div className="w-px h-4 bg-[#BFD0E8] dark:bg-[#2a3349]" />
          {(['fijo', 'flotante', 'oculto'] as PanelModo[]).map((m) => (
            <button key={m} onClick={() => onChangeModo(m)}
              title={m === 'fijo' ? 'Fijo a la derecha' : m === 'flotante' ? 'Flotante' : 'Ocultar'}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs transition-colors ${
                panelModo === m
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-[#D0DEEF] dark:hover:bg-[#2a3349]'
              }`}>
              {m === 'fijo' ? '▣' : m === 'flotante' ? '⧉' : '✕'}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1">
        {isNode
          ? <NodeProps node={selectedItem.item} onUpdateNode={onUpdateNode} />
          : <EdgeProps edge={selectedItem.item} onUpdateEdge={onUpdateEdge} />
        }
      </div>
    </div>
  )

  if (panelModo === 'flotante') {
    return (
      <div style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 1000 }}>
        {panelContent}
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 flex flex-col overflow-y-auto bg-[#EDF2FA] dark:bg-[#161b27]" style={{ width: 248 }}>
      {panelContent}
    </div>
  )
}

function PanelDivider() {
  return <div className="h-px bg-[#D0DEEF] dark:bg-[#2a3349] mx-3 my-1"/>
}
function CmdbCheck() {
  return <svg width="13" height="13" viewBox="0 0 14 14"><polyline points="1,8 5,12 13,2" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function CmdbX() {
  return <svg width="13" height="13" viewBox="0 0 14 14"><line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
}
