import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { EstadoIngenieria, OrigenObjeto, TipoEnlace } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function estadoColor(estado: EstadoIngenieria) {
  const map: Record<EstadoIngenieria, string> = {
    'Nueva':         'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'En revisión':   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'Aprobada':      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    'Rechazada':     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    'Aprovisionada': 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    'Implementada':  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  }
  return map[estado] ?? ''
}

export const ORIGEN_COLOR: Record<OrigenObjeto, string> = {
  Discovery: '#16A34A',  // green
  Excel:     '#2563EB',  // blue
  Manual:    '#CA8A04',  // amber/dark yellow
}

export const ENLACE_STYLE: Record<TipoEnlace, { stroke: string; strokeDasharray?: string; strokeWidth: number }> = {
  UTP:      { stroke: '#2563EB', strokeWidth: 2 },
  Fibra:    { stroke: '#D97706', strokeWidth: 2 },
  Microonda:{ stroke: '#7C3AED', strokeWidth: 2, strokeDasharray: '8 4' },
  Logico:   { stroke: '#0D9488', strokeWidth: 1.5, strokeDasharray: '3 3' },
}

export function generarId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}
