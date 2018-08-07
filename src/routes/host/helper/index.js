export function formatPath(p = '') {
  const path = p.trim().replace(/(\/)+/g, '/')
  if (path.endsWith('/')) {
    return path
  }
  return `${path}/`
}
