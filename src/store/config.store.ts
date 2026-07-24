import { create } from 'zustand'
import type { AppConfig, CfgCampoPanel, CfgDispositivoTipo, CfgEnlaceTipo, CfgOrigen } from '@/types/config'

interface ConfigStore {
  loaded: boolean
  loading: boolean
  error: string | null
  dispositivos: CfgDispositivoTipo[]
  enlaces: CfgEnlaceTipo[]
  origenes: CfgOrigen[]
  camposDispositivo: CfgCampoPanel[]
  camposEnlace: CfgCampoPanel[]
  fetchConfig: () => Promise<void>
  dispositivoByCodigo: (codigo: string) => CfgDispositivoTipo | undefined
  enlaceByCodigo: (codigo: string) => CfgEnlaceTipo | undefined
  origenColor: (codigo: string) => string
  enlaceStyle: (codigo: string) => { stroke: string; strokeWidth: number; strokeDasharray?: string }
}

const FALLBACK_ORIGEN: Record<string, string> = {
  Discovery: '#16A34A',
  Excel: '#2563EB',
  Manual: '#CA8A04',
}

const FALLBACK_ENLACE: Record<string, { stroke: string; strokeWidth: number; strokeDasharray?: string }> = {
  UTP: { stroke: '#2563EB', strokeWidth: 2 },
  Fibra: { stroke: '#D97706', strokeWidth: 2 },
  Microonda: { stroke: '#7C3AED', strokeWidth: 2, strokeDasharray: '8 4' },
  Logico: { stroke: '#0D9488', strokeWidth: 1.5, strokeDasharray: '3 3' },
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  loaded: false,
  loading: false,
  error: null,
  dispositivos: [],
  enlaces: [],
  origenes: [],
  camposDispositivo: [],
  camposEnlace: [],

  fetchConfig: async () => {
    if (get().loading) return
    set({ loading: true, error: null })
    try {
      const res = await fetch('/api/config')
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = (await res.json()) as AppConfig
      set({
        dispositivos: data.dispositivos ?? [],
        enlaces: data.enlaces ?? [],
        origenes: data.origenes ?? [],
        camposDispositivo: data.camposDispositivo ?? [],
        camposEnlace: data.camposEnlace ?? [],
        loaded: true,
        loading: false,
      })
    } catch (e: any) {
      set({ error: e?.message ?? 'No se pudo cargar configuración', loading: false, loaded: false })
    }
  },

  dispositivoByCodigo: (codigo) => get().dispositivos.find((d) => d.codigo === codigo),

  enlaceByCodigo: (codigo) => get().enlaces.find((e) => e.codigo === codigo),

  origenColor: (codigo) =>
    get().origenes.find((o) => o.codigo === codigo)?.color ?? FALLBACK_ORIGEN[codigo] ?? '#9098B0',

  enlaceStyle: (codigo) => {
    const e = get().enlaces.find((x) => x.codigo === codigo)
    if (!e) return FALLBACK_ENLACE[codigo] ?? FALLBACK_ENLACE.UTP
    return {
      stroke: e.stroke,
      strokeWidth: e.strokeWidth,
      ...(e.strokeDasharray ? { strokeDasharray: e.strokeDasharray } : {}),
    }
  },
}))
