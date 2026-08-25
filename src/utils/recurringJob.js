// Parse a Go duration string (e.g. "2h30m", "8760h", "10m") into hours + minutes.
export const parseRetainAge = (str) => {
  if (!str) {
    return { hours: 0, minutes: 0 }
  }
  const h = /(\d+)h/.exec(str)
  const m = /(\d+)m/.exec(str)
  const total = (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0)
  return { hours: Math.floor(total / 60), minutes: total % 60 }
}
