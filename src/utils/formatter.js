function formatSi(val, increment = 1024) {
  const units = ['Bi', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi']
  val = Number(val)
  let exp = 0
  while (val >= increment && exp + 1 < units.length) {
    val /= increment
    exp += 1
  }

  let out = ''
  if (val < 10 && exp > 0) {
    out = Math.round(val * 100) / 100
  } else if (val < 100 && exp > 0) {
    out = Math.round(val * 10) / 10
  } else {
    out = Math.round(val)
  }

  return `${out} ${units[exp]}`
}

export function formatMib(...args) {
  return formatSi(...args)
}

// Convert selected size Bi to Gi, return size in Gi
export function formatSize(selected, unit = 'Gi') {
  if (selected && selected.size) {
    const sizeMi = parseInt(selected.size, 10) / (1024 * 1024)
    return unit === 'Gi' ? Number((sizeMi / 1024).toFixed(2)) : parseInt(sizeMi, 10)
  }
  return 0
}

export function utcStrToDate(utcStr) {
  const reg = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) \+\d{4} UTC$/
  const results = utcStr.match(reg)
  if (results && results.length === 3) {
    const d = results[1].split('-').map(item => parseInt(item, 10))
    const t = results[2].split(':').map(item => parseInt(item, 10))
    return new Date(Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1], t[2]))
  }
  return 'Invalid UTC Date'
}

export function isoStrToDate(isoStr) {
  const reg = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})([.]\d{3})?Z$/
  const results = isoStr.match(reg)
  if (results && results.length === 4) {
    const d = results[1].split('-').map(item => parseInt(item, 10))
    const t = results[2].split(':').map(item => parseInt(item, 10))
    return new Date(Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1], t[2]))
  }
  return 'Invalid ISO Date'
}

export function formatSnapshot(selectVolume, snapshot) {
  let backupStatusList = selectVolume.backupStatus
  let backupStatusObject = null

  if (backupStatusList && backupStatusList.length > 0) {
    let backupStatusObjectList = backupStatusList.filter((item) => {
      return item.snapshot === snapshot.name
    })
    if (backupStatusObjectList && backupStatusObjectList.length > 0) {
      let total = 0
      let backupStatusErrorMsg = []
      backupStatusObjectList.forEach((ele) => {
        if (ele.error) {
          backupStatusErrorMsg.push({ replica: ele.replica, error: ele.error })
        }
        total += ele.progress
      })
      backupStatusObject = {}
      backupStatusObject.backupError = backupStatusErrorMsg
      backupStatusObject.progress = Math.floor(total / backupStatusObjectList.length)
      backupStatusObject.snapshot = snapshot.name
      backupStatusObject.replicas = backupStatusObjectList.filter(item => item.replica).map(item => item.replica).join(', ')
      backupStatusObject.backupIds = backupStatusObjectList.filter(item => item.id).map(item => item.id).join(',')
      // Backup Size
      backupStatusObject.size = backupStatusObjectList[0] && backupStatusObjectList[0].size ? backupStatusObjectList[0].size : '0'
    }
  }

  return {
    ...snapshot,
    backupStatusObject,
  }
}

export function formatSystemBackupData(state, systemBackupsData, systemRestoresData) {
  systemRestoresData = systemRestoresData.map((restore) => {
    restore.version = ''
    let systemBackup = systemBackupsData.find((backup) => restore.systemBackup === backup.id)
    if (systemBackup) restore.version = systemBackup.version

    return restore
  })
  const systemBackupsField = state.systemBackupsField
  const systemBackupsValue = state.systemBackupsValue
  const systemRestoresField = state.systemRestoresField
  const systemRestoresValue = state.systemRestoresValue
  if (systemBackupsField && systemBackupsValue) {
    systemBackupsData = systemBackupsData.filter((item) => item[systemBackupsField] === systemBackupsValue)
  }
  if (systemRestoresField && systemRestoresValue) {
    systemRestoresData = systemRestoresData.filter((item) => item[systemRestoresField] === systemRestoresValue)
  }

  return {
    systemBackupsData,
    systemRestoresData,
  }
}
