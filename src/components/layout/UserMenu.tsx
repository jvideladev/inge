'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store/app.store'

interface UserMenuProps {
  align?: 'right' | 'left'
}

export function UserMenu({ align = 'right' }: UserMenuProps) {
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const usuario = useAppStore((s) => s.usuario)
  const logout = useAppStore((s) => s.logout)

  const iniciales = usuario.nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  const cerrarSesion = async () => {
    setOpen(false)
    await logout()
    router.replace('/login')
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-2 pr-3 text-sm text-white shadow-sm transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/15"
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#3c465f]">
          {iniciales || 'U'}
        </span>
        <span className="hidden max-w-[170px] truncate font-semibold sm:block">{usuario.nombre}</span>
        <span className="text-xs text-white/70">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-11 z-[100] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900`}
        >
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#3c465f] text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-950">
                {iniciales || 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#12233f] dark:text-white">{usuario.nombre}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{usuario.email}</p>
                <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {usuario.perfil}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link
              href="/mi-perfil"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#12233f] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">👤</span>
              <span>Mi perfil</span>
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={cerrarSesion}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#12233f] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
