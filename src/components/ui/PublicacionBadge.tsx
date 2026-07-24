'use client'
import { publicacionColor, publicacionLabel, formatFecha } from '@/lib/utils'
import type { Ingenieria } from '@/types'

type Props = {
  ingenieria: Pick<
    Ingenieria,
    'estado' | 'publicacionEstado' | 'publicacionEn' | 'publicacionError' | 'publicacionIntentos'
  >
  /** Tamaño del pill: lista vs topbar */
  size?: 'sm' | 'md'
}

/** Badge de publicación hacia sistemas externos (solo si hay estado o está Aprobada+). */
export function PublicacionBadge({ ingenieria, size = 'sm' }: Props) {
  const estado = ingenieria.publicacionEstado
  // Mostrar si ya hay tracking, o si acaba de aprobarse (queda pendiente de consumo).
  const mostrar = estado != null || ingenieria.estado === 'Aprobada'
  if (!mostrar) return null

  const efectivo = estado ?? 'pendiente'
  const label = publicacionLabel(efectivo)
  const titleParts = [
    `Publicación: ${label}`,
    ingenieria.publicacionEn ? `Último: ${formatFecha(ingenieria.publicacionEn)}` : null,
    ingenieria.publicacionIntentos
      ? `Intentos: ${ingenieria.publicacionIntentos}`
      : null,
    ingenieria.publicacionError ? `Error: ${ingenieria.publicacionError}` : null,
  ].filter(Boolean)

  const sizeCls =
    size === 'md'
      ? 'text-sm font-semibold px-2 py-0.5 rounded-md'
      : 'text-xs font-medium px-2 py-1 rounded-full'

  return (
    <span
      className={`${sizeCls} flex-shrink-0 ${publicacionColor(efectivo)}`}
      title={titleParts.join(' · ')}
    >
      {label}
    </span>
  )
}
