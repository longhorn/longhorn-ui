// get all backup targets
export function getBackupTargets(backupTarget) {
  if (!backupTarget || !backupTarget.data || backupTarget.data.length === 0) {
    return []
  }
  return backupTarget.data
}

// get the available backup targets
export function getAvailableBackupTargets(backupTarget) {
  return getBackupTargets(backupTarget).filter((item) => item.available)
}
