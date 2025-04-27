"use client"

import { useState, useEffect } from "react"
import { X, FileCheck, FileX, AlertCircle, Image } from "lucide-react"
import { useAudio } from "@/contexts/audio-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { audioFiles, DEFAULT_COVER_IMAGE } from "@/data/audio-files"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LoadingScreenProps {
  onClose: () => void
}

export default function LoadingScreen({ onClose }: LoadingScreenProps) {
  // Audiodaten aus dem Kontext abrufen
  const { isLoading, unavailableFiles, availableFiles } = useAudio()
  
  // Zustand für Fortschritt und fehlende Daten
  const [progress, setProgress] = useState(0)
  const [missingMetadata, setMissingMetadata] = useState<string[]>([])
  const [missingCovers, setMissingCovers] = useState<string[]>([])
  const [currentTab, setCurrentTab] = useState("verfügbar")

  // Fehlende Metadaten und Cover überprüfen
  useEffect(() => {
    const metadataMissing: string[] = []
    const coversMissing: string[] = []

    audioFiles.forEach((track) => {
      // Nach fehlenden wesentlichen Metadaten suchen
      if (!track.titel || !track.komponist || !track.erschienen) {
        metadataMissing.push(`${track.id}. ${track.titel || "Unbekannter Titel"}`)
      }

      // Aktualisierte Überprüfung auf fehlende Cover - Platzhalter nicht als fehlend zählen
      if (!track.coverImage || 
          track.coverImage.includes("placeholder.svg") || 
          track.coverImage === DEFAULT_COVER_IMAGE) {
        coversMissing.push(`${track.id}. ${track.titel || "Unbekannter Titel"}`)
      }
    })

    setMissingMetadata(metadataMissing)
    setMissingCovers(coversMissing)
  }, [])

  // Lade-Fortschritt simulieren
  useEffect(() => {
    if (isLoading) {
      // Langsamerer Start, schnelleres Ende für natürlicheres Ladeverhalten
      const simulateProgress = () => {
        setProgress((prev) => {
          // Beschleunigte Fortschrittszunahme mit zunehmender Nähe zum Ende
          const increment = prev < 30 ? 0.5 : prev < 60 ? 1 : prev < 90 ? 1.5 : 0.5;
          const newProgress = Math.min(99, prev + increment);
          return newProgress;
        });
      };
      
      const interval = setInterval(simulateProgress, 50);
      return () => clearInterval(interval);
    } else {
      // Vollständigen Fortschritt anzeigen, wenn geladen
      setProgress(100);
    }
  }, [isLoading])

  // Automatisch zum Tab mit Problemen wechseln, wenn Ladevorgang abgeschlossen ist
  useEffect(() => {
    if (!isLoading) {
      if (unavailableFiles.length > 0) {
        setCurrentTab("nicht-verfügbar");
      } else if (missingMetadata.length > 0) {
        setCurrentTab("fehlende-metadaten");
      } else if (missingCovers.length > 0) {
        setCurrentTab("fehlende-cover");
      }
    }
  }, [isLoading, unavailableFiles, missingMetadata, missingCovers]);

  // Einfacher Ladebildschirm für die Produktionsumgebung
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <div className="w-96 max-w-[80%] text-center">
          <h1 className="text-2xl font-bold mb-8">Ausstellungs-App</h1>
          
          {/* Fortschrittsbalken */}
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">{isLoading ? `${Math.round(progress)}%` : "Bereit"}</p>
          </div>
          
          <p className="text-lg">
            {isLoading ? "Mediendateien werden vorbereitet..." : "Bereit zum Starten"}
          </p>
        </div>
      </div>
    )
  }

  // Detaillierter Ladebildschirm für die Entwicklungsumgebung
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Kopfbereich mit X-Schaltfläche */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h1 className="text-2xl font-bold">Audio-Dateien werden überprüft</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onClose} 
          disabled={isLoading && progress < 80} 
          className="rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Inhalt */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        {/* Fortschrittsbalken */}
        <div className="mb-6">
          <Progress 
            value={progress} 
            className="h-2" 
            indicatorColor={isLoading ? undefined : unavailableFiles.length > 0 ? "bg-red-500" : "bg-green-500"} 
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{isLoading ? `Lädt (${Math.round(progress)}%)` : "Abgeschlossen"}</span>
            <span>
              {availableFiles.length} von {availableFiles.length + unavailableFiles.length} Dateien verfügbar
            </span>
          </div>
        </div>

        {/* Statusmeldung */}
        <div className="mb-4">
          {isLoading ? (
            <p className="text-lg flex items-center">
              <span className="animate-pulse mr-2">⧖</span>
              Überprüfe Audio-Dateien...
            </p>
          ) : (
            <p className="text-lg flex items-center">
              <FileCheck className="h-5 w-5 mr-2 text-green-500" />
              Überprüfung abgeschlossen
            </p>
          )}
        </div>

        {/* Ergebnisse - nur anzeigen, wenn nicht mehr lädt */}
        {!isLoading && (
          <Tabs 
            defaultValue="verfügbar" 
            value={currentTab} 
            onValueChange={setCurrentTab} 
            className="flex-1 flex flex-col"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="verfügbar" className="flex items-center gap-1">
                <FileCheck className="h-4 w-4" /> 
                Verfügbar ({availableFiles.length})
              </TabsTrigger>
              <TabsTrigger value="nicht-verfügbar" className="flex items-center gap-1">
                <FileX className="h-4 w-4" /> 
                Fehlt ({unavailableFiles.length})
                {unavailableFiles.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>}
              </TabsTrigger>
              <TabsTrigger value="fehlende-metadaten" className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> 
                Metadaten ({missingMetadata.length})
                {missingMetadata.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 ml-1"></span>}
              </TabsTrigger>
              <TabsTrigger value="fehlende-cover" className="flex items-center gap-1">
                <Image className="h-4 w-4" /> 
                Cover ({missingCovers.length})
                {missingCovers.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 ml-1"></span>}
              </TabsTrigger>
            </TabsList>

            <div className="flex-1">
              <TabsContent value="verfügbar" className="h-full mt-0">
                <FileListCard 
                  items={availableFiles} 
                  emptyMessage="Keine verfügbaren Dateien gefunden" 
                  className="bg-green-50 border-green-200"
                />
              </TabsContent>
              
              <TabsContent value="nicht-verfügbar" className="h-full mt-0">
                <FileListCard 
                  items={unavailableFiles} 
                  emptyMessage="Alle Dateien sind verfügbar" 
                  className="bg-red-50 border-red-200"
                />
              </TabsContent>
              
              <TabsContent value="fehlende-metadaten" className="h-full mt-0">
                <FileListCard 
                  items={missingMetadata} 
                  emptyMessage="Alle Metadaten sind vollständig" 
                  className="bg-amber-50 border-amber-200"
                />
              </TabsContent>
              
              <TabsContent value="fehlende-cover" className="h-full mt-0">
                <FileListCard 
                  items={missingCovers} 
                  emptyMessage="Alle Cover sind vorhanden" 
                  className="bg-amber-50 border-amber-200"
                />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  )
}

// Wiederverwendbare Komponente für Dateilisten
interface FileListCardProps {
  items: string[];
  emptyMessage: string;
  className?: string;
}

function FileListCard({ items, emptyMessage, className }: FileListCardProps) {
  return (
    <div className={`border rounded-lg h-full flex flex-col ${className}`}>
      <ScrollArea className="flex-1 p-4">
        {items.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-gray-700">
                {item.split("/").pop()}
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 italic">{emptyMessage}</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
