import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import style from './systemBackupsBulkActions.less'

const confirm = Modal.confirm

function bulkActions({ selectedRows, backupProps, deleteSystemBackups, createSystemBackup }) {
  const handleClick = (action) => {
    switch (action) {
      case 'create':
        createSystemBackup()
        break
      case 'delete':
        confirm({
          title: `Are you sure you want to delete System Backups ${selectedRows.map(item => item.name).join(',')} ?`,
          onOk() {
            deleteSystemBackups(selectedRows)
          },
        })
        break
      default:
    }
  }

  const { backupTargetAvailable, backupTargetMessage } = backupProps
  const allActions = [
    { key: 'create', name: 'Create', disabled: backupTargetAvailable === false, tooltip: backupTargetAvailable === false ? backupTargetMessage : '' },
    { key: 'delete', name: 'Delete', disabled: selectedRows.length === 0 },
  ]

  return (
    <div className={style.bulkActions}>
      { allActions.map(item => {
        return (
          <div key={item.key}>
            &nbsp;
            <Button size="large" type="primary" disabled={item.disabled} onClick={() => handleClick(item.key)}>{ item.name }</Button>
          </div>
        )
      }) }
    </div>
  )
}

bulkActions.propTypes = {
  selectedRows: PropTypes.array,
  backupProps: PropTypes.object,
  deleteSystemBackups: PropTypes.func,
  createSystemBackup: PropTypes.func,
}

export default bulkActions
