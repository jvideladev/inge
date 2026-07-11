import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aplicativo de Ingenierías',
  description: 'Aplicativo de Ingenierías',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
