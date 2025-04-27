/**
 * Erweiterter Aktivitätserkennungsdienst
 * Verfolgt verschiedene Benutzerinteraktionen, um den Aktivitätsstatus der Anwendung zu bestimmen
 */

export enum ActivityState {
  ACTIVE = "active",
  WARNING = "warning",
  FINAL_WARNING = "finalWarning",
  INACTIVE = "inactive",
}

export type ActivityConfig = {
  /** Zeit in ms vor Anzeige der ersten Warnung */
  warningTime: number;
  /** Zeit in ms vor dem Zurücksetzen der App */
  resetTime: number;
  /** Zeit in ms vor Anzeige der zweiten Warnung */
  finalWarningTime: number;
  /** Liste der DOM-Ereignisse, die für Aktivität verfolgt werden */
  trackEvents?: string[];
  /** Multiplikator für Inaktivitätszeiten während der Audiowiedergabe */
  audioPlaybackMultiplier: number;
};

// Standardkonfiguration
export const DEFAULT_ACTIVITY_CONFIG: ActivityConfig = {
  warningTime: 45 * 1000,         // 45 Sekunden - erste Warnung
  finalWarningTime: 15 * 1000,    // 15 Sekunden vor Reset - letzte Warnung
  resetTime: 60 * 1000,           // 60 Sekunden - zurücksetzen
  trackEvents: [
    "click", 
    "touchstart", 
    "mousemove", 
    "keydown",
    "scroll",
    "mousedown",
    "touchmove"
  ],
  audioPlaybackMultiplier: 3,     // 3x länger wenn Audio abgespielt wird
};

export class ActivityDetection {
  public readonly config: ActivityConfig;
  private lastActivity: number;
  private eventListeners: (() => void)[] = [];
  private isAudioPlaying = false;
  private isTracking = true;
  private trackingEnabled = true;
  
  constructor(config: Partial<ActivityConfig> = {}) {
    // Standardwerte mit übergebenen Konfigurationswerten zusammenführen
    this.config = { 
      ...DEFAULT_ACTIVITY_CONFIG, 
      ...config,
      // Sicherstellen, dass trackEvents immer definiert ist
      trackEvents: config.trackEvents || DEFAULT_ACTIVITY_CONFIG.trackEvents
    };
    this.lastActivity = Date.now();
    
    // Debug-Ausgabe der Konfiguration
    if (process.env.NODE_ENV === 'development') {
      console.log('ActivityDetection initialisiert mit Konfiguration:', {
        warningTime: `${this.config.warningTime / 1000}s`,
        finalWarningTime: `${this.config.finalWarningTime / 1000}s`,
        resetTime: `${this.config.resetTime / 1000}s`,
        audioPlaybackMultiplier: this.config.audioPlaybackMultiplier
      });
    }
  }
  
  /**
   * Aktuellen Aktivitätsstatus basierend auf verstrichener Zeit und Audiowiedergabe abrufen
   */
  getActivityState(): ActivityState {
    // Immer aktiv zurückgeben, wenn Tracking deaktiviert ist
    if (!this.trackingEnabled) {
      return ActivityState.ACTIVE;
    }
    
    const elapsed = Date.now() - this.lastActivity;
    const multiplier = this.isAudioPlaying ? this.config.audioPlaybackMultiplier : 1;
    
    // Schwellenwerte mit angewendetem Multiplikator berechnen
    const warningThreshold = this.config.warningTime * multiplier;
    const finalWarningThreshold = (this.config.resetTime - this.config.finalWarningTime) * multiplier;
    const resetThreshold = this.config.resetTime * multiplier;
    
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) {
      console.log(`Aktivitätszustand: Vergangene Zeit ${Math.round(elapsed / 1000)}s, Schwellwerte: Warnung ${Math.round(warningThreshold / 1000)}s, Letzte Warnung ${Math.round(finalWarningThreshold / 1000)}s, Reset ${Math.round(resetThreshold / 1000)}s`);
    }
    
    // In absteigender Reihenfolge prüfen, um den korrekten Zustand zu erhalten
    if (elapsed >= resetThreshold) {
      return ActivityState.INACTIVE;
    }
    
    if (elapsed >= finalWarningThreshold) {
      return ActivityState.FINAL_WARNING;
    }
    
    if (elapsed >= warningThreshold) {
      return ActivityState.WARNING;
    }
    
    return ActivityState.ACTIVE;
  }
  
  /**
   * Audiowiedergabestatus setzen
   */
  setAudioPlayback(isPlaying: boolean): void {
    if (this.isAudioPlaying !== isPlaying) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Audio-Wiedergabestatus geändert: ${isPlaying ? 'aktiv' : 'inaktiv'}`);
      }
      this.isAudioPlaying = isPlaying;
    }
  }
  
  /**
   * Verbleibende Zeit in ms bis zum Zurücksetzen abrufen
   */
  getTimeUntilReset(): number {
    if (!this.trackingEnabled) {
      return this.config.resetTime;
    }
    
    const elapsed = Date.now() - this.lastActivity;
    const multiplier = this.isAudioPlaying ? this.config.audioPlaybackMultiplier : 1;
    return Math.max(0, this.config.resetTime * multiplier - elapsed);
  }
  
  /**
   * Gesamte Timeout-Zeit inklusive aller Multiplikatoren abrufen
   */
  getTotalTimeout(): number {
    const multiplier = this.isAudioPlaying ? this.config.audioPlaybackMultiplier : 1;
    return this.config.resetTime * multiplier;
  }
  
  /**
   * Aktivitätsverfolgung aktivieren
   */
  enable(): void {
    if (!this.trackingEnabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Aktivitätsverfolgung aktiviert');
      }
      this.trackingEnabled = true;
      this.resetTimer(); // Timer beim Aktivieren zurücksetzen
    }
  }
  
  /**
   * Aktivitätsverfolgung deaktivieren
   */
  disable(): void {
    if (this.trackingEnabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Aktivitätsverfolgung deaktiviert');
      }
      this.trackingEnabled = false;
    }
  }
  
  /**
   * Aktivitätstimer zurücksetzen
   */
  resetTimer(): void {
    this.lastActivity = Date.now();
    if (process.env.NODE_ENV === 'development') {
      console.log('Aktivitätstimer wurde zurückgesetzt');
    }
  }
  
  /**
   * Letzten Aktivitätszeitstempel aktualisieren
   */
  recordActivity(): void {
    if (this.isTracking && this.trackingEnabled) {
      this.lastActivity = Date.now();
    }
  }
  
  /**
   * Benutzeraktivitätsverfolgung starten
   */
  startTracking(): void {
    this.isTracking = true;
    
    // Initiale Aktivität aufzeichnen
    this.resetTimer();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Aktivitätsverfolgung gestartet');
    }
    
    // Handler für alle Ereignisse erstellen
    const activityHandler = (e: Event) => {
      if (this.isTracking && this.trackingEnabled) {
        this.lastActivity = Date.now();
        
        // Protokollierung für bestimmte Ereignisse zur Fehlersuche
        if (process.env.NODE_ENV === 'development') {
          if (e.type === 'mousemove') {
            // Mausbewegungen nur gelegentlich protokollieren
            if (Math.random() < 0.005) console.log('Aktivität: Mausbewegung');
          } else {
            console.log(`Aktivität aufgezeichnet: ${e.type}`);
          }
        }
      }
    };
    
    // Listener für alle konfigurierten Ereignisse registrieren
    this.config.trackEvents?.forEach(eventName => {
      document.addEventListener(eventName, activityHandler, { passive: true });
      
      // Bereinigungsfunktion für später speichern
      this.eventListeners.push(() => {
        document.removeEventListener(eventName, activityHandler);
      });
    });
  }
  
  /**
   * Verfolgung beenden und Event-Listener bereinigen
   */
  stopTracking(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Aktivitätsverfolgung beendet');
    }
    
    this.isTracking = false;
    
    // Alle Event-Listener entfernen
    this.eventListeners.forEach(removeListener => removeListener());
    this.eventListeners = [];
  }
}