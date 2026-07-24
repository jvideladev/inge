'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PerfilesABC } from '@/components/layout/PerfilesABC'
import { useAppStore } from '@/store/app.store'

export default function PerfilesPage() {
  const router = useRouter()
  const autenticado = useAppStore((s) => s.autenticado)
  const usuario = useAppStore((s) => s.usuario)
  const restoreSession = useAppStore((s) => s.restoreSession)
  const [validandoAcceso, setValidandoAcceso] = useState(true)
  const [accesoPermitido, setAccesoPermitido] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const ok = autenticado || (await restoreSession())
      if (cancelled) return
      if (!ok) {
        router.replace('/login')
        return
      }
      const perfil = useAppStore.getState().usuario.perfil
      if (perfil !== 'Supervisor') {
        router.replace('/')
        return
      }
      setAccesoPermitido(true)
      setValidandoAcceso(false)
    })()
    return () => { cancelled = true }
  }, [autenticado, restoreSession, router, usuario.perfil])

  if (validandoAcceso || !accesoPermitido) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-300">
        Validando permisos...
      </div>
    )
  }

  return <PerfilesABC />
}
