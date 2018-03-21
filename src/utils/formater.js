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
