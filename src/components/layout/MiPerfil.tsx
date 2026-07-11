'use client'

import { AdminShell } from '@/components/layout/AdminShell'
import { useAppStore } from '@/store/app.store'

export function MiPerfil() {
  const usuario = useAppStore((s) => s.usuario)

  const iniciales = usuario.nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')

  return (
    <AdminShell title="Mi perfil" description="Información del usuario autenticado">
      <section className="min-h-full bg-slate-50 p-4 dark:bg-slate-950 md:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#3c465f] dark:text-slate-300">Administración</p>
            <h2 className="app-page-title mt-1">Mi perfil</h2>
            <p className="app-page-description">
              Consulta los datos del usuario que inició sesión en el sistema.
            </p>
          </div>

          <div className="app-card overflow-hidden">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-6 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#3c465f] text-2xl font-bold text-white shadow-lg shadow-slate-900/10 dark:bg-white dark:text-slate-950">
                  {iniciales || 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-2xl font-bold text-gray-900 dark:text-gray-100">{usuario.nombre}</h3>
                  <p className="truncate text-sm text-gray-500 dark:text-[#8b95b0]">{usuario.email}</p>
                  <span className="mt-3 inline-flex rounded-full bg-[#3c465f] px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
                    {usuario.perfil}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2a3349] dark:bg-[#0f1117]">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#5a6380]">Nombre</p>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{usuario.nombre}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2a3349] dark:bg-[#0f1117]">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#5a6380]">Correo</p>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{usuario.email}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2a3349] dark:bg-[#0f1117]">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#5a6380]">Perfil</p>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{usuario.perfil}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-[#2a3349] dark:bg-[#0f1117]">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-[#5a6380]">Estado</p>
                <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-200">Activo</p>
              </div>
            </div>

            <div className="border-t border-gray-100 p-6 dark:border-[#2a3349]">
              <button
                type="button"
                className="btn-secondary"
                disabled
                title="Funcionalidad pendiente"
              >
                Cambiar contraseña próximamente
              </button>
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  )
}
