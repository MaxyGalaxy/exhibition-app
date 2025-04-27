"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ActivityDetection, ActivityState, ActivityConfig, DEFAULT_ACTIVITY_CONFIG } from "@/utils/activity-detection";

type ActivityContextType = {
  activityState: ActivityState;
  timeRemaining: number;
  resetTime: number;
  resetTimer: () => void;
  enableActivityTracking: () => void;
  disableActivityTracking: () => void;
  pauseActivityTracking: () => void;  // Neue Funktion zum Pausieren
  resumeActivityTracking: () => void; // Neue Funktion zum Fortsetzen
  setAudioPlaying: (isPlaying: boolean) => void;
};

const ActivityContext = createContext<ActivityContextType | null>(null);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity muss innerhalb eines ActivityProviders verwendet werden");
  }
  return context;
};

export const ActivityProvider: React.FC<{
  children: React.ReactNode;
  config?: Partial<ActivityConfig>;
}> = ({ children, config }) => {
  // ActivityDetection-Instanz erstellen
  const [activityDetection] = useState(() => new ActivityDetection(config));
  const [activityState, setActivityState] = useState<ActivityState>(ActivityState.ACTIVE);
  const [timeRemaining, setTimeRemaining] = useState<number>(activityDetection.getTotalTimeout());
  const [isPaused, setIsPaused] = useState<boolean>(false);  // Neuer Status für Pausierung

  // Aktivitätstimer zurücksetzen (verbesserte Version)
  const resetTimer = useCallback(() => {
    activityDetection.resetTimer();
    
    // Sofort den Status auf "aktiv" setzen, um reaktionsschneller zu sein
    setActivityState(ActivityState.ACTIVE);
    setTimeRemaining(activityDetection.getTotalTimeout());
    
    console.log("Aktivitätstimer zurückgesetzt - Status auf 'aktiv' gesetzt");
  }, [activityDetection]);

  // Aktivitätsverfolgung aktivieren
  const enableActivityTracking = useCallback(() => {
    activityDetection.enable();
    activityDetection.startTracking();
    setIsPaused(false);
  }, [activityDetection]);

  // Aktivitätsverfolgung deaktivieren
  const disableActivityTracking = useCallback(() => {
    activityDetection.disable();
    activityDetection.stopTracking();
    setActivityState(ActivityState.ACTIVE);
    setIsPaused(false);
  }, [activityDetection]);
  
  // Aktivitätsverfolgung pausieren (für Dialog)
  const pauseActivityTracking = useCallback(() => {
    setIsPaused(true);
    if (process.env.NODE_ENV === 'development') {
      console.log("Aktivitätsverfolgung pausiert (Dialog offen)");
    }
  }, []);
  
  // Aktivitätsverfolgung fortsetzen
  const resumeActivityTracking = useCallback(() => {
    setIsPaused(false);
    resetTimer(); // Timer zurücksetzen, wenn die Verfolgung fortgesetzt wird
    if (process.env.NODE_ENV === 'development') {
      console.log("Aktivitätsverfolgung fortgesetzt (Dialog geschlossen)");
    }
  }, [resetTimer]);

  // Audiostatus setzen
  const setAudioPlaying = useCallback((isPlaying: boolean) => {
    activityDetection.setAudioPlayback(isPlaying);
  }, [activityDetection]);

  // Aktivitätsstatus und verbleibende Zeit regelmäßig aktualisieren
  useEffect(() => {
    const checkActivity = () => {
      if (!isPaused) {  // Prüfung nur durchführen, wenn nicht pausiert
        const currentState = activityDetection.getActivityState();
        setActivityState(currentState);
        setTimeRemaining(activityDetection.getTimeUntilReset());
      }
    };

    // Initial prüfen und dann alle 500ms aktualisieren
    checkActivity();
    const interval = setInterval(checkActivity, 500);

    return () => {
      clearInterval(interval);
    };
  }, [activityDetection, isPaused]);

  // Aktivitätsverfolgung beim Entladen bereinigen
  useEffect(() => {
    return () => {
      activityDetection.stopTracking();
    };
  }, [activityDetection]);

  const contextValue = {
    activityState,
    timeRemaining,
    resetTimer,
    resetTime: activityDetection.getTotalTimeout(),
    enableActivityTracking,
    disableActivityTracking,
    pauseActivityTracking,    // Neue Funktion exportieren
    resumeActivityTracking,   // Neue Funktion exportieren
    setAudioPlaying
  };

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
};