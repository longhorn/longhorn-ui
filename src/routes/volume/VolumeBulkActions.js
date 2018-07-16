import React, { PropTypes } from 'react'
import { Button, Modal } from 'antd'
import style from './VolumeBulkActions.less'

const confirm = Modal.confirm

function bulkActions({ selectedRows, bulkDeleteVolume, showBulkEngineUpgrade, showBulkAttachHost, bulkDetach, bulkBackup }) {
  const handleClick = (action) => {
    switch (action) {
      case 'delete':
        bulkDeleteVolume(selectedRows)
        break
      case 'upgrade':
        showBulkEngineUpgrade(selectedRows)
        break
      case 'attach':
        showBulkAttachHost(selectedRows)
        break
      case 'detach':
        confirm({
          title: `Are you sure you want to detach volume(s) ${selectedRows.map(item => item.name).join(', ')} ?`,
          onOk() {
            bulkDetach(selectedRows.map(item => item.actions.detach))
          },
        })
        break
      case 'backup':
        bulkBackup(selectedRows.map(item => { return { snapshotCreateUrl: item.actions.snapshotCreate, snapshotBackupUrl: item.actions.snapshotBackup } }))
        break
      default:
    }
  }
  const hasAction = action => selectedRows.every(item => Object.keys(item.actions).includes(action))
  const hasDoingState = () => selectedRows.some(item => item.state.endsWith('ing') || item.currentImage !== item.engineImage)
  const isSnapshotDisabled = () => selectedRows.every(item => !item.actions || !item.actions.snapshotCreate)
  const allActions = [
    { key: 'delete', name: 'Delete', disabled() { return selectedRows.length === 0 } },
    { key: 'upgrade', name: 'Upgrade', disabled() { return selectedRows.length === 0 || !hasAction('engineUpgrade') || hasDoingState() } },
    { key: 'attach', name: 'Attach', disabled() { return selectedRows.length === 0 || !hasAction('attach') || hasDoingState() } },
    { key: 'detach', name: 'Detach', disabled() { return selectedRows.length === 0 || !hasAction('detach') || hasDoingState() } },
    { key: 'backup', name: 'Create Backup', disabled() { return selectedRows.length === 0 || isSnapshotDisabled() || hasDoingState() } },
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
  bulkDeleteVolume: PropTypes.func,
  showBulkEngineUpgrade: PropTypes.func,
  showBulkAttachHost: PropTypes.func,
  bulkDetach: PropTypes.func,
  showBulkSalvage: PropTypes.func,
  bulkBackup: PropTypes.func,
}

export default bulkActions
