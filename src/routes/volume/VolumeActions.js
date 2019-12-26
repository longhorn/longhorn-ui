import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function actions({ selected, engineImages, showAttachHost, detach, showEngineUpgrade, deleteVolume, showBackups, showSalvage, rollback, showUpdateReplicaCount, createPVAndPVC, changeVolume, commandKeyDown }) {
  const handleMenuClick = (event, record) => {
    switch (event.key) {
      case 'attach':
        showAttachHost(record)
        break
      case 'salvage':
        showSalvage(record)
        break
      case 'delete':
        if (commandKeyDown) {
          deleteVolume(record)
        } else {
          confirm({
            title: `Are you sure you want to delete volume ${record.name} ?`,
            onOk() {
              deleteVolume(record)
            },
          })
        }
        break
      case 'detach':
        confirm({
          title: `Are you sure you want to detach volume ${record.name} ?`,
          onOk() {
            detach(record.actions.detach)
          },
        })
        break
      case 'engineUpgrade':
        showEngineUpgrade(record)
        break
      case 'backups':
        showBackups(record)
        break
      case 'rollback':
        confirm({
          title: `Are you sure you want to rollback volume ${record.name} ?`,
          onOk() {
            rollback(record)
          },
        })
        break
      case 'updateReplicaCount':
        showUpdateReplicaCount(record)
        break
      case 'pvAndpvcCreate':
        createPVAndPVC(record)
        break
      case 'changeVolume':
        changeVolume(record)
        break
      default:
    }
  }
  const toggleRollbackAndUpgradeAction = (currentActions) => {
    if (selected.currentImage === selected.engineImage) {
      const rollbackActionIndex = currentActions.findIndex(item => item.key === 'rollback')
      if (rollbackActionIndex > -1) {
        const upgradeAction = { key: 'engineUpgrade', name: 'Upgrade' }
        currentActions[rollbackActionIndex] = upgradeAction
      }
      return
    }
    const upgradeActionIndex = currentActions.findIndex(item => item.key === 'engineUpgrade')
    if (upgradeActionIndex > -1) {
      const rollbackAction = { key: 'rollback', name: 'Rollback' }
      currentActions[upgradeActionIndex] = rollbackAction
    }
  }

  const isRestoring = () => {
    if (selected.restoreStatus && selected.restoreStatus.length > 0) {
      let flag = selected.restoreStatus.every((item) => {
        return !item.isRestoring
      })
      return !flag
    } else {
      return false
    }
  }

  const allActions = [
    { key: 'attach', name: 'Attach', disabled: isRestoring() },
    { key: 'detach', name: 'Detach', disabled: selected.standby || isRestoring() },
    { key: 'salvage', name: 'Salvage', disabled: isRestoring() },
    { key: 'engineUpgrade', name: 'Upgrade Engine', disabled: (engineImages.findIndex(engineImage => selected.engineImage !== engineImage.image && engineImage.state === 'ready') === -1) || isRestoring() || selected.state === 'attached' },
    { key: 'updateReplicaCount', name: 'Update Replicas Count', disabled: selected.state !== 'attached' || isRestoring() },
  ]
  const availableActions = [{ key: 'backups', name: 'Backups', disabled: selected.standby || isRestoring() }, { key: 'delete', name: 'Delete' }]

  allActions.forEach(action => {
    for (const key of Object.keys(selected.actions)) {
      if (key === action.key) {
        availableActions.push(action)
      }
    }
  })

  availableActions.push({ key: 'pvAndpvcCreate', name: 'Create PV/PVC', disabled: (selected.kubernetesStatus.pvcName && !selected.kubernetesStatus.lastPVCRefAt) || selected.standby || selected.state === 'attaching' || selected.state === 'detaching' || isRestoring() })
  if (selected.standby) {
    availableActions.push({ key: 'changeVolume', name: 'Activate Disaster Recovery Volume', disabled: !selected.standby })
  }
  toggleRollbackAndUpgradeAction(availableActions)
  return (
    <DropOption menuOptions={availableActions}
      onMenuClick={(e) => handleMenuClick(e, selected)}
    />
  )
}

actions.propTypes = {
  selected: PropTypes.object,
  engineImages: PropTypes.array,
  detach: PropTypes.func,
  deleteVolume: PropTypes.func,
  showAttachHost: PropTypes.func,
  showEngineUpgrade: PropTypes.func,
  showRecurring: PropTypes.func,
  showSnapshots: PropTypes.func,
  showBackups: PropTypes.func,
  takeSnapshot: PropTypes.func,
  showSalvage: PropTypes.func,
  rollback: PropTypes.func,
  showUpdateReplicaCount: PropTypes.func,
  createPVAndPVC: PropTypes.func,
  changeVolume: PropTypes.func,
  commandKeyDown: PropTypes.bool,
}

export default actions
