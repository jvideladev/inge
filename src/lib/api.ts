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
import { authHeaders } from '@/lib/auth-client'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// ── Helper interno ─────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}/api${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error?.message ?? `Error ${res.status}`)
  }
  if (res.status === 204) return undefined as T
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
  guardar(id: string, nodes: any[], edges: any[], usuario?: string): Promise<Ingenieria> {
    return request<Ingenieria>(`/ingenierias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ nodes, edges, usuario }),
    })
  },

  /** Cambia el estado de una ingeniería (comentario requerido al rechazar) */
  cambiarEstado(
    id: string,
    estado: EstadoIngenieria,
    opts?: { usuario?: string; perfil?: string; comentario?: string },
  ): Promise<Ingenieria> {
    return request<Ingenieria>(`/ingenierias/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({
        estado,
        usuario: opts?.usuario,
        perfil: opts?.perfil,
        comentario: opts?.comentario,
      }),
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

  /** Discovery (mock): requiere IP; reemplaza topología */
  generarDesdeDiscovery(
    id: string,
    params: { ip: string; usuario?: string },
  ): Promise<Ingenieria> {
    return request<Ingenieria>(`/ingenierias/${id}/discovery`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  listComentarios(id: string): Promise<{ items: import('@/lib/comentarios.repo').IngenieriaComentario[] }> {
    return request(`/ingenierias/${id}/comentarios`)
  },

  addComentario(
    id: string,
    data: { texto: string; usuario?: string; perfil?: string; estadoDestino?: string },
  ): Promise<import('@/lib/comentarios.repo').IngenieriaComentario> {
    return request(`/ingenierias/${id}/comentarios`, {
      method: 'POST',
      body: JSON.stringify(data),
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
  /** Login vía AuthProvider (local / futuro LDAP|OAuth) */
  login(email: string, password: string): Promise<{
    token: string
    provider: string
    expiresAt: string
    user: { id: string; nombre: string; email: string; perfil: string }
  }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  /** Cierra la sesión en el servidor */
  logout(): Promise<{ ok: boolean }> {
    return request('/auth/logout', { method: 'POST' })
  },

  /** Obtiene el usuario de la sesión actual */
  me(): Promise<{ id: string; nombre: string; email: string; perfil: string }> {
    return request('/auth/me')
  },
}

// ── Configuración ──────────────────────────────────────────────────────────

export const configApi = {
  /** Configuración activa para el runtime */
  get(): Promise<import('@/types/config').AppConfig> {
    return request('/config')
  },

  /** Admin: lista completa (incluye inactivos) */
  admin(): Promise<{
    dispositivos: import('@/types/config').CfgDispositivoTipo[]
    enlaces: import('@/types/config').CfgEnlaceTipo[]
    camposDispositivo: import('@/types/config').CfgCampoPanel[]
    camposEnlace: import('@/types/config').CfgCampoPanel[]
  }> {
    return request('/config/admin')
  },

  /** Admin: actualiza / reordena */
  patch(body: Record<string, unknown>): Promise<unknown> {
    return request('/config/admin', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },
}
