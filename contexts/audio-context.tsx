"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the shape of our context
type AudioContextType = {
  checkedFiles: Record<string, boolean>
  isLoading: boolean
  loadingComplete: boolean
  setLoadingComplete: (complete: boolean) => void
  unavailableFiles: string[]
  availableFiles: string[]
}

// Create the context with default values
const AudioContext = createContext<AudioContextType>({
  checkedFiles: {},
  isLoading: true,
  loadingComplete: false,
  setLoadingComplete: () => {},
  unavailableFiles: [],
  availableFiles: [],
})

// Hook to use the audio context
export const useAudio = () => useContext(AudioContext)

// Function to check if an audio file exists and is playable
const checkAudioFile = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // First check if we already have a result in localStorage
    const cachedResult = localStorage.getItem(`audio-file-${src}`)
    if (cachedResult) {
      resolve(cachedResult === "true")
      return
    }

    // Otherwise, try to load the audio file
    const audio = new Audio()

    // Set up event listeners
    audio.addEventListener("canplaythrough", () => {
      localStorage.setItem(`audio-file-${src}`, "true")
      resolve(true)
    })

    audio.addEventListener("error", () => {
      localStorage.setItem(`audio-file-${src}`, "false")
      resolve(false)
    })

    // Set the source and load
    audio.src = src
    audio.load()

    // Set a timeout in case the file takes too long to load
    setTimeout(() => {
      localStorage.setItem(`audio-file-${src}`, "false")
      resolve(false)
    }, 3000)
  })
}

// Provider component
export const AudioProvider = ({ children, audioFiles }: { children: ReactNode; audioFiles: string[] }) => {
  const [checkedFiles, setCheckedFiles] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [unavailableFiles, setUnavailableFiles] = useState<string[]>([])
  const [availableFiles, setAvailableFiles] = useState<string[]>([])

  // Check all audio files when the provider mounts
  useEffect(() => {
    const checkAllFiles = async () => {
      // Clear localStorage to ensure fresh checks
      audioFiles.forEach((file) => {
        localStorage.removeItem(`audio-file-${file}`)
      })

      const results: Record<string, boolean> = {}
      const available: string[] = []
      const unavailable: string[] = []

      // Create an array of promises to check all files
      const checkPromises = audioFiles.map(async (file) => {
        const isPlayable = await checkAudioFile(file)
        results[file] = isPlayable

        if (isPlayable) {
          available.push(file)
        } else {
          unavailable.push(file)
        }
      })

      // Wait for all checks to complete
      await Promise.all(checkPromises)

      // Update state with all results at once
      setCheckedFiles(results)
      setAvailableFiles(available)
      setUnavailableFiles(unavailable)
      setIsLoading(false)
    }

    checkAllFiles()
  }, [audioFiles])

  return (
    <AudioContext.Provider
      value={{
        checkedFiles,
        isLoading,
        loadingComplete,
        setLoadingComplete,
        unavailableFiles,
        availableFiles,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}
