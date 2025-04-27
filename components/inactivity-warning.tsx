"use client"

import { useEffect, useState } from "react";
import { ActivityState } from "@/utils/activity-detection";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface InactivityWarningProps {
  activityState: ActivityState;
  timeRemaining: number;
  resetTime: number;
  onContinue: () => void;
  currentScreen: "loading" | "start" | "player";
}

export function InactivityWarning({
  activityState,
  timeRemaining,
  resetTime,
  onContinue,
  currentScreen
}: InactivityWarningProps) {
  // Dialog nur öffnen, wenn wir im Player sind und eine Warnung vorliegt
  const isWarningActive = activityState === ActivityState.WARNING || activityState === ActivityState.FINAL_WARNING;
  const isOpen = currentScreen === "player" && isWarningActive;
  
  // Bestimmen, ob finale Warnung angezeigt werden soll
  const isFinal = activityState === ActivityState.FINAL_WARNING;
  
  // Progress-Wert basierend auf verbleibender Zeit
  const [progress, setProgress] = useState(100);
  
  // Fortschrittsbalken aktualisieren
  useEffect(() => {
    if (isOpen) {
      const percentage = (timeRemaining / resetTime) * 100;
      setProgress(Math.max(0, Math.min(100, percentage)));
    }
  }, [isOpen, timeRemaining, resetTime]);
  
  // Debug-Log für Statusänderungen
  useEffect(() => {
    console.log(`Inaktivitätswarnung: ${isOpen ? "Geöffnet" : "Geschlossen"}, Zustand: ${activityState}, Zeit: ${Math.round(timeRemaining/1000)}s`);
  }, [isOpen, activityState, timeRemaining]);

  // Verbleibende Zeit in Sekunden
  const remainingSeconds = Math.ceil(timeRemaining / 1000);
  
  // Manueller Handler für den Fortsetzen-Button
  const handleContinueClick = () => {
    console.log("Fortsetzen-Button geklickt");
    onContinue();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            {isFinal 
              ? "Letzte Warnung - Inaktivität festgestellt" 
              : "Inaktivität festgestellt"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {isFinal 
              ? `Die Anwendung wird in ${remainingSeconds} Sekunden zum Startbildschirm zurückkehren.` 
              : "Möchten Sie fortfahren? Bei weiterer Inaktivität wird die Anwendung zum Startbildschirm zurückkehren."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <Progress 
          value={progress} 
          className={`h-2 mt-4 ${isFinal ? 'bg-red-100' : 'bg-amber-100'}`} 
          indicatorColor={isFinal ? 'bg-red-500' : 'bg-amber-500'}
        />
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleContinueClick}
            className={`w-full ${isFinal ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'} text-white`}
          >
            Fortsetzen
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}