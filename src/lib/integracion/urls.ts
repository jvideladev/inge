/**
 * URL pública de la vista HTML (popup / iframe) de una ingeniería.
 * Auth de la página: pendiente de definición Totalplay (hoy sin login).
 */
export function buildVistaUrl(ingenieriaId: string): string {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_PUBLIC_URL ||
    ''
  ).replace(/\/$/, '')
  const path = `/vista/ingenieria/${encodeURIComponent(ingenieriaId)}`
  return base ? `${base}${path}` : path
}
