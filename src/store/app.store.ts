import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Ingenieria, Usuario, EstadoIngenieria, PerfilSistema, PerfilUsuario } from '@/types'
import { PERFILES_MOCK } from '@/data/mock'
import { ingenieriasApi, authApi } from '@/lib/api'
import { clearStoredAuth, readStoredAuth, writeStoredAuth } from '@/lib/auth-client'

interface AppStore {
  // Auth
  usuario:    Usuario
  setUsuario: (u: Usuario) => void
  autenticado: boolean
  loginWithCredentials: (email: string, password: string) => Promise<void>
  restoreSession: () => Promise<boolean>
  logout: () => Promise<void>

  // Tema
  temaOscuro: boolean
  toggleTema: () => void

  // Perfiles
  perfiles: PerfilSistema[]
  addPerfil: (perfil: PerfilSistema) => void
  updatePerfil: (id: string, partial: Partial<PerfilSistema>) => void
  deletePerfil: (id: string) => void

  // Listado
  ingenierias:      Ingenieria[]
  loading:          boolean
  error:            string | null
  fetchIngenierias: () => Promise<void>
  addIngenieria:    (ing: Ingenieria) => Promise<Ingenieria>
  updateIngenieria: (id: string, partial: Partial<Ingenieria>) => void
  deleteIngenieria: (id: string) => Promise<void>

  // Editor activo
  ingenieriaActiva:    Ingenieria | null
  cambiosSinGuardar:   boolean
  marcarCambios:       () => void
  abrirIngenieria:     (id: string) => void
  cerrarIngenieria:    () => void
  guardarCambios:      (nodes: any[], edges: any[]) => Promise<void>

  // Estados
  cambiarEstado: (id: string, estado: EstadoIngenieria, comentario?: string) => Promise<void>
}

const EMPTY_USER: Usuario = {
  id: '',
  nombre: '',
  email: '',
  perfil: 'Consulta',
}

export const useAppStore = create<AppStore>()(persist((set, get) => ({

  // ── Auth ─────────────────────────────────────────────────────────────
  usuario:    EMPTY_USER,
  setUsuario: (u) => set({ usuario: u }),
  autenticado: false,

  loginWithCredentials: async (email, password) => {
    const session = await authApi.login(email, password)
    writeStoredAuth({
      token: session.token,
      provider: session.provider,
      expiresAt: session.expiresAt,
      user: session.user,
    })
    set({
      usuario: {
        id: session.user.id,
        nombre: session.user.nombre,
        email: session.user.email,
        perfil: session.user.perfil as PerfilUsuario,
      },
      autenticado: true,
    })
  },

  restoreSession: async () => {
    const stored = readStoredAuth()
    if (!stored) {
      set({ autenticado: false, usuario: EMPTY_USER })
      return false
    }
    try {
      const me = await authApi.me()
      set({
        usuario: {
          id: me.id,
          nombre: me.nombre,
          email: me.email,
          perfil: me.perfil as PerfilUsuario,
        },
        autenticado: true,
      })
      return true
    } catch {
      clearStoredAuth()
      set({ autenticado: false, usuario: EMPTY_USER })
      return false
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore network errors on logout
    }
    clearStoredAuth()
    set({ autenticado: false, usuario: EMPTY_USER, ingenieriaActiva: null, cambiosSinGuardar: false })
  },

  // ── Tema ─────────────────────────────────────────────────────────────
  temaOscuro: false,
  toggleTema: () => set((s) => ({ temaOscuro: !s.temaOscuro })),

  // ── Perfiles ─────────────────────────────────────────────────────────
  perfiles: PERFILES_MOCK,

  addPerfil: (perfil) =>
    set((s) => ({ perfiles: [perfil, ...s.perfiles] })),

  updatePerfil: (id, partial) =>
    set((s) => ({
      perfiles: s.perfiles.map((p) =>
        p.id === id ? { ...p, ...partial, modificadoEn: new Date().toISOString() } : p
      ),
    })),

  deletePerfil: (id) =>
    set((s) => ({ perfiles: s.perfiles.filter((p) => p.id !== id) })),

  // ── Ingenierías (MariaDB) ─────────────────────────────────────────────
  ingenierias: [],
  loading:     false,
  error:       null,

  fetchIngenierias: async () => {
    set({ loading: true, error: null })
    try {
      const data = await ingenieriasApi.list()
      set({ ingenierias: data, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  addIngenieria: async (ing) => {
    const creada = await ingenieriasApi.create({
      nombre: ing.nombre,
      cliente: ing.cliente,
      cuenta: ing.cuenta,
      estado: ing.estado,
      creadaPor: ing.creadaPor,
      nodes: ing.nodes ?? [],
      edges: ing.edges ?? [],
      editable: true,
    })
    set((s) => ({ ingenierias: [creada, ...s.ingenierias] }))
    return creada
  },

  updateIngenieria: (id, partial) =>
    set((s) => ({
      ingenierias: s.ingenierias.map((i) =>
        i.id === id ? { ...i, ...partial, modificadaEn: new Date().toISOString() } : i
      ),
      ingenieriaActiva:
        s.ingenieriaActiva?.id === id
          ? { ...s.ingenieriaActiva, ...partial }
          : s.ingenieriaActiva,
    })),

  deleteIngenieria: async (id) => {
    await ingenieriasApi.delete(id)
    set((s) => ({
      ingenierias:      s.ingenierias.filter((i) => i.id !== id),
      ingenieriaActiva: s.ingenieriaActiva?.id === id ? null : s.ingenieriaActiva,
    }))
  },

  // ── Editor ───────────────────────────────────────────────────────────
  ingenieriaActiva:  null,
  cambiosSinGuardar: false,

  marcarCambios: () => {
    const ing = get().ingenieriaActiva
    if (ing && ing.editable === false) return
    set({ cambiosSinGuardar: true })
  },

  abrirIngenieria: (id) => {
    const ing = get().ingenierias.find((i) => i.id === id) ?? null
    set({ ingenieriaActiva: ing, cambiosSinGuardar: false })
  },

  cerrarIngenieria: () => set({ ingenieriaActiva: null, cambiosSinGuardar: false }),

  guardarCambios: async (nodes, edges) => {
    const { ingenieriaActiva, usuario } = get()
    if (!ingenieriaActiva) return
    if (ingenieriaActiva.editable === false) {
      throw new Error('Ingeniería de demo: solo lectura')
    }

    const updated = await ingenieriasApi.guardar(
      ingenieriaActiva.id,
      nodes,
      edges,
      usuario.nombre,
    )

    set((s) => ({
      ingenieriaActiva: updated,
      cambiosSinGuardar: false,
      ingenierias: s.ingenierias.map((i) => (i.id === updated.id ? updated : i)),
    }))
  },

  // ── Estados ───────────────────────────────────────────────────────────
  cambiarEstado: async (id, estado, comentario) => {
    const ing = get().ingenierias.find((i) => i.id === id)
    if (ing && ing.editable === false) {
      throw new Error('Ingeniería de demo: solo lectura')
    }
    const u = get().usuario
    const updated = await ingenieriasApi.cambiarEstado(id, estado, {
      usuario: u.nombre,
      perfil: u.perfil,
      comentario,
    })
    get().updateIngenieria(id, updated)
  },
}), {
  name: 'ingenierias-store',
  version: 3,
  storage: createJSONStorage(() => localStorage),
  partialize: (s) => ({
    temaOscuro: s.temaOscuro,
  }),
}))
