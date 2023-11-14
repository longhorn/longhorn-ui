// See https://docs.aws.amazon.com/IAM/latest/APIReference/API_AccessKey.html
export const generateRandomKey = (length = 16, allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_') => Array.from(window.crypto.getRandomValues(new Uint32Array(length)))
  .map((x) => allowedChars[x % allowedChars.length])
  .join('')

export const isObjectStoreEditable = (record) => !['unknown', 'terminating'].includes(record.state)

export const isObjectStoreAdministrable = (record) => ['running'].includes(record.state)

export const isObjectStoreDeletable = (record) => !['terminating'].includes(record.state)

export function bytesToGiB(value) {
  const val = Number(value)
  return Math.round(val / (1024 * 1024 * 1024))
}

export function getStorageStatus(percent) {
  if (percent > 100 || percent < 0) {
    return 'exception'
  }
  if (percent > 95) {
    return 'active'
  }
  return 'success'
}
