'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/app.store'
import { UserMenu } from '@/components/layout/UserMenu'

interface AdminShellProps {
  title: string
  description?: string
  children: React.ReactNode
}

type MenuIconProps = {
  className?: string
}

function HomeIcon({ className = 'h-5 w-5' }: MenuIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m3 10.5 9-7 9 7" />
      <path d="M5 10v10h5v-6h4v6h5V10" />
    </svg>
  )
}

function GridIcon({ className = 'h-5 w-5' }: MenuIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  )
}

function UsersIcon({ className = 'h-5 w-5' }: MenuIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function MenuIcon({ className = 'h-5 w-5' }: MenuIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

const MENU_ITEMS = [
  {
    href: '/',
    label: 'Ingenierías',
    icon: GridIcon,
  },
  {
    href: '/perfiles',
    label: 'Administración de perfiles',
    icon: UsersIcon,
  },
]

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()
  const temaOscuro = useAppStore((s) => s.temaOscuro)
  const toggleTema = useAppStore((s) => s.toggleTema)
  const usuario = useAppStore((s) => s.usuario)
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const savedPinned = window.localStorage.getItem('side-menu-pinned')
    setIsPinned(savedPinned === 'true')
  }, [])

  const expanded = isPinned || isHovered
  const menuItems = MENU_ITEMS.filter(
    (item) => item.href !== '/perfiles' || usuario.perfil === 'Supervisor'
  )

  const togglePinned = () => {
    setIsPinned((current) => {
      const next = !current
      window.localStorage.setItem('side-menu-pinned', String(next))
      if (!next) setIsHovered(false)
      return next
    })
  }

  return (
    <div className={`min-h-screen ${temaOscuro ? 'dark bg-neutral-950' : 'bg-gray-50'}`}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b border-slate-600 bg-[#3c465a] px-4 py-3 shadow-lg md:h-16 md:px-6 md:py-0">
          <div className="flex h-full flex-col gap-3 md:flex-row md:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="truncate text-xl font-bold tracking-tight text-white">Ingenierías</h1>
            </div>

            <div className="flex-1" />

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={toggleTema}
                className="h-9 rounded-xl border border-white/25 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {temaOscuro ? '☀' : '🌙'}
              </button>

              <UserMenu />
            </div>
          </div>
        </header>

        <div className="border-b border-gray-200 bg-white px-4 py-2 dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {menuItems.map((item) => {
              const activo = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${activo ? 'bg-[#3c465f] text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-900'}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside
            onMouseEnter={() => {
              if (!isPinned) setIsHovered(true)
            }}
            onMouseLeave={() => {
              if (!isPinned) setIsHovered(false)
            }}
            className={`hidden flex-shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-sm shadow-gray-900/5 transition-all duration-300 ease-in-out dark:border-neutral-800 dark:bg-neutral-950 md:flex ${
              expanded ? 'w-80' : 'w-20'
            }`}
          >
            <div className={`flex items-center px-4 pb-4 pt-6 transition-all duration-300 ${expanded ? 'justify-between px-5' : 'justify-center'}`}>
              <h2 className={`whitespace-nowrap text-base font-bold text-gray-700 transition-all duration-200 dark:text-gray-200 ${expanded ? 'block opacity-100' : 'hidden opacity-0'}`}>
                Menú Principal
              </h2>
              <button
                type="button"
                onClick={togglePinned}
                aria-label={isPinned ? 'Desanclar menú lateral' : 'Anclar menú lateral'}
                title={isPinned ? 'Volver al modo hover' : 'Mantener menú abierto'}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  isPinned
                    ? 'border-[#3c465f] bg-[#3c465f] text-white hover:bg-[#2f384e]'
                    : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800 dark:hover:text-white'
                }`}
              >
                <MenuIcon />
              </button>
            </div>

            <nav className="flex-1 space-y-3 px-4 py-6">
              {menuItems.map((item) => {
                const activo = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex min-h-[3.25rem] items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      activo
                        ? 'bg-slate-100 text-[#12233f] shadow-sm dark:bg-slate-800 dark:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className={`min-w-0 whitespace-nowrap text-base transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
