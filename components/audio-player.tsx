"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAudio } from "@/contexts/audio-context"
import { useActivity } from "@/contexts/activity-context";

import { audioFiles, DEFAULT_COVER_IMAGE, getCoverImage } from "@/data/audio-files"

// Funktion, um die Audiodauer zu ermitteln
const getAudioDuration = (audioElement: HTMLAudioElement): Promise<number> => {
  return new Promise((resolve) => {
    audioElement.addEventListener("loadedmetadata", () => {
      resolve(audioElement.duration)
    })

    // Falls Audio bereits geladen ist
    if (audioElement.readyState >= 2) {
      resolve(audioElement.duration)
    }
  })
}

interface AudioPlayerProps {
  onReset: () => void
}

export function AudioPlayer({ onReset }: { onReset: () => void }) {
  const { checkedFiles } = useAudio()
  const [currentTrack, setCurrentTrack] = useState(audioFiles[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [previousVolume, setPreviousVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [audioError, setAudioError] = useState<boolean>(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  // Initialen Audio-Fehlerzustand basierend auf geprüften Dateien setzen
  useEffect(() => {
    if (checkedFiles[currentTrack.file] === false) {
      setAudioError(true)
    } else {
      setAudioError(false)
    }
  }, [currentTrack.file, checkedFiles])

  // Zeit formatieren (Sekunden in MM:SS Format)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Einen Track auswählen
  const handleTrackSelect = (track: (typeof audioFiles)[0]) => {
    // Prüfen, ob der Track als abspielbar verifiziert wurde
    const isTrackPlayable = checkedFiles[track.file] !== false

    setCurrentTrack(track)
    setCurrentTime(0)
    setAudioError(!isTrackPlayable)
    setIsPlaying(isTrackPlayable)
  }

  // Wiedergabe umschalten
  const togglePlayPause = () => {
    if (!audioError) {
      setIsPlaying(!isPlaying)
    }
  }

  // Zum vorherigen Track wechseln
  const handlePrevTrack = () => {
    const currentIndex = audioFiles.findIndex((track) => track.id === currentTrack.id)
    const prevIndex = (currentIndex - 1 + audioFiles.length) % audioFiles.length
    const prevTrack = audioFiles[prevIndex]

    // Prüfen, ob der vorherige Track abspielbar ist
    const isPrevTrackPlayable = checkedFiles[prevTrack.file] !== false

    setCurrentTrack(prevTrack)
    setCurrentTime(0)
    setAudioError(!isPrevTrackPlayable)
    setIsPlaying(isPrevTrackPlayable)
  }

  // Zum nächsten Track wechseln
  const handleNextTrack = () => {
    const currentIndex = audioFiles.findIndex((track) => track.id === currentTrack.id)
    const nextIndex = (currentIndex + 1) % audioFiles.length
    const nextTrack = audioFiles[nextIndex]

    // Prüfen, ob der nächste Track abspielbar ist
    const isNextTrackPlayable = checkedFiles[nextTrack.file] !== false

    setCurrentTrack(nextTrack)
    setCurrentTime(0)
    setAudioError(!isNextTrackPlayable)
    setIsPlaying(isNextTrackPlayable)
  }

  // Erweiterte Stummschaltungsfunktion
  const toggleMute = () => {
    if (isMuted) {
      // Falls derzeit stumm, Stummschaltung aufheben und vorherige Lautstärke wiederherstellen
      setIsMuted(false)
      setVolume(previousVolume > 0 ? previousVolume : 100)
    } else {
      // Falls nicht stumm, aktuelle Lautstärke speichern und stumm schalten
      setPreviousVolume(volume)
      setIsMuted(true)
      setVolume(0)
    }
  }

  // Lautstärkeänderungen behandeln
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    // Bei Lautstärke 0 stumm schalten, ansonsten Stummschaltung aufheben
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  // Audiowiedergabe und Metadaten verwalten
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Wiedergabe fehlgeschlagen:", error)
          setAudioError(true)
          setIsPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }

      // Tatsächliche Dauer ermitteln, wenn Audio geladen ist
      getAudioDuration(audioRef.current).then((duration) => {
        // Aktuelle Track-Dauer mit dem tatsächlichen Wert aktualisieren
        setCurrentTrack((prev) => ({
          ...prev,
          duration: duration || prev.duration,
        }))
      })
    }
  }, [isPlaying, currentTrack.file])

  // Zeitanzeige aktualisieren
  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime)
      }
    }

    const timeInterval = setInterval(updateTime, 1000)
    return () => clearInterval(timeInterval)
  }, [])

  // Lautstärkeänderungen verarbeiten
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  // Tracks nach Jahr für die Zeitleiste gruppieren
  const tracksByYear: Record<string, typeof audioFiles> = {}
  audioFiles.forEach((track) => {
    const year = track.erschienen
    if (year && !tracksByYear[year]) {
      tracksByYear[year] = []
    }
    if (year) {
      tracksByYear[year].push(track)
    }
  })

  // Einzigartige Jahre für die Zeitleiste ermitteln
  const years = Object.keys(tracksByYear).sort()

  return (
    <div className="h-full w-full flex flex-col bg-white text-black">
      {/* Verstecktes Audio-Element */}
      <audio
        ref={audioRef}
        src={currentTrack.file}
        onEnded={handleNextTrack}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onError={() => {
          setAudioError(true)
          setIsPlaying(false)
        }}
        crossOrigin="anonymous"
      />

      {/* Benutzerdefinierte Stile für kleinere Slider-Regler */}
      <style jsx global>{`
        .slider-thumb-sm [data-orientation="horizontal"] .slider-thumb {
          width: 10px;
          height: 10px;
        }
      `}</style>

      {/* Kopfzeile */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Musiksammlung</h1>
        <Button variant="outline" size="sm" onClick={onReset} className="flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Start
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Linke Seite - Audio-Liste mit Zeitleiste */}
        <div className="w-1/2 border-r border-gray-200">
          <ScrollArea className="h-full">
            <div className="p-4">
              {/* Zeitleiste mit Tracks */}
              <div className="relative">
                {/* Vertikale Zeitleistenlinie */}
                <div className="absolute left-[14px] top-0 bottom-0 w-[1px] bg-gray-300"></div>

                {years.map((year) => (
                  <div key={year} className="mb-8">
                    {/* Jahresmarkierung mit Punkt direkt auf der Linie */}
                    <div className="relative flex items-center mb-4">
                      {/* Punkt direkt auf der Linie positioniert */}
                      <div
                        className={`absolute left-[14px] w-[10px] h-[10px] rounded-full transform -translate-x-[4.5px] ${
                          year === currentTrack.erschienen ? "bg-[#b41f2a]" : "bg-gray-400"
                        }`}
                      ></div>

                      {/* Jahresbezeichnung */}
                      <div className="absolute left-[14px] top-[12px] transform -translate-x-1/2 text-sm font-medium text-gray-600 bg-white px-2 py-0.5 rounded z-0">
                        {year}
                      </div>
                    </div>

                    {/* Tracks für dieses Jahr */}
                    <div className="space-y-4 ml-8 mt-6 relative z-10">
                      {tracksByYear[year].map((track) => {
                        // Bestimmen, ob Track bekanntermaßen nicht abspielbar ist
                        const isUnplayable = checkedFiles[track.file] === false

                        return (
                          <div
                            key={track.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                              currentTrack.id === track.id
                                ? "bg-red-50 border border-red-100"
                                : "hover:bg-gray-50 border border-transparent"
                            } ${isUnplayable ? "opacity-50" : ""}`}
                            onClick={() => handleTrackSelect(track)}
                          >
                            <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                              <img
                                src={getCoverImage(track)}
                                alt={`Cover für ${track.titel}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium line-clamp-1 text-gray-900">{track.titel}</div>
                              <div className="text-sm text-gray-600 line-clamp-1">
                                {track.werk ? `${track.werk} - ` : ""}
                                {track.komponist}
                              </div>
                              {isUnplayable && <div className="text-xs text-red-500 mt-1">Nicht verfügbar</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Rechte Seite - Track-Info und Steuerelemente mit #e3dcd2 Hintergrund */}
        <div className="w-1/2 flex flex-col bg-[#e3dcd2]">
          <div className="flex-1 p-6 overflow-auto">
            {/* Cover links, Titel rechts */}
            <div className="flex gap-4 mb-6">
              <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-300">
                <img
                  src={getCoverImage(currentTrack)}
                  alt={`Cover für ${currentTrack.titel}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl font-bold line-clamp-3 text-gray-900">{currentTrack.titel}</h2>
                {audioError && <div className="text-sm text-red-500 mt-1">Diese Datei ist nicht verfügbar</div>}
              </div>
            </div>

            {/* Zweispalten-Layout mit gestapelten Bezeichnungen und Werten */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Werk</div>
                  <div className="text-base text-gray-900">{currentTrack.werk || "-"}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Komponist</div>
                  <div className="text-base text-gray-900">{currentTrack.komponist || "-"}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">WVZ-Nummer</div>
                  <div className="text-base text-gray-900">{currentTrack.wvzNummer || "-"}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Interpreten</div>
                  <div className="text-base text-gray-900">{currentTrack.interpreten}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Erschienen</div>
                  <div className="text-base text-gray-900">{currentTrack.erschienen || "-"}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Chorleiter</div>
                  <div className="text-base text-gray-900">{currentTrack.chorleiter || "-"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wiedergabesteuerung */}
          <div className="p-6 border-t border-gray-300">
            <div className="mb-4 slider-thumb-sm">
              <Slider
                value={[currentTime]}
                max={currentTrack.duration}
                step={1}
                onValueChange={(value) => {
                  if (audioRef.current && !audioError) {
                    audioRef.current.currentTime = value[0]
                    setCurrentTime(value[0])
                  }
                }}
                className={`w-full ${audioError ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={audioError}
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-8">
              <button onClick={handlePrevTrack} className="focus:outline-none">
                <SkipBack className="h-8 w-8 fill-current text-gray-800" />
              </button>

              {/* Wiedergabe/Pause-Taste mit fester Farbe und ausgegraut bei Fehlern */}
              <button
                onClick={togglePlayPause}
                className={`focus:outline-none ${audioError ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={audioError}
              >
                {isPlaying ? (
                  <Pause
                    className={`h-12 w-12 fill-current ${audioError ? "text-gray-400" : "text-[#b41f2a] hover:text-[#b41f2a]"}`}
                  />
                ) : (
                  <Play
                    className={`h-12 w-12 fill-current ${audioError ? "text-gray-400" : "text-[#b41f2a] hover:text-[#b41f2a]"}`}
                  />
                )}
              </button>

              <button onClick={handleNextTrack} className="focus:outline-none">
                <SkipForward className="h-8 w-8 fill-current text-gray-800" />
              </button>
            </div>

            <div className="flex items-center mt-6 slider-thumb-sm">
              <button onClick={toggleMute} className="focus:outline-none mr-3">
                {isMuted ? (
                  <VolumeX className="h-6 w-6 fill-current text-gray-800" />
                ) : (
                  <Volume2 className="h-6 w-6 fill-current text-gray-800" />
                )}
              </button>

              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => handleVolumeChange(value[0])}
                className="w-32"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
