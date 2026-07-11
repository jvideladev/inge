'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { USUARIOS_MOCK } from '@/data/mock'

export default function LoginPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!usuario.trim() || !password.trim()) {
      setError('Captura usuario y contraseña.')
      return
    }

    const usuarioEncontrado = USUARIOS_MOCK.find(
      (u) =>
        u.email.toLowerCase() === usuario.toLowerCase() &&
        u.password === password
    )

    if (!usuarioEncontrado) {
      setError('Usuario o contraseña incorrectos.')
      return
    }

    localStorage.setItem(
      'ingenierias-auth',
      JSON.stringify({
        usuarioId: usuarioEncontrado.id,
        email: usuarioEncontrado.email,
        nombre: usuarioEncontrado.nombre,
        perfil: usuarioEncontrado.perfil,
        loginAt: new Date().toISOString(),
        authType: 'SSO_SIMULADO',
      })
    )

    router.push('/')
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-900">
      <header className="relative z-20 flex h-[98px] items-center justify-center bg-[#3c465a] shadow-lg">
        <div className="flex items-center gap-3 text-4xl font-bold text-white">
          <span className="text-3xl">▶▶▶</span>
          <span>Ingenierías</span>
        </div>
      </header>

      <section className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#d6dbe2_0%,#aab1ba_45%,#6e7783_100%)]" />

        <div className="absolute inset-0 opacity-45">
          <div className="absolute left-[8%] top-[12%] h-40 w-40 rounded-3xl bg-slate-500 blur-sm" />
          <div className="absolute right-[8%] top-[18%] h-44 w-44 rounded-3xl bg-slate-500 blur-sm" />
          <div className="absolute bottom-[12%] left-[15%] h-48 w-48 rounded-3xl bg-slate-500 blur-sm" />
          <div className="absolute bottom-[14%] right-[18%] h-48 w-48 rounded-3xl bg-slate-500 blur-sm" />
          <div className="absolute left-0 top-[28%] h-2 w-[38%] rotate-[25deg] bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,.9)]" />
          <div className="absolute right-0 top-[31%] h-2 w-[36%] -rotate-[25deg] bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,.9)]" />
          <div className="absolute bottom-[22%] left-0 h-2 w-[42%] -rotate-[22deg] bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,.9)]" />
          <div className="absolute bottom-[24%] right-0 h-2 w-[40%] rotate-[22deg] bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,.9)]" />
        </div>

        <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[1px]" />

        <div className="relative z-10 my-8 w-full max-w-[765px] rounded-[28px] bg-white px-6 py-8 shadow-2xl sm:px-10 sm:py-10 lg:px-14 lg:py-14">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#12233f]">
              Bienvenido de nuevo
            </h1>
            <p className="mt-4 text-base text-slate-500">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-11 space-y-7">
            <div>
              <label className="block text-base font-semibold text-[#12233f]">
                Correo electrónico
              </label>
              <input
                type="email"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="mt-3 h-14 w-full rounded-xl border border-slate-200 bg-white px-5 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-[#12233f]">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-3 h-14 w-full rounded-xl border border-slate-200 bg-white px-5 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="h-14 w-full rounded-xl bg-[#3c465f] text-lg font-bold text-white transition hover:bg-[#2f384e]"
            >
              Ingresar
            </button>
          </form>
        </div>
      </section>
      <footer className="w-full bg-[#344052] px-6 py-5 text-white">
        <div className="mx-auto flex  max-w-7xl flex-col items-center gap-4 text-center lg:flex-row lg:justify-between">
          
          <div className="flex felx-wrap justify-center gap-6 font-medium">
            <button>ⓘ Necesita Ayuda</button>
            <button>◉ Consultar Tutorial</button>
          </div>

          <p className="text-sm">© 2026 Ingenierías. Todos los derechos reservados.</p>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <button>AVISO DE PRIVACIDAD</button>
            <button>TÉRMINOS Y CONDICIONES</button>
          </div>

        </div>
        </footer>
    </main>
  )
}