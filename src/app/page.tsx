'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app.store'
import { ListaIngenierias } from '@/components/layout/ListaIngenierias'
import { EditorIngenieria }  from '@/components/layout/EditorIngenieria'
import { USUARIOS_MOCK } from '@/data/mock'

export default function Home() {
  const router = useRouter()
  const ingenieriaActiva = useAppStore((s) => s.ingenieriaActiva)
  const cerrarIngenieria = useAppStore((s) => s.cerrarIngenieria)
  const logout = useAppStore((s) => s.logout)
  const autenticado = useAppStore((s) => s.autenticado)
  const temaOscuro = useAppStore((s) => s.temaOscuro)
  const setUsuario = useAppStore((s) => s.setUsuario)
  const login = useAppStore((s) => s.login)
  const [validandoSesion, setValidandoSesion] = useState(true)
  const [confirmarSalir, setConfirmarSalir]   = useState(false)

  // Botón "atrás" del navegador:
  //  - En el editor  → vuelve al grid
  //  - En el grid    → pide confirmación y cierra sesión (vuelve al login)
  const ingRef = useRef(ingenieriaActiva)
  useEffect(() => { ingRef.current = ingenieriaActiva }, [ingenieriaActiva])

  useEffect(() => {
    if (!autenticado) return
    // Next.js (App Router) intercepta history.pushState; hay que pasar la URL actual
    // explícitamente para que cree una entrada real que podamos "consumir" con el back.
    const armarGuardia = () =>
      window.history.pushState({ __guard: true }, '', window.location.href)

    armarGuardia()   // entrada "guardia" inicial para interceptar el back

    const onPop = () => {
      if (ingRef.current) {
        ingRef.current = null   // sincronizar de inmediato (evita carrera)
        cerrarIngenieria()
        armarGuardia()          // re-armar guardia para el grid
      } else {
        armarGuardia()          // re-armar guardia: no salir todavía
        setConfirmarSalir(true)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [autenticado, cerrarIngenieria])

  useEffect(() => {
    const sesionGuardada = window.localStorage.getItem('ingenierias-auth')

    if (!autenticado && sesionGuardada) {
      try {
        const sesion = JSON.parse(sesionGuardada) as { usuarioId?: string }
        const usuario = USUARIOS_MOCK.find((u) => u.id === sesion.usuarioId)
        if (usuario) {
          setUsuario(usuario)
          login(usuario.id)
          setValidandoSesion(false)
          return
        }
      } catch {
        window.localStorage.removeItem('ingenierias-auth')
      }
    }

    if (!autenticado) {
      router.replace('/login')
      return
    }

    setValidandoSesion(false)
  }, [autenticado, login, router, setUsuario])

  if (validandoSesion || !autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Cargando sesión...
      </div>
    )
  }

  return (
    <>
      {ingenieriaActiva ? <EditorIngenieria /> : <ListaIngenierias />}

      {confirmarSalir && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 ${temaOscuro ? 'dark' : ''}`}
          onClick={() => setConfirmarSalir(false)}
        >
          <div
            className="bg-white dark:bg-[#161b27] border border-gray-200 dark:border-[#2a3349] rounded-xl shadow-2xl p-6 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Cerrar sesión
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              ¿Querés cerrar la sesión y volver a la pantalla de inicio?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmarSalir(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#2a3349] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e2435] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setConfirmarSalir(false); logout() }}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
