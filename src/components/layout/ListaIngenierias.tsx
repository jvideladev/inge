'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/app.store'
import { AdminShell } from '@/components/layout/AdminShell'
import { estadoColor, formatFecha, generarId } from '@/lib/utils'
import type { EstadoIngenieria, Ingenieria } from '@/types'

const ESTADOS: (EstadoIngenieria | 'Todas')[] = ['Todas','Nueva','En revisión','Aprobada','Rechazada','Aprovisionada','Implementada']
const ESTADOS_ING: EstadoIngenieria[] = ['Nueva','En revisión','Aprobada','Rechazada','Aprovisionada','Implementada']

export function ListaIngenierias() {
  const ingenierias   = useAppStore((s) => s.ingenierias)
  const abrirIngenieria = useAppStore((s) => s.abrirIngenieria)
  const addIngenieria  = useAppStore((s) => s.addIngenieria)
  const usuario        = useAppStore((s) => s.usuario)

  const [filtroEstado, setFiltroEstado]   = useState<EstadoIngenieria | 'Todas'>('Todas')
  const [busqueda, setBusqueda]           = useState('')
  const [modalNueva, setModalNueva]       = useState(false)
  const [formNueva, setFormNueva]         = useState({ nombre: '', cliente: '', cuenta: '' })
  const [menu, setMenu]                   = useState<{ id: string; top: number; right: number } | null>(null)
  const [seguimientoIng, setSeguimientoIng] = useState<Ingenieria | null>(null)

  const ingenieriasDelUsuario = ingenierias.filter((i) => i.creadaPor === usuario.nombre)

  const filtradas = ingenieriasDelUsuario.filter((i) => {
    const matchEstado = filtroEstado === 'Todas' || i.estado === filtroEstado
    const matchBusqueda = !busqueda ||
      i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.cuenta.includes(busqueda)
    return matchEstado && matchBusqueda
  })

  const crearIngenieria = () => {
    if (!formNueva.nombre.trim()) return
    const nueva: Ingenieria = {
      id:          generarId('ing'),
      nombre:      formNueva.nombre,
      cliente:     formNueva.cliente,
      cuenta:      formNueva.cuenta,
      estado:      'Nueva',
      creadaPor:   usuario.nombre,
      creadaEn:    new Date().toISOString(),
      modificadaEn:new Date().toISOString(),
      nodes: [],
      edges: []
    }
    addIngenieria(nueva)
    setModalNueva(false)
    setFormNueva({ nombre: '', cliente: '', cuenta: '' })
    abrirIngenieria(nueva.id)
  }

  return (
    <AdminShell
      title="Ingenierías"
      description="Consulta, crea y administra únicamente tus ingenierías."
    >

      <main className="app-page">
        <div className="mb-6">
          <h1 className="app-page-title">Administración de ingenierías</h1>
          <p className="app-page-description">
            Consulta, crea y administra únicamente tus ingenierías.
          </p>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Buscar ingeniería, cliente o cuenta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="app-input min-w-[220px] flex-1"
          />
          <div className="flex gap-1 flex-wrap">
            {ESTADOS.map((e) => (
              <button
                key={e}
                onClick={() => setFiltroEstado(e)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  filtroEstado === e
                    ? 'app-chip-active'
                    : 'app-chip'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          {usuario.perfil !== 'Consulta' && (
            <button
              onClick={() => setModalNueva(true)}
              className="btn-primary"
            >
              + Nueva ingeniería
            </button>
          )}
        </div>

        {/* Table */}
        <div className="app-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="app-table-head">
                <th className="app-th">Nombre</th>
                <th className="app-th">Cliente</th>
                <th className="app-th">Cuenta</th>
                <th className="app-th">Estado</th>
                <th className="app-th">Modificada</th>
                <th className="app-th">Creada por</th>
                <th className="px-4 py-3"/>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-sm text-gray-400 dark:text-gray-600 py-12">
                    No se encontraron ingenierías
                  </td>
                </tr>
              ) : (
                filtradas.map((ing) => (
                  <tr
                    key={ing.id}
                    className="app-tr"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">{ing.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{ing.cliente}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-sm">{ing.cuenta}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoColor(ing.estado)}`}>
                        {ing.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-sm">{formatFecha(ing.modificadaEn)}</td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-sm">{ing.creadaPor}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {usuario.perfil !== 'Consulta' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); abrirIngenieria(ing.id) }}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Editar"
                          >
                            <IconEditar /> Editar
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const r = e.currentTarget.getBoundingClientRect()
                            setMenu((m) => m?.id === ing.id ? null : { id: ing.id, top: r.bottom + 6, right: window.innerWidth - r.right })
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Más acciones"
                        >
                          <IconDots />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-600 mt-3">
          {filtradas.length} ingeniería{filtradas.length !== 1 ? 's' : ''} · {ingenieriasDelUsuario.length} asignada{ingenieriasDelUsuario.length !== 1 ? 's' : ''} a tu usuario
        </p>

        {/* Menú de acciones (tres puntos) */}
        {menu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
            <div
              className="fixed z-50 min-w-[180px] py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10"
              style={{ top: menu.top, right: menu.right }}
            >
              <button
                onClick={() => setMenu(null)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-500 dark:text-gray-400"><IconDiscovery /></span>
                Discovery
              </button>
              <button
                onClick={() => {
                  // TODO: habilitar seguimiento más adelante
                  // setSeguimientoIng(ingenierias.find((i) => i.id === menu.id) ?? null)
                  setMenu(null)
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-500 dark:text-gray-400"><IconSeguimiento /></span>
                Seguimiento
              </button>

              {/* Exportar con submenú */}
              <div className="relative group">
                <button
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-gray-500 dark:text-gray-400"><IconExportar /></span>
                  Exportar
                  <span className="ml-auto text-gray-400"><IconChevron /></span>
                </button>
                <div className="absolute right-full top-0 mr-1 hidden group-hover:block min-w-[130px] py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10">
                  <button
                    onClick={() => setMenu(null)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-rose-500 dark:text-rose-400"><IconPdf /></span>
                    PDF
                  </button>
                  <button
                    onClick={() => setMenu(null)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-emerald-600 dark:text-emerald-400"><IconExcel /></span>
                    Excel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal nueva ingeniería */}
      {modalNueva && (
        <div
          className="app-modal-backdrop"
          onClick={() => setModalNueva(false)}
        >
          <div
            className="app-modal max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Nueva ingeniería</h2>
            <div className="flex flex-col gap-3">
              {[
                { key: 'nombre',  label: 'Nombre',  placeholder: 'Ingeniería Cliente X' },
                { key: 'cliente', label: 'Cliente', placeholder: 'IMSS' },
                { key: 'cuenta',  label: 'Cuenta',  placeholder: '1000023500' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">{label}</label>
                  <input
                    value={formNueva[key as keyof typeof formNueva]}
                    onChange={(e) => setFormNueva((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="app-input"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <button
                onClick={() => setModalNueva(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={crearIngenieria}
                className="btn-primary"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de seguimiento */}
      {seguimientoIng && (
        <ModalSeguimiento
          ingenieria={seguimientoIng}
          registrador={usuario.nombre}
          onClose={() => setSeguimientoIng(null)}
        />
      )}
    </AdminShell>
  )
}

interface SeguimientoRow {
  version: number
  fecha:   string
  estatus: EstadoIngenieria
  notas:   string
  registro: string
}

function fechaCorta(v: string) {
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(v)
  const d = soloFecha ? new Date(`${v}T00:00:00`) : new Date(v)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

function construirSeguimientos(ing: Ingenieria): SeguimientoRow[] {
  const rows: SeguimientoRow[] = [
    { version: 1, fecha: ing.creadaEn, estatus: 'Nueva', notas: 'Ingeniería registrada en el sistema.', registro: ing.creadaPor },
  ]
  if (ing.estado !== 'Nueva') {
    rows.push({ version: 2, fecha: ing.modificadaEn, estatus: ing.estado, notas: `Estado actualizado a "${ing.estado}".`, registro: ing.creadaPor })
  }
  return rows.reverse()
}

function ModalSeguimiento({ ingenieria, registrador, onClose }: { ingenieria: Ingenieria; registrador: string; onClose: () => void }) {
  const [fecha, setFecha]     = useState(new Date().toISOString().slice(0, 10))
  const [estatus, setEstatus] = useState<EstadoIngenieria>(ingenieria.estado)
  const [notas, setNotas]     = useState('')
  const [seguimientos, setSeguimientos] = useState<SeguimientoRow[]>(() => construirSeguimientos(ingenieria))

  const guardar = () => {
    const version = (seguimientos[0]?.version ?? 0) + 1
    setSeguimientos((prev) => [
      { version, fecha, estatus, notas: notas.trim() || '—', registro: registrador },
      ...prev,
    ])
    setNotas('')
  }

  const th = 'text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 py-2'

  return (
    <div className="app-modal-backdrop" onClick={onClose}>
      <div className="app-modal max-w-5xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Seguimiento de ingeniería</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{ingenieria.nombre}</p>
          </div>
          <button
            onClick={onClose}
            title="Cerrar"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-6">
          {/* Formulario */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="app-input" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">Estatus</label>
              <select value={estatus} onChange={(e) => setEstatus(e.target.value as EstadoIngenieria)} className="app-input">
                {ESTADOS_ING.map((e) => (<option key={e} value={e}>{e}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">Notas</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value.slice(0, 500))}
                rows={5}
                placeholder="Escribe una nota de seguimiento..."
                className="app-input resize-y min-h-[80px]"
              />
              <p className="text-xs text-gray-400 dark:text-gray-600 text-right mt-1">{notas.length}/500</p>
            </div>
          </div>

          {/* Seguimiento */}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Seguimiento</h3>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/70">
                  <tr>
                    <th className={th}>Versión</th>
                    <th className={th}>Fecha</th>
                    <th className={th}>Estatus</th>
                    <th className={th}>Notas</th>
                    <th className={th}>Registró</th>
                    <th className={th}/>
                  </tr>
                </thead>
                <tbody>
                  {seguimientos.map((s) => (
                    <tr key={s.version} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap">v{s.version}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">{fechaCorta(s.fecha)}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoColor(s.estatus)}`}>{s.estatus}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{s.notas}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">{s.registro}</td>
                      <td className="px-3 py-2 text-right">
                        <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">Abrir versión</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 justify-end mt-6">
          <button onClick={guardar} className="btn-primary">Guardar</button>
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  )
}

function IconEditar() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M11.4 2.3l2.3 2.3-8 8L3 13l.4-2.7 8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M10.2 3.5l2.3 2.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="8" cy="13" r="1.4"/>
    </svg>
  )
}
function IconDiscovery() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M10.6 5.4L9.1 9.1 5.4 10.6 6.9 6.9l3.7-1.5z" fill="currentColor"/>
    </svg>
  )
}
function IconSeguimiento() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 10.5l3.2-3.4 2.3 2 3.5-4.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.8 4.6h2.7v2.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconExportar() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.2v6.6m0 0L5.6 6.4M8 8.8l2.4-2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.6 10.8v1.6c0 .8.6 1.4 1.4 1.4h8c.8 0 1.4-.6 1.4-1.4v-1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
function IconChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconPdf() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M4 1.5h5l3 3v10H4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M9 1.5v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <text x="8" y="12.2" textAnchor="middle" fontSize="4.2" fontWeight="700" fill="currentColor">PDF</text>
    </svg>
  )
}
function IconExcel() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M4 1.5h5l3 3v10H4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M9 1.5v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M5.8 8l2.4 3.5M8.2 8l-2.4 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
