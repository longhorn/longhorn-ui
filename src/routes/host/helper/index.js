export function formatPath(p = '') {
  const path = p.trim().replace(/(\/)+/g, '/')
  if (path.endsWith('/')) {
    return path
  }
  return `${path}/`
}

export function byteToGi(value) {
  const val = Number(value)
  return Math.round((val / (1024 * 1024 * 1024)) * 100) / 100
}

export function giToByte(value) {
  const val = Number(value)
  return Math.round(val * 1024 * 1024 * 1024)
}

export function getStorageProgressStatus(minimalSchedulingQuotaWarning, percent) {
  if (percent > 100) {
    return 'exception'
  }
  if (percent >= minimalSchedulingQuotaWarning) {
    return 'active'
  }
  return 'success'
}
