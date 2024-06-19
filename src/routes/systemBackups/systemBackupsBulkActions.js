import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import style from './systemBackupsBulkActions.less'
import { hasWritableBackupTargets } from '../../utils/backupTarget'

const confirm = Modal.confirm

function bulkActions({ selectedRows, deleteSystemBackups, createSystemBackup, backupTarget }) {
  const createBtnDisable = !hasWritableBackupTargets(backupTarget)
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
  const allActions = [
    { key: 'create', name: 'Create', disabled: createBtnDisable },
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
  deleteSystemBackups: PropTypes.func,
  createSystemBackup: PropTypes.func,
  backupTarget: PropTypes.object,
}

export default bulkActions
