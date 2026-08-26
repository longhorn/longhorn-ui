// Parse a Go duration string (e.g. "2h30m", "8760h", "10m") into days + hours + minutes.
export const parseRetainAge = (str) => {
  if (!str) {
    return { days: 0, hours: 0, minutes: 0 }
  }
  const h = /(\d+)h/.exec(str)
  const m = /(\d+)m/.exec(str)
  const total = (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0)
  return { days: Math.floor(total / (60 * 24)), hours: Math.floor((total % (60 * 24)) / 60), minutes: total % 60 }
}

// Format a Go duration string into "XdXhXm" for display, dropping seconds.
export const formatRetainAge = (str) => {
  const { days, hours, minutes } = parseRetainAge(str)
  const parts = []
  if (days) {
    parts.push(`${days}d`)
  }
  if (hours) {
    parts.push(`${hours}h`)
  }
  if (minutes) {
    parts.push(`${minutes}m`)
  }
  return parts.length ? parts.join('') : '0m'
}
