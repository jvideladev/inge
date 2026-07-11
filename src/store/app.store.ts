import { create } from 'zustand'
import type { Ingenieria, Usuario, EstadoIngenieria, PerfilSistema } from '@/types'
import { INGENIERIAS_MOCK, PERFILES_MOCK, USUARIOS_MOCK } from '@/data/mock'
import { ingenieriasApi, cmdbApi } from '@/lib/api'

const MOCK_MODE = true

interface AppStore {
  // Auth
  usuario:    Usuario
  setUsuario: (u: Usuario) => void
  autenticado: boolean
  login: (usuarioId: string) => void
  logout: () => void

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
  addIngenieria:    (ing: Ingenieria) => void
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
  cambiarEstado: (id: string, estado: EstadoIngenieria) => Promise<void>
}

export const useAppStore = create<AppStore>((set, get) => ({

  // ── Auth ─────────────────────────────────────────────────────────────
  usuario:    USUARIOS_MOCK[0],
  setUsuario: (u) => set({ usuario: u }),
  autenticado: false,
  login: (usuarioId) => {
    const usuario = USUARIOS_MOCK.find((u) => u.id === usuarioId) ?? USUARIOS_MOCK[0]
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ingenierias-auth', JSON.stringify({ usuarioId: usuario.id }))
    }
    set({ usuario, autenticado: true })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('ingenierias-auth')
    }
    set({ autenticado: false, ingenieriaActiva: null, cambiosSinGuardar: false })
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

  // ── Ingenierías ───────────────────────────────────────────────────────
  ingenierias: MOCK_MODE ? INGENIERIAS_MOCK : [],
  loading:     false,
  error:       null,

  fetchIngenierias: async () => {
    if (MOCK_MODE) {
      set({ ingenierias: INGENIERIAS_MOCK })
      return
    }
    set({ loading: true, error: null })
    try {
      const data = await ingenieriasApi.list()
      set({ ingenierias: data, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  addIngenieria: (ing) =>
    set((s) => ({ ingenierias: [ing, ...s.ingenierias] })),

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
    if (!MOCK_MODE) {
      await ingenieriasApi.delete(id)
    }
    set((s) => ({
      ingenierias:      s.ingenierias.filter((i) => i.id !== id),
      ingenieriaActiva: s.ingenieriaActiva?.id === id ? null : s.ingenieriaActiva,
    }))
  },

  // ── Editor ───────────────────────────────────────────────────────────
  ingenieriaActiva:  null,
  cambiosSinGuardar: false,

  marcarCambios: () => set({ cambiosSinGuardar: true }),

  abrirIngenieria: (id) => {
    const ing = get().ingenierias.find((i) => i.id === id) ?? null
    set({ ingenieriaActiva: ing, cambiosSinGuardar: false })
  },

  cerrarIngenieria: () => set({ ingenieriaActiva: null, cambiosSinGuardar: false }),

  guardarCambios: async (nodes, edges) => {
    const { ingenieriaActiva } = get()
    if (!ingenieriaActiva) return

    if (!MOCK_MODE) {
      await ingenieriasApi.guardar(ingenieriaActiva.id, nodes, edges)
    }

    const updated = {
      ...ingenieriaActiva,
      nodes,
      edges,
      modificadaEn: new Date().toISOString(),
    }
    set((s) => ({
      ingenieriaActiva: updated,
      cambiosSinGuardar: false,
      ingenierias: s.ingenierias.map((i) => (i.id === updated.id ? updated : i)),
    }))
  },

  // ── Estados ───────────────────────────────────────────────────────────
  cambiarEstado: async (id, estado) => {
    if (!MOCK_MODE) {
      await ingenieriasApi.cambiarEstado(id, estado)
    }
    get().updateIngenieria(id, { estado })
  },
}))
