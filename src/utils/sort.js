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
  if (a[prop] < b[prop]) {
    return -1
  }
  if (a[prop] > b[prop]) {
    return 1
  }
  return 0
}
