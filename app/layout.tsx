import { ReactNode } from 'react'
import { Metadata } from 'next'
import './globals.css'
import { getAssetPath } from '@/utils/path-utils'

export const metadata: Metadata = {
  title: 'Musikalische Zeitreise',
  description: 'Interaktive Ausstellungs-App für historische Audioaufnahmen',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Basispfad für Ressourcen - wir extrahieren den Basis-Pfad aus der Asset-Pfad-Funktion
  const basePath = process.env.NODE_ENV === 'production' ? '/exhibition-app' : '';
  
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
