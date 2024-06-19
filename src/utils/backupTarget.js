// get the available and writable backup targets
export function getAvailBackupTargets(backupTarget) {
  if (!backupTarget || !backupTarget.data || !backupTarget.data.length) {
    return []
  }
  return backupTarget.data.filter((item) => item.available && !item.readOnly)
}

// return true if there are available and writable backup targets
export function hasWritableBackupTargets(backupTarget) {
  return getAvailBackupTargets(backupTarget).length > 0
}
