export function getAvailBackupTargets(backupTarget) {
  if (!backupTarget || !backupTarget.data || !backupTarget.data.length) {
    return []
  }
  return backupTarget.data.filter((item) => item.available && !item.readOnly)
}
