'use client'

import { useMemo, useState } from 'react'
import { PERMISOS_MOCK } from '@/data/mock'
import { formatFecha, generarId } from '@/lib/utils'
import { useAppStore } from '@/store/app.store'
import { AdminShell } from '@/components/layout/AdminShell'
import type { EstadoPerfil, PerfilSistema } from '@/types'

const ESTADOS: (EstadoPerfil | 'Todos')[] = ['Todos', 'Activo', 'Inactivo']

type PerfilForm = {
  nombre: string
  descripcion: string
  estado: EstadoPerfil
  permisos: string[]
  usuariosAsignados: number
}

const FORM_INICIAL: PerfilForm = {
  nombre: '',
  descripcion: '',
  estado: 'Activo',
  permisos: [],
  usuariosAsignados: 0,
}

export function PerfilesABC() {
  const perfiles = useAppStore((s) => s.perfiles)
  const addPerfil = useAppStore((s) => s.addPerfil)
  const updatePerfil = useAppStore((s) => s.updatePerfil)
  const deletePerfil = useAppStore((s) => s.deletePerfil)

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoPerfil | 'Todos'>('Todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [perfilEditando, setPerfilEditando] = useState<PerfilSistema | null>(null)
  const [form, setForm] = useState<PerfilForm>(FORM_INICIAL)
  const [error, setError] = useState('')

  const permisosPorModulo = useMemo(() => {
    return PERMISOS_MOCK.reduce<Record<string, typeof PERMISOS_MOCK>>((acc, permiso) => {
      acc[permiso.modulo] = acc[permiso.modulo] ?? []
      acc[permiso.modulo].push(permiso)
      return acc
    }, {})
  }, [])

  const perfilesFiltrados = perfiles.filter((perfil) => {
    const texto = `${perfil.nombre} ${perfil.descripcion}`.toLowerCase()
    const matchBusqueda = !busqueda || texto.includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado === 'Todos' || perfil.estado === filtroEstado
    return matchBusqueda && matchEstado
  })

  const abrirNuevo = () => {
    setPerfilEditando(null)
    setForm(FORM_INICIAL)
    setError('')
    setModalAbierto(true)
  }

  const abrirEdicion = (perfil: PerfilSistema) => {
    setPerfilEditando(perfil)
    setForm({
      nombre: perfil.nombre,
      descripcion: perfil.descripcion,
      estado: perfil.estado,
      permisos: perfil.permisos,
      usuariosAsignados: perfil.usuariosAsignados,
    })
    setError('')
    setModalAbierto(true)
  }

  const togglePermiso = (permisoId: string) => {
    setForm((actual) => ({
      ...actual,
      permisos: actual.permisos.includes(permisoId)
        ? actual.permisos.filter((id) => id !== permisoId)
        : [...actual.permisos, permisoId],
    }))
  }

  const guardarPerfil = () => {
    if (!form.nombre.trim()) {
      setError('Captura el nombre del perfil.')
      return
    }

    if (form.permisos.length === 0) {
      setError('Selecciona al menos un permiso.')
      return
    }

    if (perfilEditando) {
      updatePerfil(perfilEditando.id, form)
    } else {
      addPerfil({
        id: generarId('per'),
        ...form,
        creadoEn: new Date().toISOString(),
        modificadoEn: new Date().toISOString(),
      })
    }

    setModalAbierto(false)
    setPerfilEditando(null)
    setForm(FORM_INICIAL)
  }

  return (
    <AdminShell
      title="Administración de perfiles"
      description="Alta, baja y cambios de perfiles con permisos por módulo."
    >

      <main className="app-page">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="app-page-title">Administración de perfiles</h1>
            <p className="app-page-description">
              Alta, baja y cambios de perfiles con permisos por módulo.
            </p>
          </div>
          <button
            onClick={abrirNuevo}
            className="btn-primary"
          >
            + Nuevo perfil
          </button>
        </div>

        <div className="app-card mb-5 flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por perfil o descripción..."
            className="app-input flex-1"
          />
          <div className="flex flex-wrap gap-2">
            {ESTADOS.map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  filtroEstado === estado
                    ? 'app-chip-active'
                    : 'app-chip'
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        <div className="app-table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="app-table-head">
                <th className="app-th">Perfil</th>
                <th className="app-th">Descripción</th>
                <th className="app-th">Permisos</th>
                <th className="app-th">Usuarios</th>
                <th className="app-th">Estado</th>
                <th className="app-th">Modificado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {perfilesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-gray-600">
                    No se encontraron perfiles
                  </td>
                </tr>
              ) : (
                perfilesFiltrados.map((perfil) => (
                  <tr key={perfil.id} className="app-tr">
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">{perfil.nombre}</td>
                    <td className="max-w-[360px] px-4 py-3 text-gray-500 dark:text-gray-400">{perfil.descripcion}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{perfil.permisos.length}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{perfil.usuariosAsignados}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${perfil.estado === 'Activo' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                        {perfil.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500">{formatFecha(perfil.modificadoEn)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirEdicion(perfil)}
                          className="btn-ghost"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar el perfil ${perfil.nombre}?`)) deletePerfil(perfil.id)
                          }}
                          className="btn-ghost"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-sm text-gray-400 dark:text-gray-600">
          {perfilesFiltrados.length} perfil{perfilesFiltrados.length !== 1 ? 'es' : ''} · {perfiles.length} total
        </p>
      </main>

      {modalAbierto && (
        <div className="app-modal-backdrop" onClick={() => setModalAbierto(false)}>
          <div
            className="app-modal max-h-[90vh] max-w-3xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {perfilEditando ? 'Editar perfil' : 'Nuevo perfil'}
                </h2>
                <p className="app-page-description">
                  Define la información general y los permisos asociados.
                </p>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">×</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="app-label">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="app-input"
                  placeholder="Ej. Administrador"
                />
              </div>
              <div>
                <label className="app-label">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoPerfil })}
                  className="app-input"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div>
                <label className="app-label">Usuarios asignados</label>
                <input
                  type="number"
                  min={0}
                  value={form.usuariosAsignados}
                  onChange={(e) => setForm({ ...form, usuariosAsignados: Number(e.target.value) })}
                  className="app-input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="app-label">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="app-textarea min-h-24"
                  placeholder="Describe el alcance del perfil"
                />
              </div>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">Permisos</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(permisosPorModulo).map(([modulo, permisos]) => (
                  <div key={modulo} className="rounded-xl border border-gray-200 p-4 dark:border-[#2a3349]">
                    <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{modulo}</p>
                    <div className="space-y-2">
                      {permisos.map((permiso) => (
                        <label key={permiso.id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={form.permisos.includes(permiso.id)}
                            onChange={() => togglePermiso(permiso.id)}
                            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400 dark:text-white"
                          />
                          {permiso.nombre}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-200">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={guardarPerfil}
                className="btn-primary"
              >
                Guardar perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
