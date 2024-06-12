// get the available backup targets
export function getAvailableBackupTargets(backupTarget) {
  if (!backupTarget || !backupTarget.data || backupTarget.data.length === 0) {
    return []
  }
  return backupTarget.data.filter((item) => item.available)
}
