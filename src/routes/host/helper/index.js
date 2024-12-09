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

export const computeTotalAllocated = (record, storageOverProvisioningPercentage) => {
  const max = Object.values(record.disks).reduce((total, item) => total + item.storageMaximum, 0)
  const reserved = Object.values(record.disks).reduce((total, item) => total + item.storageReserved, 0)
  return ((max - reserved) * storageOverProvisioningPercentage) / 100
}

export const computeAllocated = (record) => {
  return Object.values(record.disks).reduce((total, item) => total + item.storageScheduled, 0)
}

export const computeTotalSize = (record, property) => {
  if (!record?.disks) return 0
  return Object.keys(record.disks).reduce((totalSize, key) => {
    const disk = record.disks[key]

    if (!disk) return totalSize
    if (disk[property]) {
      totalSize += Object.values(disk[property]).reduce((acc, size) => acc + size, 0)
    }
    return totalSize
  }, 0)
}

export const computeBackingImageAllocated = (record) => {
  return computeTotalSize(record, 'scheduledBackingImage')
}

export const computeReplicaAllocated = (record) => {
  return computeTotalSize(record, 'scheduledReplica')
}

export const computeUsagePercentage = (allocated, total) => {
  return total > 0 ? Math.round((allocated / total) * 100) : 0
}

export const computeTotalUsed = (record) => {
  return Object.values(record.disks).reduce((total, item) => total + item.storageMaximum, 0)
}

export const computeUsed = (record) => {
  return Object.values(record.disks).reduce((total, item) => total + (item.storageMaximum - item.storageAvailable), 0)
}

export const computeSize = (record) => {
  return Object.values(record.disks).reduce((total, item) => total + (item.storageMaximum - item.storageReserved), 0)
}

export const computeReserved = (record) => {
  return Object.values(record.disks).reduce((total, item) => total + item.storageReserved, 0)
}
