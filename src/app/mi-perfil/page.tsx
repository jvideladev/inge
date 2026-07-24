'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MiPerfil } from '@/components/layout/MiPerfil'
import { useAppStore } from '@/store/app.store'

export default function MiPerfilPage() {
  const router = useRouter()
  const autenticado = useAppStore((s) => s.autenticado)
  const restoreSession = useAppStore((s) => s.restoreSession)
  const [validandoSesion, setValidandoSesion] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const ok = autenticado || (await restoreSession())
      if (cancelled) return
      if (!ok) {
        router.replace('/login')
        return
      }
      setValidandoSesion(false)
    })()
    return () => { cancelled = true }
  }, [autenticado, restoreSession, router])

  if (validandoSesion || !autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Cargando sesión...
      </div>
    )
  }

  return <MiPerfil />
}
