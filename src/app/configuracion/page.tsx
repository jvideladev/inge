'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { useAppStore } from '@/store/app.store'
import { useConfigStore } from '@/store/config.store'
import { configApi } from '@/lib/api'
import { DeviceIcon } from '@/components/ui/DeviceIcons'
import type { CfgCampoPanel, CfgDispositivoTipo, CfgEnlaceTipo } from '@/types/config'
import type { TipoDispositivo } from '@/types'

type Tab = 'dispositivos' | 'enlaces' | 'campos-disp' | 'campos-enl'

export default function ConfiguracionPage() {
  const router = useRouter()
  const autenticado = useAppStore((s) => s.autenticado)
  const usuario = useAppStore((s) => s.usuario)
  const restoreSession = useAppStore((s) => s.restoreSession)
  const fetchConfig = useConfigStore((s) => s.fetchConfig)

  const [tab, setTab] = useState<Tab>('dispositivos')
  const [dispositivos, setDispositivos] = useState<CfgDispositivoTipo[]>([])
  const [enlaces, setEnlaces] = useState<CfgEnlaceTipo[]>([])
  const [camposDisp, setCamposDisp] = useState<CfgCampoPanel[]>([])
  const [camposEnl, setCamposEnl] = useState<CfgCampoPanel[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const ok = autenticado || (await restoreSession())
      if (cancelled) return
      if (!ok) {
        router.replace('/login')
        return
      }
      if (useAppStore.getState().usuario.perfil !== 'Supervisor') {
        router.replace('/')
        return
      }
      setListo(true)
    })()
    return () => { cancelled = true }
  }, [autenticado, restoreSession, router])

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const data = await configApi.admin()
      setDispositivos(data.dispositivos)
      setEnlaces(data.enlaces)
      setCamposDisp(data.camposDispositivo)
      setCamposEnl(data.camposEnlace)
    } catch (e: any) {
      setMsg(e?.message ?? 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (listo) void reload()
  }, [listo, reload])

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true)
    setMsg(null)
    try {
      await configApi.patch(body)
      await reload()
      await fetchConfig()
      setMsg('Guardado')
    } catch (e: any) {
      setMsg(e?.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const moveDisp = async (codigo: string, dir: -1 | 1) => {
    const idx = dispositivos.findIndex((d) => d.codigo === codigo)
    const j = idx + dir
    if (idx < 0 || j < 0 || j >= dispositivos.length) return
    const next = [...dispositivos]
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setDispositivos(next)
    await patch({ kind: 'reorder-dispositivos', codigos: next.map((d) => d.codigo) })
  }

  const moveCampo = async (entidad: 'dispositivo' | 'enlace', id: number, dir: -1 | 1) => {
    const list = entidad === 'dispositivo' ? [...camposDisp] : [...camposEnl]
    const idx = list.findIndex((c) => c.id === id)
    const j = idx + dir
    if (idx < 0 || j < 0 || j >= list.length) return
    ;[list[idx], list[j]] = [list[j], list[idx]]
    if (entidad === 'dispositivo') setCamposDisp(list)
    else setCamposEnl(list)
    await patch({ kind: 'reorder-campos', entidad, ids: list.map((c) => c.id) })
  }

  if (!listo || usuario.perfil !== 'Supervisor') {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Cargando…</div>
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dispositivos', label: 'Dispositivos' },
    { id: 'enlaces', label: 'Enlaces' },
    { id: 'campos-disp', label: 'Campos panel (disp.)' },
    { id: 'campos-enl', label: 'Campos panel (enlace)' },
  ]

  return (
    <AdminShell title="Configuración" description="Parámetros administrables del aplicativo">
      <main className="app-page">
        <div className="mb-6">
          <h1 className="app-page-title">Configuración del aplicativo</h1>
          <p className="app-page-description">
            Orden, etiquetas, colores y campos del panel. Los cambios aplican sin tocar código.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                tab === t.id ? 'app-chip-active' : 'app-chip'
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="flex-1" />
          {msg && <span className="text-sm text-gray-500 self-center">{saving ? 'Guardando…' : msg}</span>}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Cargando configuración…</p>
        ) : tab === 'dispositivos' ? (
          <div className="app-table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="app-table-head">
                  <th className="app-th">Orden</th>
                  <th className="app-th">Ícono</th>
                  <th className="app-th">Código</th>
                  <th className="app-th">Etiqueta</th>
                  <th className="app-th">Colores</th>
                  <th className="app-th">Activo</th>
                  <th className="app-th" />
                </tr>
              </thead>
              <tbody>
                {dispositivos.map((d, i) => (
                  <tr key={d.codigo} className="app-tr">
                    <td className="px-4 py-2 text-gray-500">{d.orden}</td>
                    <td className="px-4 py-2">
                      <DeviceIcon tipo={d.codigo as TipoDispositivo} size={32} color={d.colorFillLight} strokeColor={d.colorStrokeLight} />
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{d.codigo}</td>
                    <td className="px-4 py-2">
                      <input
                        className="app-input"
                        defaultValue={d.label}
                        onBlur={(e) => {
                          if (e.target.value !== d.label) {
                            void patch({ kind: 'dispositivo', codigo: d.codigo, data: { label: e.target.value } })
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1 items-center">
                        <input
                          type="color"
                          value={d.colorStrokeLight}
                          title="Stroke claro"
                          onChange={(e) => void patch({ kind: 'dispositivo', codigo: d.codigo, data: { colorStrokeLight: e.target.value } })}
                        />
                        <input
                          type="color"
                          value={d.colorFillLight}
                          title="Fill claro"
                          onChange={(e) => void patch({ kind: 'dispositivo', codigo: d.codigo, data: { colorFillLight: e.target.value } })}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={d.activo}
                        onChange={(e) => void patch({ kind: 'dispositivo', codigo: d.codigo, data: { activo: e.target.checked } })}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button className="btn-secondary text-xs px-2 py-1 mr-1" disabled={i === 0} onClick={() => void moveDisp(d.codigo, -1)}>↑</button>
                      <button className="btn-secondary text-xs px-2 py-1" disabled={i === dispositivos.length - 1} onClick={() => void moveDisp(d.codigo, 1)}>↓</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === 'enlaces' ? (
          <div className="app-table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="app-table-head">
                  <th className="app-th">Orden</th>
                  <th className="app-th">Código</th>
                  <th className="app-th">Etiqueta</th>
                  <th className="app-th">Color</th>
                  <th className="app-th">Ancho</th>
                  <th className="app-th">Guiones</th>
                  <th className="app-th">Activo</th>
                </tr>
              </thead>
              <tbody>
                {enlaces.map((e) => (
                  <tr key={e.codigo} className="app-tr">
                    <td className="px-4 py-2">{e.orden}</td>
                    <td className="px-4 py-2 font-mono text-xs">{e.codigo}</td>
                    <td className="px-4 py-2">
                      <input
                        className="app-input"
                        defaultValue={e.label}
                        onBlur={(ev) => {
                          if (ev.target.value !== e.label) {
                            void patch({ kind: 'enlace', codigo: e.codigo, data: { label: ev.target.value } })
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="color"
                        value={e.stroke}
                        onChange={(ev) => void patch({ kind: 'enlace', codigo: e.codigo, data: { stroke: ev.target.value } })}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="8"
                        className="app-input w-20"
                        defaultValue={e.strokeWidth}
                        onBlur={(ev) => {
                          const v = Number(ev.target.value)
                          if (v !== e.strokeWidth) void patch({ kind: 'enlace', codigo: e.codigo, data: { strokeWidth: v } })
                        }}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        className="app-input w-24"
                        placeholder="ej. 8 4"
                        defaultValue={e.strokeDasharray ?? ''}
                        onBlur={(ev) => {
                          const v = ev.target.value.trim() || null
                          if (v !== e.strokeDasharray) void patch({ kind: 'enlace', codigo: e.codigo, data: { strokeDasharray: v } })
                        }}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={e.activo}
                        onChange={(ev) => void patch({ kind: 'enlace', codigo: e.codigo, data: { activo: ev.target.checked } })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <CamposTable
            campos={tab === 'campos-disp' ? camposDisp : camposEnl}
            entidad={tab === 'campos-disp' ? 'dispositivo' : 'enlace'}
            onPatch={patch}
            onMove={moveCampo}
          />
        )}
      </main>
    </AdminShell>
  )
}

function CamposTable({
  campos,
  entidad,
  onPatch,
  onMove,
}: {
  campos: CfgCampoPanel[]
  entidad: 'dispositivo' | 'enlace'
  onPatch: (body: Record<string, unknown>) => Promise<void>
  onMove: (entidad: 'dispositivo' | 'enlace', id: number, dir: -1 | 1) => Promise<void>
}) {
  return (
    <div className="app-table-wrap">
      <table className="w-full text-sm">
        <thead>
          <tr className="app-table-head">
            <th className="app-th">Orden</th>
            <th className="app-th">Clave</th>
            <th className="app-th">Etiqueta</th>
            <th className="app-th">Visible</th>
            <th className="app-th">Editable</th>
            <th className="app-th" />
          </tr>
        </thead>
        <tbody>
          {campos.map((c, i) => (
            <tr key={c.id} className="app-tr">
              <td className="px-4 py-2">{c.orden}</td>
              <td className="px-4 py-2 font-mono text-xs">{c.campoKey}</td>
              <td className="px-4 py-2">
                <input
                  className="app-input"
                  defaultValue={c.label}
                  onBlur={(e) => {
                    if (e.target.value !== c.label) {
                      void onPatch({ kind: 'campo', id: c.id, data: { label: e.target.value } })
                    }
                  }}
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={c.visible}
                  onChange={(e) => void onPatch({ kind: 'campo', id: c.id, data: { visible: e.target.checked } })}
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={c.editable}
                  onChange={(e) => void onPatch({ kind: 'campo', id: c.id, data: { editable: e.target.checked } })}
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <button className="btn-secondary text-xs px-2 py-1 mr-1" disabled={i === 0} onClick={() => void onMove(entidad, c.id, -1)}>↑</button>
                <button className="btn-secondary text-xs px-2 py-1" disabled={i === campos.length - 1} onClick={() => void onMove(entidad, c.id, 1)}>↓</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
