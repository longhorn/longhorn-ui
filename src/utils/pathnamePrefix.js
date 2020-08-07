export function getPrefix({ suffixSlash = true } = {}) {
  let p = window.__pathname_prefix__ // eslint-disable-line
  if (!suffixSlash && p && p.endsWith('/')) {
    p = p.substr(0, p.length - 1)
  }
  return p.replace(/\/{2,}/g, '/')
}
