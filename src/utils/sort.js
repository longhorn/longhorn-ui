const getStateWeight = (state) => {
  switch (state) {
    case 'healthy':
      return 0
    case 'created':
      return 1
    case 'degraded':
      return 2
    case 'faulted':
      return 3
    case 'detached':
      return 4
    default:
      return 99
  }
}
export const getPropValue = (obj, prop) => {
  const props = prop.split('.')
  if (props.length > 1) {
    let value = obj
    for (let i = 0; i < props.length; i++) {
      value = value[props[i]]
      if (value === undefined) {
        break
      }
    }
    return value
  }
  return obj[prop]
}
const isoStrToDate = (isoStr) => {
  const reg = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})Z$/
  const results = isoStr.match(reg)
  if (results && results.length === 3) {
    const d = results[1].split('-').map(item => parseInt(item, 10))
    const t = results[2].split(':').map(item => parseInt(item, 10))
    return new Date(Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1], t[2]))
  }
  return 'Invalid ISO Date'
}
export function sortVolume(dataSource) {
  dataSource.sort((a, b) => {
    const status = getStateWeight(a.state) - getStateWeight(b.state)
    if (status === 0) {
      return new Date(b.created).getTime() - new Date(a.created).getTime()
    }
    return status
  })
}

export function sortVolumeByName(dataSource) {
  dataSource.sort((a, b) => a.name.localeCompare(b.name))
}

export function sortVolumeBackups(dataSource) {
  dataSource.sort((a, b) => {
    return new Date(b.created).getTime() - new Date(a.created).getTime()
  })
}

export function sortTable(a, b, prop) {
  const valueA = getPropValue(a, prop)
  const valueB = getPropValue(b, prop)
  if (valueA < valueB) {
    return -1
  }
  if (valueA > valueB) {
    return 1
  }
  return 0
}

export function sortTableByISODate(a, b, prop) {
  const valueA = isoStrToDate(getPropValue(a, prop))
  const valueB = isoStrToDate(getPropValue(b, prop))
  if (valueA < valueB) {
    return -1
  }
  if (valueA > valueB) {
    return 1
  }
  return 0
}
