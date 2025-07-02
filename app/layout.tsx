import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Leitor de Código de Barras',
  description: 'Aplicativo para leitura de códigos de barras usando Next.js',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
