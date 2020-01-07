import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import style from './VolumeBulkActions.less'

const confirm = Modal.confirm

function bulkActions({ selectedRows, engineImages, bulkDeleteVolume, showBulkEngineUpgrade, showBulkAttachHost, bulkDetach, bulkBackup, createPVAndPVC, createSchedule, commandKeyDown }) {
  const handleClick = (action) => {
    switch (action) {
      case 'delete':
        if (commandKeyDown) {
          bulkDeleteVolume(selectedRows)
        } else {
          confirm({
            title: `Are you sure you want to delete volume(s) ${selectedRows.map(item => item.name).join(', ')} ?`,
            onOk() {
              bulkDeleteVolume(selectedRows)
            },
          })
        }
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
        bulkBackup(selectedRows)
        break
      case 'createSchedule':
        createSchedule(selectedRows)
        break
      case 'createPVAndPVC':
        createPVAndPVC(selectedRows)
        break
      default:
    }
  }
  const hasAction = action => selectedRows.every(item => Object.keys(item.actions).includes(action))
  const hasDoingState = (exclusions = []) => selectedRows.some(item => (item.state.endsWith('ing') && !exclusions.includes(item.state)) || item.currentImage !== item.engineImage)
  const isSnapshotDisabled = () => selectedRows.every(item => !item.actions || !item.actions.snapshotCreate)
  const isHasStandy = () => selectedRows.some(item => item.standby)
  const isAttached = () => selectedRows.some(item => item.state === 'attached')
  const isRestoring = () => selectedRows.some((selected) => {
    if (selected.restoreStatus && selected.restoreStatus.length > 0) {
      let flag = selected.restoreStatus.every((item) => {
        return !item.isRestoring
      })
      return !flag
    } else {
      return false
    }
  })
  /*
  * PV/PVC decides whether to disable it
  */
  const hasMoreOptions = () => engineImages.findIndex(engineImage => engineImage.state === 'ready' && selectedRows.findIndex(item => item.engineImage === engineImage.image) === -1) === -1
  const allActions = [
    { key: 'delete', name: 'Delete', disabled() { return selectedRows.length === 0 } },
    { key: 'attach', name: 'Attach', disabled() { return selectedRows.length === 0 || !hasAction('attach') || hasDoingState() || isRestoring() } },
    { key: 'detach', name: 'Detach', disabled() { return selectedRows.length === 0 || !hasAction('detach') || hasDoingState(['attaching']) || isHasStandy() || isRestoring() } },
    { key: 'backup', name: 'Create Backup', disabled() { return selectedRows.length === 0 || isSnapshotDisabled() || hasDoingState() || isHasStandy() || isRestoring() } },
    { key: 'upgrade', name: 'Upgrade Engine', disabled() { return selectedRows.length === 0 || !hasAction('engineUpgrade') || hasDoingState() || hasMoreOptions() || isRestoring() || isAttached() } },
    { key: 'createSchedule', name: 'Update Schedule', disabled() { return selectedRows.length === 0 } },
    { key: 'createPVAndPVC', name: 'Create PV/PVC', disabled() { return selectedRows.length === 0 || isHasStandy() || isRestoring() } },
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
  engineImages: PropTypes.array,
  bulkDeleteVolume: PropTypes.func,
  showBulkEngineUpgrade: PropTypes.func,
  showBulkAttachHost: PropTypes.func,
  bulkDetach: PropTypes.func,
  showBulkSalvage: PropTypes.func,
  bulkBackup: PropTypes.func,
  createPVAndPVC: PropTypes.func,
  createSchedule: PropTypes.func,
  commandKeyDown: PropTypes.bool,
}

export default bulkActions
