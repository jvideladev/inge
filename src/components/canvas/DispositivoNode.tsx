'use client'
import { memo } from 'react'
import { Handle, Position, useStore, type NodeProps } from 'reactflow'
import { DeviceIcon } from '@/components/ui/DeviceIcons'
import { CoreIcon } from '@/components/ui/CoreIcon'
import { useAppStore } from '@/store/app.store'
import { useConfigStore } from '@/store/config.store'
import type { DispositivoData } from '@/types'

// 6px handles — mismo tamaño que el default de ReactFlow para que el centrado sea exacto
const HANDLE_CLS = '!bg-gray-400 dark:!bg-gray-500 !w-1.5 !h-1.5 !border-none !rounded-full'

function DispositivoNode({ id, data, selected }: NodeProps<DispositivoData>) {
  const temaOscuro = useAppStore((s) => s.temaOscuro)
  const dispositivoByCodigo = useConfigStore((s) => s.dispositivoByCodigo)
  const origenColorFn = useConfigStore((s) => s.origenColor)
  const cfg = dispositivoByCodigo(data.tipo)

  const extremos = useStore((s) => {
    const sel = s.edges.find((e) => (e as { updatable?: boolean }).updatable)
    if (!sel) return ''
    let out = ''
    if (sel.source === id && sel.sourceHandle) out += `S${sel.sourceHandle};`
    if (sel.target === id && sel.targetHandle) out += `T${sel.targetHandle};`
    return out
  })

  const bloquearInicio = (h: string) =>
    extremos.includes(`S${h};`) || extremos.includes(`T${h}-t;`)

  const iconColor       = temaOscuro ? cfg?.colorFillDark : cfg?.colorFillLight
  const iconStrokeColor = temaOscuro ? cfg?.colorStrokeDark : cfg?.colorStrokeLight
  const origenColor     = origenColorFn(data.origen)
  const esCore = Boolean(data.core)

  return (
    <div
      className="relative flex flex-col items-center gap-1 p-1 rounded-lg select-none transition-all duration-150"
      style={selected ? {
        outline: '1.5px dashed #3b82f6',
        outlineOffset: '0px',
        backgroundColor: 'rgba(59,130,246,0.06)',
        borderRadius: '10px',
      } : undefined}
    >
      <Handle type="source" position={Position.Top}    id="top"    className={HANDLE_CLS} isConnectableStart={!bloquearInicio('top')} />
      <Handle type="source" position={Position.Right}  id="right"  className={HANDLE_CLS} isConnectableStart={!bloquearInicio('right')} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLS} isConnectableStart={!bloquearInicio('bottom')} />
      <Handle type="source" position={Position.Left}   id="left"   className={HANDLE_CLS} isConnectableStart={!bloquearInicio('left')} />
      <Handle type="target" position={Position.Top}    id="top-t"    className="opacity-0 !w-5 !h-5 !border-none" />
      <Handle type="target" position={Position.Right}  id="right-t"  className="opacity-0 !w-5 !h-5 !border-none" />
      <Handle type="target" position={Position.Bottom} id="bottom-t" className="opacity-0 !w-5 !h-5 !border-none" />
      <Handle type="target" position={Position.Left}   id="left-t"   className="opacity-0 !w-5 !h-5 !border-none" />

      <div className="relative rf-node-body">
        <DeviceIcon tipo={data.tipo} size={52} color={iconColor} strokeColor={iconStrokeColor} />

        {/* CMDB — top-left (más chico) */}
        <span
          className="absolute -top-0.5 -left-0.5 flex items-center justify-center w-3 h-3 rounded-full bg-white/90 dark:bg-gray-900/80"
          title={data.registradoCMDB ? 'Registrado en CMDB' : 'No registrado en CMDB'}
        >
          <svg width="8" height="8" viewBox="0 0 14 14">
            {data.registradoCMDB ? (
              <polyline points="1,8 5,12 13,2" stroke="#0D9488" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <>
                <line x1="3" y1="3" x2="11" y2="11" stroke="#9098B0" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="11" y1="3" x2="3" y2="11" stroke="#9098B0" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </span>

        {/* Origen — top-right (más chico) */}
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-gray-900 shadow-sm"
          style={{ backgroundColor: origenColor }}
          title={`Origen: ${data.origen}`}
        />

        {/* Core — bottom-left */}
        <span
          className="absolute -bottom-0.5 -left-0.5 flex items-center justify-center w-3 h-3 rounded-full bg-white/90 dark:bg-gray-900/80"
          title={esCore ? 'Core' : 'No Core'}
        >
          <CoreIcon core={esCore} size={8} />
        </span>
      </div>

      <span className="text-[8px] font-semibold text-gray-800 dark:text-gray-100 leading-tight text-center max-w-[80px] truncate">
        {data.label}
      </span>
      {data.metadatos.ip && (
        <span className="text-[7px] text-gray-500 dark:text-gray-400 leading-tight">
          {data.metadatos.ip}
        </span>
      )}
    </div>
  )
}

export default memo(DispositivoNode)
