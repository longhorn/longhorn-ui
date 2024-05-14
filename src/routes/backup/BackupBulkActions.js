import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'
import style from './BackupBulkActions.less'

function bulkActions({ selectedRows, backupVolumes, restoreLatestBackup, showBulkCreateDisasterRecoveryVolume, syncAllBackupVolumes }) {
  const handleClick = (action) => {
    switch (action) {
      case 'restoreLatestBackup':
        restoreLatestBackup(selectedRows)
        break
      case 'bulkCreateDisasterRecoveryVolume':
        showBulkCreateDisasterRecoveryVolume(selectedRows)
        break
      case 'syncAllBackupVolumes':
        syncAllBackupVolumes()
        break
      default:
    }
  }

  const allActions = [
    { key: 'restoreLatestBackup', name: 'Restore Latest Backup', disabled() { return selectedRows.length === 0 || selectedRows.some(record => !record.lastBackupName || (record.messages && record.messages.error)) } },
    { key: 'bulkCreateDisasterRecoveryVolume', name: 'Create Disaster Recovery Volume', disabled() { return selectedRows.length === 0 || selectedRows.some(record => !record.lastBackupName || (record.messages && record.messages.error)) } },
    { key: 'syncAllBackupVolumes', name: 'Sync All Backup Volumes', disabled() { return backupVolumes.length === 0 } },
  ]

  return (
    <div className={style.bulkActions}>
      { allActions.map(item => {
        return (
          <div key={item.key}>
            &nbsp;
            <Button size="large" type="primary" disabled={item.disabled()} onClick={() => handleClick(item.key)}>{ item.name }</Button>
          </div>
        )
      }) }
    </div>
  )
}

bulkActions.propTypes = {
  selectedRows: PropTypes.array,
  backupVolumes: PropTypes.array,
  restoreLatestBackup: PropTypes.func,
  showBulkCreateDisasterRecoveryVolume: PropTypes.func,
}

export default bulkActions
