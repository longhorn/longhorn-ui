function formatSi(inValue, increment = 1000, suffix = '', firstSuffix = null) {
  const units = ['B', 'K', 'M', 'G', 'T', 'P']
  let val = inValue
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

  if (exp === 0 && firstSuffix) {
    out += ` ${firstSuffix}`
  } else {
    out += ` ${units[exp]}${suffix}`
  }

  return out
}

export function formatMib(value) {
  return formatSi(value, 1024, 'B', 'B')
}
