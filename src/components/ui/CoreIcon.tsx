'use client'
/** Triángulo con bordes redondeados — Core (violeta) / No core (gris) */
export function CoreIcon({
  core,
  size = 10,
  className = '',
}: {
  core: boolean
  size?: number
  className?: string
}) {
  const fill = core ? '#7C3AED' : '#9098B0'
  const title = core ? 'Core' : 'No Core'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path
        d="M7 1.6 L12.2 11.2 Q12.5 11.8 11.9 11.8 L2.1 11.8 Q1.5 11.8 1.8 11.2 Z"
        fill={fill}
        stroke={fill}
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
