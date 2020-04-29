import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Menu, Dropdown, Icon } from 'antd'
import style from './VolumeBulkActions.less'

const confirm = Modal.confirm

function bulkActions({ selectedRows, engineImages, bulkDeleteVolume, showBulkEngineUpgrade, showBulkChangeVolume, showBulkAttachHost, bulkDetach, bulkBackup, bulkExpandVolume, createPVAndPVC, createSchedule, commandKeyDown }) {
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
      case 'bulkChangeVolume':
        showBulkChangeVolume(selectedRows)
        break
      case 'detach':
        if (commandKeyDown) {
          bulkDetach(selectedRows.map(item => item.actions.detach))
        } else {
          confirm({
            title: `Are you sure you want to detach volume(s) ${selectedRows.map(item => item.name).join(', ')} ?`,
            onOk() {
              bulkDetach(selectedRows.map(item => item.actions.detach))
            },
          })
        }
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
      case 'expandVolume':
        bulkExpandVolume(selectedRows)
        break
      default:
    }
  }
  const hasAction = action => selectedRows.every(item => Object.keys(item.actions).includes(action))
  const hasDoingState = (exclusions = []) => selectedRows.some(item => (item.state.endsWith('ing') && !exclusions.includes(item.state)) || item.currentImage !== item.engineImage)
  const isSnapshotDisabled = () => selectedRows.every(item => !item.actions || !item.actions.snapshotCreate)
  const isHasStandy = () => selectedRows.some(item => item.standby)
  const isHasPVC = () => selectedRows.some(item => item.kubernetesStatus && item.kubernetesStatus.pvStatus && item.kubernetesStatus.pvStatus === 'Bound')
  // const isAttached = () => selectedRows.some(item => item.state === 'attached')
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
  ]

  const allDropDownActions = [
    { key: 'upgrade', name: 'Upgrade Engine', disabled() { return selectedRows.length === 0 || !hasAction('engineUpgrade') || hasDoingState() || hasMoreOptions() || isRestoring() } },
    { key: 'expandVolume', name: 'Expand Volume', disabled() { return selectedRows.length === 0 || !hasAction('attach') } },
    { key: 'createSchedule', name: 'Update Schedule', disabled() { return selectedRows.length === 0 } },
    { key: 'createPVAndPVC', name: 'Create PV/PVC', disabled() { return selectedRows.length === 0 || isHasStandy() || isRestoring() || isHasPVC() } },
    { key: 'bulkChangeVolume', name: 'Activate Disaster Recovery Volume', disabled() { return selectedRows.length === 0 || selectedRows.some((item) => !item.standby) } },
  ]

  const menu = (<Menu>
    {
      allDropDownActions.map((item) => {
        return (<Menu.Item key={item.key}>
          <Button size="large" type="link" disabled={item.disabled()} onClick={() => handleClick(item.key)}>{ item.name }</Button>
        </Menu.Item>)
      })
    }
  </Menu>)

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
      &nbsp;
      <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft" disabled={selectedRows.length === 0}>
        <Button type="primary" size="large"><Icon type="unordered-list" style={{ marginRight: '3px' }} /><Icon type="down" /></Button>
      </Dropdown>
    </div>
  )
}

bulkActions.propTypes = {
  selectedRows: PropTypes.array,
  engineImages: PropTypes.array,
  bulkDeleteVolume: PropTypes.func,
  showBulkEngineUpgrade: PropTypes.func,
  showBulkChangeVolume: PropTypes.func,
  showBulkAttachHost: PropTypes.func,
  bulkDetach: PropTypes.func,
  showBulkSalvage: PropTypes.func,
  bulkBackup: PropTypes.func,
  createPVAndPVC: PropTypes.func,
  createSchedule: PropTypes.func,
  bulkExpandVolume: PropTypes.func,
  commandKeyDown: PropTypes.bool,
}

export default bulkActions
