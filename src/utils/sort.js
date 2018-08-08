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
const getPropValue = (obj, prop) => {
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
