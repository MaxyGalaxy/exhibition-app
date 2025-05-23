"use client"

import { Play } from "lucide-react"
import { getAssetPath } from "@/utils/path-utils"

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  // Use the getAssetPath utility to ensure the path works in all environments
  const backgroundImagePath = getAssetPath("/images/start-img.jpg")
  
  return (
    <div
      className="h-full w-full relative"
      style={{
        backgroundImage: `url('${backgroundImagePath}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay to ensure text is readable */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content container with absolute positioning for perfect centering */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center px-4 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">Der HYMNUS in Tönen</h1>
          <p className="text-xl text-gray-300 mb-12">Verfolge wie sich die Klangwelt des HYMNUS über die Jahre entwickelt hat</p>

          <div className="flex justify-center">
            <button
              onClick={onStart}
              className="bg-white text-black hover:bg-gray-200 w-48 h-20 flex items-center justify-center rounded-md focus:outline-none"
            >
              <Play className="w-6 h-6 fill-black mr-2" />
              <span className="text-lg font-medium whitespace-nowrap">Jetzt reinhören</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
