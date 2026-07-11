'use client'
import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from 'reactflow'
import { ENLACE_STYLE, ORIGEN_COLOR } from '@/lib/utils'
import { useAppStore } from '@/store/app.store'
import type { EnlaceData } from '@/types'

function EnlaceEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, selected
}: EdgeProps<EnlaceData>) {
  const temaOscuro = useAppStore((s) => s.temaOscuro)
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition
  })

  const style      = data ? ENLACE_STYLE[data.tipo] : ENLACE_STYLE.UTP
  const origenColor = data ? ORIGEN_COLOR[data.origen] : '#9098B0'
  const cmdbColor   = data?.registradoCMDB ? '#0D9488' : '#9098B0'
  const cmdbTitle   = data?.registradoCMDB ? 'Registrado en CMDB' : 'Sin CMDB'

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          ...(selected
            ? {
                opacity: 1,
                strokeWidth: style.strokeWidth + 0.5,
                filter: temaOscuro
                  ? 'drop-shadow(0 0 3px rgba(255,255,255,0.5)) drop-shadow(0 0 8px rgba(255,255,255,0.25))'
                  : 'drop-shadow(0 0 2px rgba(59,130,246,0.95)) drop-shadow(0 0 6px rgba(59,130,246,0.55))',
              }
            : { opacity: 0.8 }),
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'none',
          }}
        >
          {/* Badge principal: origen + CMDB */}
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/95 dark:bg-[#161b27]/95 border shadow-sm ${
            selected
              ? 'border-blue-400 dark:border-[#4a8fff] ring-2 ring-blue-200/80 dark:ring-[#4a8fff]/30'
              : 'border-gray-200 dark:border-[#2a3349]'
          }`}>
            {/* Checkmark CMDB — izquierda (igual que en dispositivos) */}
            <svg width="8" height="8" viewBox="0 0 14 14" className="flex-shrink-0" role="img" aria-label={cmdbTitle}>
              <title>{cmdbTitle}</title>
              <polyline
                points="1,8 5,12 13,2"
                stroke={cmdbColor}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Separador */}
            <span className="w-px h-2.5 bg-gray-200 dark:bg-[#2a3349] flex-shrink-0" />
            {/* Dot de origen — derecha (igual que en dispositivos) */}
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: origenColor }}
              title={`Origen: ${data?.origen ?? '—'}`}
            />
          </div>

          {/* Número de enlace debajo del badge */}
          {data?.metadatos?.numeroEnlace && (
            <div className="mt-0.5 flex justify-center">
              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 bg-white/90 dark:bg-[#161b27]/90 px-1.5 py-px rounded border border-gray-200 dark:border-[#2a3349]">
                {data.metadatos.numeroEnlace}
              </span>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(EnlaceEdge)
