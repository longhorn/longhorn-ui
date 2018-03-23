export function getPrefix({ suffixSlash = true } = {}) {
  let p = window.__pathname_prefix__ // eslint-disable-line
  if (!suffixSlash && p && p.endsWith('/')) {
    p = p.substr(0, p.length - 1)
  }
  return p.replace(/\/{2,}/g, '/')
}

export function addPrefix(path) {
  const prefix = getPrefix()
  if (!prefix) {
    return path
  }

  const p = `${prefix}${path}`

  // remove duplicated slashs
  return p.replace(/\/{2,}/g, '/')
}
