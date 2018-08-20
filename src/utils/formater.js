function formatSi(val, increment = 1024) {
  const units = ['Bi', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi']
  val = Number(val)
  let exp = 0
  while (val >= increment && exp + 1 < units.length) {
    val /= increment
    exp += 1
  }

  let out = ''
  if (val < 10 && exp > 0) {
    out = Math.round(val * 100) / 100
  } else if (val < 100 && exp > 0) {
    out = Math.round(val * 10) / 10
  } else {
    out = Math.round(val)
  }

  return `${out} ${units[exp]}`
}

export function formatMib(...args) {
  return formatSi(...args)
}

export function utcStrToDate(utcStr) {
  const reg = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) \+\d{4} UTC$/
  const results = utcStr.match(reg)
  if (results && results.length === 3) {
    const d = results[1].split('-').map(item => parseInt(item, 10))
    const t = results[2].split(':').map(item => parseInt(item, 10))
    return new Date(Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1], t[2]))
  }
  return 'Invalid UTC Date'
}

export function isoStrToDate(isoStr) {
  const reg = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})([.]\d{3})?Z$/
  const results = isoStr.match(reg)
  if (results && results.length === 4) {
    const d = results[1].split('-').map(item => parseInt(item, 10))
    const t = results[2].split(':').map(item => parseInt(item, 10))
    return new Date(Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1], t[2]))
  }
  return 'Invalid ISO Date'
}
