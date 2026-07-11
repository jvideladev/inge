'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PerfilesABC } from '@/components/layout/PerfilesABC'
import { USUARIOS_MOCK } from '@/data/mock'
import { useAppStore } from '@/store/app.store'

export default function PerfilesPage() {
  const router = useRouter()
  const autenticado = useAppStore((s) => s.autenticado)
  const setUsuario = useAppStore((s) => s.setUsuario)
  const login = useAppStore((s) => s.login)
  const [validandoAcceso, setValidandoAcceso] = useState(true)
  const [accesoPermitido, setAccesoPermitido] = useState(false)

  useEffect(() => {
    const sesionGuardada = window.localStorage.getItem('ingenierias-auth')

    if (!sesionGuardada) {
      router.replace('/login')
      return
    }

    try {
      const sesion = JSON.parse(sesionGuardada) as { usuarioId?: string }
      const usuarioSesion = USUARIOS_MOCK.find((u) => u.id === sesion.usuarioId)

      if (!usuarioSesion) {
        window.localStorage.removeItem('ingenierias-auth')
        router.replace('/login')
        return
      }

      if (!autenticado) {
        setUsuario(usuarioSesion)
        login(usuarioSesion.id)
      }

      if (usuarioSesion.perfil !== 'Supervisor') {
        router.replace('/')
        return
      }

      setAccesoPermitido(true)
      setValidandoAcceso(false)
    } catch {
      window.localStorage.removeItem('ingenierias-auth')
      router.replace('/login')
    }
  }, [autenticado, login, router, setUsuario])

  if (validandoAcceso || !accesoPermitido) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-300">
        Validando permisos...
      </div>
    )
  }

  return <PerfilesABC />
}
