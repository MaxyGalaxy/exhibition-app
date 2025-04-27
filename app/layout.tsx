import { ReactNode } from 'react'
import { Metadata } from 'next'
import './globals.css'
import { getBasePath } from '@/utils/path-utils'

export const metadata: Metadata = {
  title: 'Musikalische Zeitreise',
  description: 'Interaktive Ausstellungs-App für historische Audioaufnahmen',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Basispfad für Ressourcen
  const basePath = getBasePath();
  
  return (
    <html lang="de">
      <head>
        {/* Pfad-Basis für Ressourcen setzen */}
        <base href={`${basePath}/`} />
      </head>
      <body>{children}</body>
    </html>
  )
}
