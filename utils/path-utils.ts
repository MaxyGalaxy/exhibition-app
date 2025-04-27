/**
 * Helper to get asset paths that work in both development and GitHub Pages
 */
export function getAssetPath(path: string): string {
  // For GitHub Pages, we need the repository name in the path
  const basePath = process.env.NODE_ENV === 'production' ? '/exhibition-app' : '';
  return `${basePath}${path}`;
}