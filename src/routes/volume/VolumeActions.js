import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { detachable, attachable, isRestoring } from './helper'
const confirm = Modal.confirm

function actions({
  selected,
  engineImages,
  showAttachHost,
  showDetachHost,
  showEngineUpgrade,
  deleteVolume,
  showBackups,
  showSalvage,
  rollback,
  showVolumeCloneModal,
  showUpdateReplicaCount,
  updateSnapshotMaxCount,
  updateSnapshotMaxSize,
  showExpansionVolumeSizeModal,
  showCancelExpansionModal,
  createPVAndPVC,
  changeVolume,
  showUpdateDataLocality,
  showUpdateAccessMode,
  showUpdateReplicaAutoBalanceModal,
  showUnmapMarkSnapChainRemovedModal,
  engineUpgradePerNodeLimit,
  trimFilesystem,
  showUpdateSnapshotDataIntegrityModal,
  showUpdateReplicaSoftAntiAffinityModal,
  showUpdateReplicaZoneSoftAntiAffinityModal,
  showUpdateReplicaDiskSoftAntiAffinityModal,
  showUpdateFreezeFilesystemForSnapshotModal,
  commandKeyDown,
}) {
  const deleteWranElement = (record) => {
    let workloadResources = ''
    let hasPvTooltipText = ''
    let pvResources = ''

    if (record && record.kubernetesStatus && record.kubernetesStatus.pvStatus && record.kubernetesStatus.pvName) {
      hasPvTooltipText = (<div>{`The following resources associated with this volume (${record.name}) will be deleted:`}</div>)
      pvResources = (<div style={{ margin: '10px', color: '#b7b7b7' }}>
        <div style={{ paddingLeft: '10px' }}>PV Name: {record.kubernetesStatus.pvName}</div>
        { !record.kubernetesStatus.lastPVCRefAt && record.kubernetesStatus.pvcName ? <div style={{ paddingLeft: '10px' }}>PVC Name: {record.kubernetesStatus.pvcName}</div> : ''}
      </div>)
    }
    if (record.kubernetesStatus && record.kubernetesStatus.workloadsStatus && !record.kubernetesStatus.lastPodRefAt && record.kubernetesStatus.workloadsStatus.length > 0) {
      workloadResources = (<div>
        <div style={{ margin: '10px 0px', color: '#b7b7b7' }}>{record.kubernetesStatus.workloadsStatus.map((item, i) => {
          return (<div key={i} style={{ paddingLeft: '10px' }}>Pod Name: {item.podName} ({item.podStatus})</div>)
        })}</div>
      </div>)
    }

    return (<div>
      {record.state === 'attached' ? <div>{`The volume is attached on ${record.controllers && record.controllers[0] && record.controllers[0].hostId ? record.controllers[0].hostId : ''}. Deleting this volume may cause errors for any running applications using this volume!`} </div> : ''}
      {workloadResources ? <div> { `The following workload(s) depend on this volume (${record.name}) and may encounter errors once it is deleted:` }</div> : '' }
      {workloadResources}
      {hasPvTooltipText}
      {pvResources}
      <div style={{ marginTop: hasPvTooltipText || pvResources ? 10 : 0 }}>{`Are you sure you want to delete volume (${record.name}) ?`} </div>
    </div>)
  }
  const handleMenuClick = (event, record) => {
    event.domEvent?.stopPropagation?.()
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
          let title = deleteWranElement(record)
          confirm({
            width: 700,
            okType: 'danger',
            okText: 'Delete',
            title,
            onOk() {
              deleteVolume(record)
            },
          })
        }
        break
      case 'detach':
        showDetachHost(record)
        break
      case 'engineUpgrade':
        showEngineUpgrade(record)
        break
      case 'backups':
        showBackups(record)
        break
      case 'cloneVolume':
        showVolumeCloneModal(record)
        break
      case 'rollback':
        confirm({
          title: `Are you sure you want to rollback volume ${record.name}?`,
          onOk() {
            rollback(record)
          },
        })
        break
      case 'updateReplicaCount':
        showUpdateReplicaCount(record)
        break
      case 'updateSnapshotMaxCount':
        updateSnapshotMaxCount(record)
        break
      case 'updateSnapshotMaxSize':
        updateSnapshotMaxSize(record)
        break
      case 'updateDataLocality':
        showUpdateDataLocality(record)
        break
      case 'updateSnapshotDataIntegrity':
        showUpdateSnapshotDataIntegrityModal(record)
        break
      case 'updateAccessMode':
        showUpdateAccessMode(record)
        break
      case 'pvAndpvcCreate':
        createPVAndPVC(record)
        break
      case 'changeVolume':
        changeVolume(record)
        break
      case 'expandVolume':
        showExpansionVolumeSizeModal(record)
        break
      case 'cancelExpansion':
        showCancelExpansionModal(record)
        break
      case 'updateReplicaAutoBalance':
        showUpdateReplicaAutoBalanceModal(record)
        break
      case 'updateUnmapMarkSnapChainRemoved':
        showUnmapMarkSnapChainRemovedModal(record)
        break
      case 'updateReplicaSoftAntiAffinity':
        showUpdateReplicaSoftAntiAffinityModal(record)
        break
      case 'updateReplicaZoneSoftAntiAffinity':
        showUpdateReplicaZoneSoftAntiAffinityModal(record)
        break
      case 'updateReplicaDiskSoftAntiAffinity':
        showUpdateReplicaDiskSoftAntiAffinityModal(record)
        break
      case 'updateFreezeFilesystemForSnapshot':
        showUpdateFreezeFilesystemForSnapshotModal(record)
        break
      case 'trimFilesystem':
        confirm({
          title: 'Are you sure you want to trim the filesystem?',
          onOk() {
            trimFilesystem(record)
          },
        })
        break
      default:
    }
  }
  const toggleRollbackAndUpgradeAction = (currentActions) => {
    if (selected.currentImage === selected.image) {
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

  const isRwxVolumeWithWorkload = () => {
    return selected.accessMode === 'rwx' && selected.kubernetesStatus.workloadsStatus && selected.kubernetesStatus.workloadsStatus.length > 0 && selected.kubernetesStatus.lastPodRefAt === ''
  }

  const canUpdateDataLocality = () => {
    return selected.actions && selected.actions.updateDataLocality
  }

  const canUpdateAccessMode = () => {
    return selected.actions && selected.actions.updateAccessMode
  }

  const canUpdateReplicaAutoBalance = () => {
    return selected.actions && selected.actions.updateReplicaAutoBalance
  }

  const isAutomaticallyUpgradeEngine = () => {
    if (engineUpgradePerNodeLimit && engineUpgradePerNodeLimit.value !== '0') {
      let defaultEngineImage = engineImages.find(engineImage => engineImage.default)
      if (defaultEngineImage) {
        return selected.image === defaultEngineImage.image
      }
      return true
    }
    return false
  }

  const upgradingEngine = () => selected.currentImage !== selected.image

  const allActions = [
    { key: 'attach', name: 'Attach', disabled: !attachable(selected) },
    { key: 'detach', name: 'Detach', disabled: !detachable(selected), tooltip: isRwxVolumeWithWorkload() ? 'The volume access mode is `ReadWriteMany`, Please ensure that the workloads are scaled down before trying to detach the volume' : '' },
    { key: 'salvage', name: 'Salvage', disabled: isRestoring(selected) },
    { key: 'engineUpgrade', name: 'Upgrade Engine', disabled: isAutomaticallyUpgradeEngine() || (engineImages.findIndex(engineImage => selected.image !== engineImage.image) === -1) || isRestoring(selected) || (selected.state !== 'detached' && selected.state !== 'attached') || selected?.dataEngine === 'v2' },
    { key: 'updateReplicaCount', name: 'Update Replicas Count', disabled: selected.state !== 'attached' || isRestoring(selected) || selected.standby || upgradingEngine() },
    { key: 'updateDataLocality', name: 'Update Data Locality', disabled: !canUpdateDataLocality() || upgradingEngine() },
    { key: 'updateSnapshotDataIntegrity', name: 'Snapshot Data Integrity', disabled: false },
    { key: 'updateAccessMode', name: 'Update Access Mode', disabled: (selected.kubernetesStatus && selected.kubernetesStatus.pvStatus) || !canUpdateAccessMode() },
    { key: 'updateReplicaAutoBalance', name: 'Update Replicas Auto Balance', disabled: !canUpdateReplicaAutoBalance() },
    { key: 'updateUnmapMarkSnapChainRemoved', name: 'Allow snapshots removal during trim', disabled: false },
    { key: 'updateReplicaSoftAntiAffinity', name: 'Update Replica Soft Anti Affinity', disabled: false },
    { key: 'updateReplicaZoneSoftAntiAffinity', name: 'Update Replica Zone Soft Anti Affinity', disabled: false },
    { key: 'updateSnapshotMaxCount', name: 'Update Snapshot Max Count', disabled: false },
    { key: 'updateSnapshotMaxSize', name: 'Update Snapshot Max Size', disabled: false },
    { key: 'updateReplicaDiskSoftAntiAffinity', name: 'Update Replica Disk Soft Anti Affinity', disabled: false },
    { key: 'updateFreezeFilesystemForSnapshot', name: 'Update Freeze Filesystem For Snapshot', disabled: false },
  ]
  const availableActions = [{ key: 'backups', name: 'Backups', disabled: selected.standby || isRestoring(selected) }, { key: 'delete', name: 'Delete' }]

  allActions.forEach(action => {
    for (const key of Object.keys(selected.actions)) {
      if (key === action.key) {
        availableActions.push(action)
      }
    }
  })

  availableActions.push({ key: 'cloneVolume', name: 'Clone Volume', disabled: selected.standby || isRestoring(selected) })
  availableActions.push({ key: 'expandVolume', name: 'Expand Volume', disabled: selected?.conditions?.Scheduled?.status?.toLowerCase() === 'false' })
  if (selected.controllers && selected.controllers[0] && !selected.controllers[0].isExpanding && selected.controllers[0].size !== 0 && selected.controllers[0].size !== selected.size && selected.controllers[0].size !== '0') {
    availableActions.push({ key: 'cancelExpansion', name: 'Cancel Expansion', disabled: false })
  }
  availableActions.push({ key: 'pvAndpvcCreate', name: 'Create PV/PVC', disabled: (selected.kubernetesStatus.pvcName && !selected.kubernetesStatus.lastPVCRefAt) || selected.robustness === 'faulted' || selected.standby || selected.state === 'attaching' || selected.state === 'detaching' || isRestoring(selected) || !selected.actions?.pvCreate || !selected.actions?.pvcCreate })
  if (selected.standby) {
    availableActions.push({ key: 'changeVolume', name: 'Activate Disaster Recovery Volume', disabled: !selected.standby })
  }
  availableActions.push({ key: 'trimFilesystem', name: 'Trim Filesystem', disabled: selected.state !== 'attached' })
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
  showCloneVolume: PropTypes.func,
  showUpdateReplicaCount: PropTypes.func,
  updateSnapshotMaxCount: PropTypes.func,
  updateSnapshotMaxSize: PropTypes.func,
  createPVAndPVC: PropTypes.func,
  changeVolume: PropTypes.func,
  commandKeyDown: PropTypes.bool,
  showExpansionVolumeSizeModal: PropTypes.func,
  showCancelExpansionModal: PropTypes.func,
  showUpdateDataLocality: PropTypes.func,
  showUpdateAccessMode: PropTypes.func,
  showUpdateReplicaAutoBalanceModal: PropTypes.func,
  showUnmapMarkSnapChainRemovedModal: PropTypes.func,
  trimFilesystem: PropTypes.func,
  showUpdateSnapshotDataIntegrityModal: PropTypes.func,
  engineUpgradePerNodeLimit: PropTypes.object,
  showUpdateFreezeFilesystemForSnapshotModal: PropTypes.func,
}

export default actions
