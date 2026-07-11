'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { DeviceIcon, LIGHT_COLORS } from '@/components/ui/DeviceIcons'
import { ORIGEN_COLOR } from '@/lib/utils'
import { useAppStore } from '@/store/app.store'
import type { DispositivoData } from '@/types'

// 6px handles — mismo tamaño que el default de ReactFlow para que el centrado sea exacto
const HANDLE_CLS = '!bg-gray-400 dark:!bg-gray-500 !w-1.5 !h-1.5 !border-none !rounded-full'

function DispositivoNode({ data, selected }: NodeProps<DispositivoData>) {
  const temaOscuro = useAppStore((s) => s.temaOscuro)

  const lightColors = LIGHT_COLORS[data.tipo]
  const iconColor       = temaOscuro ? undefined : lightColors?.color
  const iconStrokeColor = temaOscuro ? undefined : lightColors?.strokeColor
  const origenColor     = ORIGEN_COLOR[data.origen]

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
      {/* Handles — source (visible) */}
      <Handle type="source" position={Position.Top}    id="top"    className={HANDLE_CLS} />
      <Handle type="source" position={Position.Right}  id="right"  className={HANDLE_CLS} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLS} />
      <Handle type="source" position={Position.Left}   id="left"   className={HANDLE_CLS} />
      {/* Handles — target: invisibles pero con área amplia para facilitar conexiones/reconexiones */}
      <Handle type="target" position={Position.Top}    id="top-t"    className="opacity-0 !w-5 !h-5 !border-none" />
      <Handle type="target" position={Position.Right}  id="right-t"  className="opacity-0 !w-5 !h-5 !border-none" />
      <Handle type="target" position={Position.Bottom} id="bottom-t" className="opacity-0 !w-5 !h-5 !border-none" />
      <Handle type="target" position={Position.Left}   id="left-t"   className="opacity-0 !w-5 !h-5 !border-none" />

      {/* Ícono */}
      <div className="relative rf-node-body">
        <DeviceIcon tipo={data.tipo} size={52} color={iconColor} strokeColor={iconStrokeColor} />

        {/* Tilde CMDB — top-left */}
        <span
          className="absolute -top-1 -left-1 flex items-center justify-center w-4 h-4 rounded-full bg-white/90 dark:bg-gray-900/80"
          title={data.registradoCMDB ? 'Registrado en CMDB' : 'No registrado en CMDB'}
        >
          <svg width="11" height="11" viewBox="0 0 14 14">
            <polyline
              points="1,8 5,12 13,2"
              stroke={data.registradoCMDB ? '#0D9488' : '#9098B0'}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {/* Punto de origen — top-right */}
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"
          style={{ backgroundColor: origenColor }}
          title={`Origen: ${data.origen}`}
        />
      </div>

      {/* Label */}
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
