// Datumstring (DD.MM.YYYY) in ein Date-Objekt für die Sortierung umwandeln
const parseGermanDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(0) // Leere Daten behandeln
  const year = Number.parseInt(dateStr)
  if (!isNaN(year)) {
    return new Date(year, 0, 1)
  }
  return new Date(0)
}

// Sortierfunktion für chronologische Reihenfolge
const sortByDate = (a: any, b: any): number => {
  const dateA = parseGermanDate(a.erschienen)
  const dateB = parseGermanDate(b.erschienen)
  return dateA.getTime() - dateB.getTime()
}

// Aktualisierte Audiodateien mit den bereitgestellten Daten - Feld 'dateiname' entfernt
export const DEFAULT_COVER_IMAGE = "/images/audio-placeholder.jpg";

export const audioFiles = [
  {
    id: 1,
    titel: "Viva la musica",
    werk: "Heitere Chormusik (und anderes)",
    komponist: "Unbekannt",
    wvzNummer: "",
    interpreten: "Stuttgarter Hymnus-Chorknaben",
    erschienen: "1955",
    chorleiter: "Gerhard Wilhelm",
    file: "/audio/01-Viva_la_musica--Heitere_Chormusik_(und_anderes)(1995).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 180,
  },
  {
    id: 2,
    titel: "Es ist ein Ros entsprungen",
    werk: "",
    komponist: "Michael Praetorius, Bearb. v. G. Wilhelm",
    wvzNummer: "",
    interpreten: "Stuttgarter Hymnus-Chorknaben",
    erschienen: "1955",
    chorleiter: "Gerhard Wilhelm",
    file: "/audio/02-Es_ist_ein_Ros_entsprungen_(1955).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 210,
  },
  {
    id: 3,
    titel: "Jauchzet, frohlocket, auf preiset die Tage",
    werk: "Weihnachtsoratorium",
    komponist: "Johann Sebastian Bach",
    wvzNummer: "BWV 248",
    interpreten: "Stuttgarter Hymnus-Chorknaben",
    erschienen: "1960",
    chorleiter: "Gerhard Wilhelm",
    file: "/audio/03-Weihnachtsoratorium--Jauchzet_frohlocket_(1960).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 195,
  },
  {
    id: 4,
    titel: "Requiem aeternam",
    werk: "Requiem",
    komponist: "Wolfgang Amadé Mozart",
    wvzNummer: "KV 626",
    interpreten: "Stuttgarter Hymnus-Chorknaben",
    erschienen: "1976",
    chorleiter: "Gerhard Wilhelm",
    file: "/audio/04-Requiem--Requiem_aeternam_(1976).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 240,
  },
  {
    id: 5,
    titel: "Lasset uns nun gehen",
    werk: "Weihnachtsoratorium",
    komponist: "Johann Sebastian Bach",
    wvzNummer: "BWV 248",
    interpreten: "Stuttgarter Hymnus-Chorknaben, Ensemble '76 Stuttgart",
    erschienen: "1983",
    chorleiter: "Gerhard Wilhelm",
    file: "/audio/05-Weihnachtsoratorium--Lasset_uns_nun_gehen_gen_Bethlehem_(1983).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 165,
  },
  {
    id: 6,
    titel: "Chorprobe mit Gerhard Wilhelm",
    werk: "",
    komponist: "",
    wvzNummer: "",
    interpreten: "Stuttgarter Hymnus-Chorknaben, Gerhard Wilhelm",
    erschienen: "",
    chorleiter: "Gerhard Wilhelm",
    file: "/audio/06-Chorprobe_mit_Gerhard_Wilhelm.mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 175,
  },
  {
    id: 7,
    titel: "Herr, unser Herrscher",
    werk: "Johannes-Passion",
    komponist: "Johann Sebastian Bach",
    wvzNummer: "BWV 245",
    interpreten: "Stuttgarter Hymnus-Chorknaben, Collegium Instrumentale Stuttgart",
    erschienen: "1990",
    chorleiter: "Eckard Weyand",
    file: "/audio/07-Johannes-Passion--Herr_unser_Herrscher_(1990).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 220,
  },
  {
    id: 8,
    titel: "Ach Herr, lass dein lieb Engelein",
    werk: "Johannes-Passion",
    komponist: "Johann Sebastian Bach",
    wvzNummer: "BWV 245",
    interpreten: "Stuttgarter Hymnus-Chorknaben, Collegium Instrumentale Stuttgart",
    erschienen: "1990",
    chorleiter: "Eckard Weyand",
    file: "/audio/08_Johannes-Passion--Ach_Herr_lass_dein_lieb_Engelein_(1990).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 190,
  },
  {
    id: 9,
    titel: "Hallelujah",
    werk: "The Messiah",
    komponist: "Georg Friedrich Händel",
    wvzNummer: "HWV 56",
    interpreten: "Stuttgarter Hymnus-Chorknaben, Junges Kammerorchester Stuttgart",
    erschienen: "2001",
    chorleiter: "Hanns-Friedrich Kunz",
    file: "/audio/09-The_Messiah--Halleluja_(2001).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 205,
  },
  {
    id: 10,
    titel: "Lacrimosa",
    werk: "Requiem",
    komponist: "Wolfgang Amadé Mozart",
    wvzNummer: "KV 626",
    interpreten: 'Stuttgarter Hymnus-Chorknaben, Ensemble „musica viva Stuttgart"',
    erschienen: "2005",
    chorleiter: "Hanns-Friedrich Kunz",
    file: "/audio/10-Requiem--Lacrimosa_(2005).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 185,
  },
  {
    id: 11,
    titel: "Herr, unser Herrscher",
    werk: "Johannes-Passion",
    komponist: "Johann Sebastian Bach",
    wvzNummer: "BWV 245",
    interpreten: "Stuttgarter Hymnus-Chorknaben, Handel's Company",
    erschienen: "2017",
    chorleiter: "Rainer Johannes Homburg",
    file: "/audio/11-Johannes-Passion--Herr_unser_Herrscher_(2017).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 210,
  },
  {
    id: 12,
    titel: "Vater unser",
    werk: "Vater unser",
    komponist: "Arthur Heyme",
    wvzNummer: "",
    interpreten: "Stuttgarter Hymnus-Chorknaben",
    erschienen: "2018",
    chorleiter: "Rainer Johannes Homburg",
    file: "/audio/12-Vater_unser_(2018).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 195,
  },
  {
    id: 13,
    titel: "Credo",
    werk: "Deutsche Messe",
    komponist: "Moritz Eggert",
    wvzNummer: "",
    interpreten: "Stuttgarter Hymnus-Chorknaben",
    erschienen: "2019",
    chorleiter: "Rainer Johannes Homburg",
    file: "/audio/13-Deutsche_Messe--Credo_(2019).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 180,
  },
  {
    id: 14,
    titel: "Jauchzet dem Herren, alle Welt (Psalm 100)",
    werk: "Psalmen Davids",
    komponist: "Heinrich Schütz",
    wvzNummer: "SWV 36",
    interpreten: "Stuttgarter Hymnus-Chorknaben",
    erschienen: "2019",
    chorleiter: "Rainer Johannes Homburg",
    file: "/audio/14-Psalmen Davids--Jauchzet_dem_Herren_alle_Welt_(2019).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 210,
  },
  {
    id: 15,
    titel: "Jauchzet, frohlocket, auf preiset die Tage",
    werk: "Weihnachtsoratorium",
    komponist: "Johann Sebastian Bach",
    wvzNummer: "BWV 248",
    interpreten: "Stuttgarter Hymnus-Chorknaben, Handel's Company, Trompetenensemble Wolfgang Bauer",
    erschienen: "2020",
    chorleiter: "Rainer Johannes Homburg",
    file: "/audio/15-Weihnachtsoratorium--Jauchzet_frohlocket_(2020).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 195,
  },
  {
    id: 16,
    titel: "Lasset uns nun gehen",
    werk: "Weihnachtsoratorium",
    komponist: "Johann Sebastian Bach",
    wvzNummer: "BWV 248",
    interpreten: "Stuttgarter Hymnus-Chorknaben, Handel's Company",
    erschienen: "2020",
    chorleiter: "Rainer Johannes Homburg",
    file: "/audio/16-Weihnachtsoratorium--Lasset_uns_nun_gehen_gen_Bethlehem_(2020).mp3",
    coverImage: DEFAULT_COVER_IMAGE,
    duration: 220,
  },
].sort(sortByDate)

/**
 * Alle Audiodateipfade aus dem Array der Audiodateien abrufen
 * @returns Ein Array aller Audiodateipfade
 */
export function getAllAudioPaths(): string[] {
  return audioFiles.map(audio => audio.file);
}

// Hilfsfunktion zum Abrufen des Coverbildes mit Fallback
export function getCoverImage(track: typeof audioFiles[0]): string {
  return track.coverImage || DEFAULT_COVER_IMAGE;
}
