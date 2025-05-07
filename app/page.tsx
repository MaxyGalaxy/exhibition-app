"use client"

import { useState, useEffect } from "react"
import StartScreen from "@/components/start-screen"
import LoadingScreen from "@/components/loading-screen"
import { AudioPlayer } from "@/components/audio-player"
import { AudioProvider } from "@/contexts/audio-context"
import { getAllAudioPaths } from "@/data/audio-files"
import { ActivityProvider } from "@/contexts/activity-context"
import { InactivityWarning } from "@/components/inactivity-warning"
import { useActivity } from "@/contexts/activity-context"

// Zeitplan für Bildschirm Ein/Aus - Format: [Stunde, Minute]
const SCREEN_SCHEDULE = {
  turnOff: [23, 0],  // 23:00 Uhr ausschalten
  turnOn: [9, 0]     // 9:00 Uhr einschalten
};

// Temporär reduzierte Werte für Testzwecke
const ACTIVITY_CONFIG = {
  warningTime: 300 * 1000,       // Erste Warnung nach 10 Sekunden
  resetTime: 600 * 1000,         // Zurücksetzen nach 20 Sekunden
  finalWarningTime: 10 * 1000,   // Letzte Warnung 5 Sekunden vor Zurücksetzen
  audioPlaybackMultiplier: 3,   // 3x länger wenn Audio abgespielt wird
};

function ExhibitionAppContent() {
  const [appState, setAppState] = useState<"loading" | "start" | "player">("loading")
  const [isDisplayOn, setIsDisplayOn] = useState(true)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [manualOverride, setManualOverride] = useState(false)
  
  const { 
    activityState, 
    timeRemaining, 
    resetTime, 
    resetTimer,
    enableActivityTracking,
    disableActivityTracking
  } = useActivity();

  // Aktivitätsverfolgung je nach aktuellem Bildschirm aktivieren/deaktivieren
  useEffect(() => {
    if (appState === "player") {
      enableActivityTracking();
      console.log("Aktivitätsverfolgung für Player-Screen aktiviert");
    } else {
      disableActivityTracking();
      console.log("Aktivitätsverfolgung für", appState, "Screen deaktiviert");
    }
  }, [appState, enableActivityTracking, disableActivityTracking]);

  // App bei Inaktivität zum Startbildschirm zurücksetzen
  useEffect(() => {
    if (activityState === 'inactive' && appState === 'player') {
      console.log("Zurücksetzen zum Startbildschirm wegen Inaktivität");
      setAppState('start');
      resetTimer();
    }
  }, [activityState, appState, resetTimer]);

  // Zeitplan für Bildschirm Ein/Aus überwachen
  useEffect(() => {
    const checkScreenSchedule = () => {
      if (manualOverride) return; // Manuellen Override respektieren
      
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const offTime = SCREEN_SCHEDULE.turnOff;
      const onTime = SCREEN_SCHEDULE.turnOn;
      
      // Prüfen, ob aktuelle Zeit im Ausschalt-Zeitfenster liegt
      if ((currentHour > offTime[0] || (currentHour === offTime[0] && currentMinute >= offTime[1])) || 
          (currentHour < onTime[0] || (currentHour === onTime[0] && currentMinute < onTime[1]))) {
        setIsDisplayOn(false);
      } else {
        setIsDisplayOn(true);
      }
    };
    
    // Initial prüfen und dann jede Minute aktualisieren
    checkScreenSchedule();
    const interval = setInterval(checkScreenSchedule, 60000); // Jede Minute prüfen
    
    return () => clearInterval(interval);
  }, [manualOverride]);

  // Ladebildschirm-Abschluss behandeln
  const handleLoadingComplete = () => {
    setShowLoadingScreen(false)
    setAppState("start")
  }

  // Fortsetzen-Schaltfläche im Warnungsdialog behandeln
  const handleContinue = () => {
    console.log("Benutzer hat auf Fortsetzen geklickt - Timer wird zurückgesetzt");
    resetTimer();
    
    // Wichtig: Stellen Sie sicher, dass der richtige Statusübergang erfolgt,
    // damit der Dialog verschwindet
    if (activityState !== 'active') {
      enableActivityTracking();  // Tracking erneut aktivieren
    }
  }

  // Klick auf schwarzen Bildschirm behandeln
  const handleBlackScreenClick = () => {
    if (!isDisplayOn) {
      setIsDisplayOn(true);
      setManualOverride(true);
      
      // Manuellen Override beim nächsten geplanten Wechsel zurücksetzen
      const now = new Date();
      const currentHour = now.getHours();
      
      const nextCheckTime = new Date();
      if (currentHour >= SCREEN_SCHEDULE.turnOff[0]) {
        // Falls nach Ausschaltzeit, bis zur nächsten Einschaltzeit überschreiben
        nextCheckTime.setHours(SCREEN_SCHEDULE.turnOn[0]);
        nextCheckTime.setMinutes(SCREEN_SCHEDULE.turnOn[1]);
        if (nextCheckTime < now) {
          nextCheckTime.setDate(nextCheckTime.getDate() + 1);
        }
      } else {
        // Falls vor Ausschaltzeit, bis zur nächsten Ausschaltzeit überschreiben
        nextCheckTime.setHours(SCREEN_SCHEDULE.turnOff[0]);
        nextCheckTime.setMinutes(SCREEN_SCHEDULE.turnOff[1]);
      }
      
      const timeUntilNextCheck = nextCheckTime.getTime() - now.getTime();
      setTimeout(() => setManualOverride(false), timeUntilNextCheck);
    }
  };

  // Display-Ein/Aus-Stile anwenden
  const displayStyle = isDisplayOn ? {} : { opacity: 0, pointerEvents: "none" as const }

  return (
    <>
      {!isDisplayOn && (
        <div 
          className="h-screen w-screen bg-black absolute top-0 left-0 z-50 cursor-pointer"
          onClick={handleBlackScreenClick}
        />
      )}
      <main
        className="h-screen w-screen bg-white text-black overflow-hidden touch-manipulation"
        style={displayStyle}
      >
        {showLoadingScreen ? (
          <LoadingScreen onClose={handleLoadingComplete} />
        ) : appState === "start" ? (
          <StartScreen onStart={() => setAppState("player")} />
        ) : (
          <AudioPlayer onReset={() => setAppState("start")} />
        )}

        <InactivityWarning
          activityState={activityState}
          timeRemaining={timeRemaining}
          resetTime={resetTime}
          onContinue={handleContinue}
          currentScreen={appState}
        />

      </main>
    </>
  )
}

export default function ExhibitionApp() {
  return (
    <AudioProvider audioFiles={getAllAudioPaths()}>
      <ActivityProvider config={ACTIVITY_CONFIG}>
        <ExhibitionAppContent />
      </ActivityProvider>
    </AudioProvider>
  )
}
