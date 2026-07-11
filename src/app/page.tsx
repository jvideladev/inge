'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app.store'
import { ListaIngenierias } from '@/components/layout/ListaIngenierias'
import { EditorIngenieria }  from '@/components/layout/EditorIngenieria'
import { USUARIOS_MOCK } from '@/data/mock'

export default function Home() {
  const router = useRouter()
  const ingenieriaActiva = useAppStore((s) => s.ingenieriaActiva)
  const autenticado = useAppStore((s) => s.autenticado)
  const setUsuario = useAppStore((s) => s.setUsuario)
  const login = useAppStore((s) => s.login)
  const [validandoSesion, setValidandoSesion] = useState(true)

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

  return ingenieriaActiva ? <EditorIngenieria /> : <ListaIngenierias />
}
