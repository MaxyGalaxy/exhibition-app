/**
 * Hilfsfunktionen zum Verwalten von Asset-Pfaden in verschiedenen Umgebungen
 */

// Ermittelt den Basispfad je nach Umgebung
export function getBasePath(): string {
  // In der Client-Komponente
  if (typeof window !== 'undefined') {
    // Wenn die App in einem Unterverzeichnis bereitgestellt wird (z.B. GitHub Pages)
    // Extrahiere den Basispfad aus der aktuellen URL
    const pathSegments = window.location.pathname.split('/');
    if (pathSegments.length > 1) {
      // Repository-Name ist normalerweise das erste Segment nach dem Root
      const repoName = pathSegments[1];
      if (repoName && repoName !== '') {
        return `/${repoName}`;
      }
    }
  }
  
  // In Entwicklungsumgebung oder bei Root-Deployment
  return '';
}

// Erstellt einen vollständigen Pfad zu einem Asset
export function getAssetPath(path: string): string {
  const basePath = getBasePath();
  
  // Stellt sicher, dass der Pfad mit einem Schrägstrich beginnt
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}