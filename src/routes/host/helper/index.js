export function formatPath(p = '') {
  const path = p.trim()
  if (path.endsWith('/')) {
    return path
  }
  return `${path}/`
}
