export const imageUrl = (path: string | null | undefined) => {
  if (!path || typeof path !== 'string') return ''

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path
  }

  const rawBase = import.meta.env.VITE_API_BASE_URL
  const baseUrl =
    rawBase && String(rawBase).trim() !== '' ? String(rawBase).replace(/\/+$/, '') : ''

  // If we don't have a base URL, fall back to relative path as-is.
  if (!baseUrl) return path

  const rel = path.replace(/^\/+/, '')
  return `${baseUrl}/${rel}`
}