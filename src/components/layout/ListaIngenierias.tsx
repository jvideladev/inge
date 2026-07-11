'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/app.store'
import { AdminShell } from '@/components/layout/AdminShell'
import { estadoColor, formatFecha, generarId } from '@/lib/utils'
import type { EstadoIngenieria, Ingenieria } from '@/types'

const ESTADOS: (EstadoIngenieria | 'Todas')[] = ['Todas','Nueva','En revisión','Aprobada','Rechazada','Aprovisionada','Implementada']

export function ListaIngenierias() {
  const ingenierias   = useAppStore((s) => s.ingenierias)
  const abrirIngenieria = useAppStore((s) => s.abrirIngenieria)
  const addIngenieria  = useAppStore((s) => s.addIngenieria)
  const deleteIngenieria = useAppStore((s) => s.deleteIngenieria)
  const usuario        = useAppStore((s) => s.usuario)

  const [filtroEstado, setFiltroEstado]   = useState<EstadoIngenieria | 'Todas'>('Todas')
  const [busqueda, setBusqueda]           = useState('')
  const [modalNueva, setModalNueva]       = useState(false)
  const [formNueva, setFormNueva]         = useState({ nombre: '', cliente: '', cuenta: '' })

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
                    className="app-tr cursor-pointer"
                    onClick={() => abrirIngenieria(ing.id)}
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
                      {usuario.perfil !== 'Consulta' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteIngenieria(ing.id) }}
                          className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      )}
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
    </AdminShell>
  )
}
