/**
 * api.ts — Capa de servicio centralizada
 *
 * Todas las llamadas al backend pasan por aquí.
 * Para separar front y back: cambiar BASE_URL con una variable de entorno
 * apuntando al servidor del backend. Ningún otro archivo necesita cambiar.
 *
 * En desarrollo (mismo servidor):  BASE_URL = ""  → /api/...
 * Con backend separado:            BASE_URL = "https://api.totalplay.internal"
 */

import type { Ingenieria, EstadoIngenieria } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// ── Helper interno ─────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}/api${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error?.message ?? `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ── Ingenierías ────────────────────────────────────────────────────────────

export const ingenieriasApi = {

  /** Obtiene todas las ingenierías del usuario actual */
  list(): Promise<Ingenieria[]> {
    return request<Ingenieria[]>('/ingenierias')
  },

  /** Obtiene una ingeniería por ID */
  get(id: string): Promise<Ingenieria> {
    return request<Ingenieria>(`/ingenierias/${id}`)
  },

  /** Crea una nueva ingeniería */
  create(data: Omit<Ingenieria, 'id' | 'creadaEn' | 'modificadaEn'>): Promise<Ingenieria> {
    return request<Ingenieria>('/ingenierias', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /** Actualiza nodos y edges del canvas (guardado) */
  guardar(id: string, nodes: any[], edges: any[]): Promise<Ingenieria> {
    return request<Ingenieria>(`/ingenierias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ nodes, edges }),
    })
  },

  /** Cambia el estado de una ingeniería */
  cambiarEstado(id: string, estado: EstadoIngenieria): Promise<Ingenieria> {
    return request<Ingenieria>(`/ingenierias/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    })
  },

  /** Elimina una ingeniería */
  delete(id: string): Promise<void> {
    return request<void>(`/ingenierias/${id}`, { method: 'DELETE' })
  },

  /** Importa dispositivos desde Excel (recibe el JSON parseado del archivo) */
  importarExcel(id: string, rows: Record<string, string>[]): Promise<Ingenieria> {
    return request<Ingenieria>(`/ingenierias/${id}/importar-excel`, {
      method: 'POST',
      body: JSON.stringify({ rows }),
    })
  },

  /** Solicita generación de ingeniería desde Discovery */
  generarDesdeDiscovery(id: string, params: { cuenta: string }): Promise<Ingenieria> {
    return request<Ingenieria>(`/ingenierias/${id}/discovery`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  /** Exporta la ingeniería a Excel (devuelve Blob) */
  async exportarExcel(id: string): Promise<Blob> {
    const url = `${BASE_URL}/api/ingenierias/${id}/exportar-excel`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error exportando Excel: ${res.statusText}`)
    return res.blob()
  },

  /** Exporta la ingeniería a PDF (devuelve Blob) */
  async exportarPdf(id: string): Promise<Blob> {
    const url = `${BASE_URL}/api/ingenierias/${id}/exportar-pdf`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error exportando PDF: ${res.statusText}`)
    return res.blob()
  },
}

// ── CMDB ───────────────────────────────────────────────────────────────────

export const cmdbApi = {

  /** Verifica si un objeto existe en la CMDB */
  verificar(hostname: string): Promise<{ registrado: boolean; datos?: Record<string, string> }> {
    return request(`/cmdb/verificar?hostname=${encodeURIComponent(hostname)}`)
  },

  /** Actualiza la CMDB con los objetos de una ingeniería aprobada */
  actualizar(ingenieriaId: string): Promise<{ actualizados: number; errores: string[] }> {
    return request(`/cmdb/actualizar`, {
      method: 'POST',
      body: JSON.stringify({ ingenieriaId }),
    })
  },
}

// ── Discovery ──────────────────────────────────────────────────────────────

export const discoveryApi = {

  /** Consulta el servicio de Discovery por cuenta */
  consultarCuenta(cuenta: string): Promise<{ nodes: any[]; edges: any[] }> {
    return request(`/discovery/cuenta?cuenta=${encodeURIComponent(cuenta)}`)
  },
}

// ── Auth ───────────────────────────────────────────────────────────────────

export const authApi = {

  /** Obtiene el usuario autenticado actual (desde sesión SSO) */
  me(): Promise<{ id: string; nombre: string; perfil: string }> {
    return request('/auth/me')
  },
}
