import { isoStrToDate, utcStrToDate } from './formatter'

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

const getActualSize = (volume) => {
  return volume && volume.controllers && volume.controllers[0] && volume.controllers[0].actualSize ? parseInt(volume.controllers[0].actualSize, 10) : 0
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

export function sortVolume(dataSource) {
  dataSource && dataSource.sort((a, b) => {
    const status = getStateWeight(a.state) - getStateWeight(b.state)
    if (status === 0) {
      return utcStrToDate(b.created).getTime() - utcStrToDate(a.created).getTime()
    }
    return status
  })
}

export function sortByCreatedTime(dataSource) {
  dataSource && dataSource.sort((a, b) => {
    return new Date(b.created).getTime() - new Date(a.created).getTime()
  })
}

export function sortBackups(dataSource) {
  dataSource && dataSource.sort((a, b) => {
    return new Date(b.created).getTime() - new Date(a.created).getTime()
  })
}

export function sortTable(a, b, prop) {
  const reg = /^\d+$/
  let valueA = getPropValue(a, prop)
  let valueB = getPropValue(b, prop)
  if (reg.test(valueA) && reg.test(valueB)) {
    valueA = parseInt(valueA, 10)
    valueB = parseInt(valueB, 10)
  }
  if (valueA < valueB) {
    return -1
  }
  if (valueA > valueB) {
    return 1
  }
  return 0
}

export function sortTableActualSize(a, b) {
  const valueA = getActualSize(a)
  const valueB = getActualSize(b)
  if (valueA < valueB) {
    return -1
  }
  if (valueA > valueB) {
    return 1
  }
  return 0
}

export function sortTableState(a, b) {
  let valueA = getPropValue(a, 'state')
  let valueB = getPropValue(b, 'state')
  if (valueA === 'attached' && valueB === 'attached') {
    valueA = getPropValue(a, 'robustness')
    valueB = getPropValue(b, 'robustness')
  }
  if (valueA < valueB) {
    return -1
  }
  if (valueA > valueB) {
    return 1
  }
  return 0
}

export function sortTableObject(a, b, prop, propin) {
  const valueA = getPropValue(a, prop)[propin]
  const valueB = getPropValue(b, prop)[propin]
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

export function sortTableByUTCDate(a, b, prop) {
  const valueA = utcStrToDate(getPropValue(a, prop))
  const valueB = utcStrToDate(getPropValue(b, prop))
  if (valueA < valueB) {
    return -1
  }
  if (valueA > valueB) {
    return 1
  }
  return 0
}

export function sortTableByTimestamp(a, b, prop) {
  const timestampA = new Date(getPropValue(a, prop)).getTime()
  const timestampB = new Date(getPropValue(b, prop)).getTime()
  const valueA = isNaN(timestampA) ? 0 : timestampA
  const valueB = isNaN(timestampB) ? 0 : timestampB

  if (valueA < valueB) {
    return -1
  }
  if (valueA > valueB) {
    return 1
  }
  return 0
}

export function sortTableByPVC(a, b, prop) {
  const valueA = a[prop] && a[prop].pvStatus ? a[prop].pvcName : ''
  const valueB = b[prop] && b[prop].pvStatus ? b[prop].pvcName : ''

  if (valueA < valueB) {
    return -1
  }
  if (valueA > valueB) {
    return 1
  }
  return 0
}
