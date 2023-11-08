// See https://docs.aws.amazon.com/IAM/latest/APIReference/API_AccessKey.html
export const generateRandomKey = (length = 16, allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_') => Array.from(window.crypto.getRandomValues(new Uint32Array(length)))
  .map((x) => allowedChars[x % allowedChars.length])
  .join('')

export const isObjectStoreEditable = (record) => !['unknown', 'terminating'].includes(record.state)

export const isObjectStoreAdministrable = (record) => ['running'].includes(record.state)

export const isObjectStoreDeletable = (record) => !['terminating'].includes(record.state)
