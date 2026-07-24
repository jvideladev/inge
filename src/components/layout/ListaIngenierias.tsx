'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app.store'
import { AdminShell } from '@/components/layout/AdminShell'
import { estadoColor, formatFecha, generarId, esEstadoEditableOperativo } from '@/lib/utils'
import { PublicacionBadge } from '@/components/ui/PublicacionBadge'
import { ingenieriasApi } from '@/lib/api'
import type { IngenieriaComentario } from '@/lib/comentarios.repo'
import type { EstadoIngenieria, Ingenieria } from '@/types'

const ESTADOS: (EstadoIngenieria | 'Todas')[] = ['Todas','En construcción','En revisión','Aprobada','Rechazada','Aprovisionada','Implementada']

export function ListaIngenierias() {
  const ingenierias     = useAppStore((s) => s.ingenierias)
  const loading         = useAppStore((s) => s.loading)
  const error           = useAppStore((s) => s.error)
  const fetchIngenierias = useAppStore((s) => s.fetchIngenierias)
  const abrirIngenieria = useAppStore((s) => s.abrirIngenieria)
  const addIngenieria   = useAppStore((s) => s.addIngenieria)
  const updateIngenieria = useAppStore((s) => s.updateIngenieria)
  const usuario         = useAppStore((s) => s.usuario)

  const [filtroEstado, setFiltroEstado]   = useState<EstadoIngenieria | 'Todas'>('Todas')
  const [busqueda, setBusqueda]           = useState('')
  const [modalNueva, setModalNueva]       = useState(false)
  const [creando, setCreando]             = useState(false)
  const [formNueva, setFormNueva]         = useState({ nombre: '', cliente: '', cuenta: '' })
  const [menu, setMenu]                   = useState<{ id: string; top: number; right: number } | null>(null)
  const [comentariosIng, setComentariosIng] = useState<Ingenieria | null>(null)
  const [discoveryIng, setDiscoveryIng]   = useState<Ingenieria | null>(null)

  useEffect(() => {
    void fetchIngenierias()
  }, [fetchIngenierias])

  // Demos (solo lectura) + ingenierías del usuario
  const visibles = ingenierias.filter(
    (i) => i.editable === false || i.creadaPor === usuario.nombre,
  )

  const filtradas = visibles.filter((i) => {
    const matchEstado = filtroEstado === 'Todas' || i.estado === filtroEstado
    const matchBusqueda = !busqueda ||
      i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.cuenta.includes(busqueda)
    return matchEstado && matchBusqueda
  })

  const crearIngenieria = async () => {
    if (!formNueva.nombre.trim() || creando) return
    setCreando(true)
    try {
      const borrador: Ingenieria = {
        id:          generarId('ing'),
        nombre:      formNueva.nombre,
        cliente:     formNueva.cliente,
        cuenta:      formNueva.cuenta,
        estado:      'En construcción',
        creadaPor:   usuario.nombre,
        creadaEn:    new Date().toISOString(),
        modificadaEn:new Date().toISOString(),
        nodes: [],
        edges: [],
        editable: true,
        versionActual: 1,
      }
      const creada = await addIngenieria(borrador)
      setModalNueva(false)
      setFormNueva({ nombre: '', cliente: '', cuenta: '' })
      abrirIngenieria(creada.id)
    } catch (e: any) {
      window.alert(e?.message ?? 'No se pudo crear la ingeniería')
    } finally {
      setCreando(false)
    }
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <span>{ing.nombre}</span>
                        {ing.editable === false && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            Demo · solo lectura
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{ing.cliente}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-sm">{ing.cuenta}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoColor(ing.estado)}`}>
                          {ing.estado}
                        </span>
                        <PublicacionBadge ingenieria={ing} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-sm">{formatFecha(ing.modificadaEn)}</td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-sm">{ing.creadaPor}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {usuario.perfil !== 'Consulta' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); abrirIngenieria(ing.id) }}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title={ing.editable === false ? 'Ver (solo lectura)' : 'Editar'}
                          >
                            <IconEditar /> {ing.editable === false ? 'Ver' : 'Editar'}
                          </button>
                        )}
                        {usuario.perfil === 'Consulta' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); abrirIngenieria(ing.id) }}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Ver"
                          >
                            <IconEditar /> Ver
                          </button>
                        )}
                        {(ing.estado === 'En construcción' || ing.estado === 'Rechazada') &&
                          ing.editable !== false &&
                          usuario.perfil !== 'Consulta' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDiscoveryIng(ing)
                            }}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 px-2.5 py-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                            title="Descubrimiento"
                          >
                            <IconDiscovery /> Descubrimiento
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setComentariosIng(ing)
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Comentarios"
                        >
                          <IconSeguimiento /> Comentarios
                        </button>
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
          {loading ? 'Cargando…' : `${filtradas.length} ingeniería${filtradas.length !== 1 ? 's' : ''} · ${visibles.length} visibles`}
          {error ? ` · Error: ${error}` : ''}
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
                onClick={() => {
                  const ing = ingenierias.find((i) => i.id === menu.id)
                  setMenu(null)
                  if (ing && esEstadoEditableOperativo(ing.estado) && ing.editable !== false) {
                    setDiscoveryIng(ing)
                  } else {
                    window.alert('Descubrimiento solo disponible en En construcción o Rechazada')
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-500 dark:text-gray-400"><IconDiscovery /></span>
                Descubrimiento
              </button>
              <button
                onClick={() => {
                  setComentariosIng(ingenierias.find((i) => i.id === menu.id) ?? null)
                  setMenu(null)
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-500 dark:text-gray-400"><IconSeguimiento /></span>
                Comentarios
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
                disabled={creando}
                className="btn-primary"
              >
                {creando ? 'Creando…' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal comentarios */}
      {comentariosIng && (
        <ModalComentarios
          ingenieria={comentariosIng}
          usuario={usuario.nombre}
          perfil={usuario.perfil}
          onClose={() => setComentariosIng(null)}
        />
      )}

      {/* Modal Discovery */}
      {discoveryIng && (
        <ModalDiscovery
          ingenieria={discoveryIng}
          usuario={usuario.nombre}
          onClose={() => setDiscoveryIng(null)}
          onDone={(updated) => {
            updateIngenieria(updated.id, updated)
            setDiscoveryIng(null)
          }}
        />
      )}
    </AdminShell>
  )
}

function ModalComentarios({
  ingenieria,
  usuario,
  perfil,
  onClose,
}: {
  ingenieria: Ingenieria
  usuario: string
  perfil: string
  onClose: () => void
}) {
  const [items, setItems] = useState<IngenieriaComentario[]>([])
  const [loading, setLoading] = useState(true)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    ingenieriasApi.listComentarios(ingenieria.id)
      .then((r) => { if (alive) setItems(r.items) })
      .catch((e) => window.alert(e?.message ?? 'No se pudieron cargar comentarios'))
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [ingenieria.id])

  const enviar = async () => {
    if (!texto.trim() || enviando) return
    setEnviando(true)
    try {
      const created = await ingenieriasApi.addComentario(ingenieria.id, {
        texto: texto.trim(),
        usuario,
        perfil,
      })
      setItems((prev) => [...prev, created])
      setTexto('')
    } catch (e: any) {
      window.alert(e?.message ?? 'No se pudo enviar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="app-modal-backdrop" onClick={onClose}>
      <div className="app-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Comentarios</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{ingenieria.nombre}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
        </div>

        <div className="max-h-[360px] overflow-y-auto flex flex-col gap-3 mb-4">
          {loading && <p className="text-sm text-gray-400">Cargando…</p>}
          {!loading && items.length === 0 && (
            <p className="text-sm text-gray-400">Todavía no hay comentarios.</p>
          )}
          {items.map((c) => (
            <div key={c.id} className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900/40">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.usuario}</span>
                {c.perfil && <span className="text-xs text-gray-400">{c.perfil}</span>}
                {c.estadoDestino && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${estadoColor(c.estadoDestino as EstadoIngenieria)}`}>
                    → {c.estadoDestino}
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">{formatFecha(c.creadoEn)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{c.texto}</p>
            </div>
          ))}
        </div>

        <textarea
          className="app-input min-h-[80px] resize-y"
          placeholder="Agregar comentario…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} className="btn-secondary">Cerrar</button>
          <button onClick={() => void enviar()} disabled={enviando || !texto.trim()} className="btn-primary">
            {enviando ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalDiscovery({
  ingenieria,
  usuario,
  onClose,
  onDone,
}: {
  ingenieria: Ingenieria
  usuario: string
  onClose: () => void
  onDone: (ing: Ingenieria) => void
}) {
  const [paso, setPaso] = useState<'aviso' | 'ip'>('aviso')
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)

  const ejecutar = async () => {
    if (!ip.trim()) {
      window.alert('Ingresá la IP para Discovery')
      return
    }
    setLoading(true)
    try {
      const updated = await ingenieriasApi.generarDesdeDiscovery(ingenieria.id, {
        ip: ip.trim(),
        usuario,
      })
      onDone(updated)
    } catch (e: any) {
      window.alert(e?.message ?? 'Error en Discovery')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-modal-backdrop" onClick={onClose}>
      <div className="app-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Descubrimiento</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 mb-4">{ingenieria.nombre}</p>

        {paso === 'aviso' ? (
          <>
            <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
              Se van a <strong>pisar</strong> los dispositivos y enlaces actuales de esta ingeniería con el resultado del Discovery. ¿Deseás continuar?
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={onClose} className="btn-secondary">Cancelar</button>
              <button onClick={() => setPaso('ip')} className="btn-primary">Continuar</button>
            </div>
          </>
        ) : (
          <>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">IP para Discovery</label>
            <input
              className="app-input"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="Ej. 10.50.1.1"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2">Por ahora se usa un servicio mock; cuando Totalplay entregue el endpoint real se enchufa aquí.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancelar</button>
              <button onClick={() => void ejecutar()} className="btn-primary" disabled={loading}>
                {loading ? 'Consultando…' : 'Ejecutar Discovery'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* Icons */
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
