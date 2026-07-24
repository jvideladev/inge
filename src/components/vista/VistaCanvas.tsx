'use client'
/**
 * Canvas de solo lectura para popup / iframe de publicación (RFC).
 * No usa el store de edición; recibe nodes/edges por props.
 */
import { useEffect, useMemo } from 'react'
import ReactFlow, { ReactFlowProvider, Background, Controls, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'
import DispositivoNode from '@/components/canvas/DispositivoNode'
import EnlaceEdge from '@/components/canvas/EnlaceEdge'
import { useConfigStore } from '@/store/config.store'
import { normalizeEnlaceData } from '@/lib/enlace'

const NODE_TYPES = { dispositivo: DispositivoNode }
const EDGE_TYPES = { enlace: EnlaceEdge }

function VistaInner({ nodes, edges }: { nodes: any[]; edges: any[] }) {
  const fetchConfig = useConfigStore((s) => s.fetchConfig)
  const loaded = useConfigStore((s) => s.loaded)

  useEffect(() => {
    if (!loaded) void fetchConfig()
  }, [loaded, fetchConfig])

  const rfNodes = useMemo(() => nodes ?? [], [nodes])
  const rfEdges = useMemo(
    () =>
      (edges ?? []).map((e) => ({
        ...e,
        type: e.type ?? 'enlace',
        data: normalizeEnlaceData(e.data),
      })),
    [edges],
  )

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={true}
      panOnDrag
      zoomOnScroll
      proOptions={{ hideAttribution: true }}
      minZoom={0.2}
      maxZoom={2}
    >
      <Background gap={16} size={1} />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable />
    </ReactFlow>
  )
}

export function VistaCanvas({ nodes, edges }: { nodes: any[]; edges: any[] }) {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <VistaInner nodes={nodes} edges={edges} />
      </ReactFlowProvider>
    </div>
  )
}
