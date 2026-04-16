import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mi Universidad · IA Académica',
  description: 'Herramientas de inteligencia artificial para estudiantes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Script src="https://js.puter.com/v2/" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  )
}