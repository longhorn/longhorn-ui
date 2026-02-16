import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { DropOption } from '../../components'
import { detachable, attachable, isRestoring } from './helper'
import { withTranslation } from 'react-i18next'

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
  showUpdateBackupTarget,
  showUpdateReplicaAutoBalanceModal,
  showUnmapMarkSnapChainRemovedModal,
  engineUpgradePerNodeLimit,
  trimFilesystem,
  showUpdateSnapshotDataIntegrityModal,
  showUpdateReplicaSoftAntiAffinityModal,
  showUpdateReplicaZoneSoftAntiAffinityModal,
  showUpdateReplicaDiskSoftAntiAffinityModal,
  showUpdateFreezeFilesystemForSnapshotModal,
  toggleOfflineRebuildingModal,
  toggleReplicaRebuildingBandwidthLimitModal,
  toggleUblkParamsModal,
  toggleRebuildConcurrentSyncLimitModal,
  commandKeyDown,
  t,
}) {
  const deleteWranElement = (record) => {
    let workloadResources = ''
    let hasPvTooltipText = ''
    let pvResources = ''

    if (record && record.kubernetesStatus && record.kubernetesStatus.pvStatus && record.kubernetesStatus.pvName) {
      hasPvTooltipText = (<div>{t('volumeActions.modal.delete.hasPvTooltipText', { name: record.name })}</div>)
      pvResources = (<div style={{ margin: '10px', color: '#b7b7b7' }}>
        <div style={{ paddingLeft: '10px' }}>{t('volumeActions.modal.delete.pvName', { name: record.kubernetesStatus.pvName })}</div>
        { !record.kubernetesStatus.lastPVCRefAt && record.kubernetesStatus.pvcName ? <div style={{ paddingLeft: '10px' }}>{t('volumeActions.modal.delete.pvcName', { name: record.kubernetesStatus.pvcName })}</div> : ''}
      </div>)
    }
    if (record.kubernetesStatus && record.kubernetesStatus.workloadsStatus && !record.kubernetesStatus.lastPodRefAt && record.kubernetesStatus.workloadsStatus.length > 0) {
      workloadResources = (<div>
        <div style={{ margin: '10px 0px', color: '#b7b7b7' }}>{record.kubernetesStatus.workloadsStatus.map((item, i) => {
          return (<div key={i} style={{ paddingLeft: '10px' }}>{t('volumeActions.modal.delete.podName', { name: item.podName, status: item.podStatus })}</div>)
        })}</div>
      </div>)
    }

    return (<div>
      {record.state === 'attached' ? <div>{t('volumeActions.modal.delete.attachedWarning', { hostId: record.controllers && record.controllers[0] && record.controllers[0].hostId ? record.controllers[0].hostId : '' })}</div> : ''}
      {workloadResources ? <div>{t('volumeActions.modal.delete.workloadWarning', { name: record.name })}</div> : '' }
      {workloadResources}
      {hasPvTooltipText}
      {pvResources}
      <div style={{ marginTop: hasPvTooltipText || pvResources ? 10 : 0 }}>{t('volumeActions.modal.delete.confirmation', { name: record.name })}</div>
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
            okText: t('volumeActions.modal.delete.okText'),
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
          title: t('volumeActions.modal.rollback.title', { name: record.name }),
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
      case 'updateBackupTargetName':
        showUpdateBackupTarget(record)
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
          title: t('volumeActions.modal.trimFilesystem.title'),
          onOk() {
            trimFilesystem(record)
          },
        })
        break
      case 'offlineReplicaRebuilding':
        toggleOfflineRebuildingModal(record)
        break
      case 'updateReplicaRebuildingBandwidthLimit':
        toggleReplicaRebuildingBandwidthLimitModal(record)
        break
      case 'updateUblkNumberOfQueue':
        toggleUblkParamsModal(record, 'ublkNumberOfQueue')
        break
      case 'updateUblkQueueDepth':
        toggleUblkParamsModal(record, 'ublkQueueDepth')
        break
      case 'rebuildConcurrentSyncLimit':
        toggleRebuildConcurrentSyncLimitModal(record)
        break
      default:
    }
  }
  const toggleRollbackAndUpgradeAction = (currentActions) => {
    if (selected.currentImage === selected.image) {
      const rollbackActionIndex = currentActions.findIndex(item => item.key === 'rollback')
      if (rollbackActionIndex > -1) {
        const upgradeAction = { key: 'engineUpgrade', name: t('volumeActions.actions.upgrade') }
        currentActions[rollbackActionIndex] = upgradeAction
      }
      return
    }
    const upgradeActionIndex = currentActions.findIndex(item => item.key === 'engineUpgrade')
    if (upgradeActionIndex > -1) {
      const rollbackAction = { key: 'rollback', name: t('volumeActions.actions.rollback') }
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
    { key: 'attach', name: t('volumeActions.actions.attach'), disabled: !attachable(selected) },
    { key: 'detach', name: t('volumeActions.actions.detach'), disabled: !detachable(selected), tooltip: isRwxVolumeWithWorkload() ? t('volumeActions.tooltips.rwxDetach') : '' },
    { key: 'salvage', name: t('volumeActions.actions.salvage'), disabled: isRestoring(selected) },
    { key: 'engineUpgrade', name: t('volumeActions.actions.engineUpgrade'), disabled: isAutomaticallyUpgradeEngine() || (engineImages.findIndex(engineImage => selected.image !== engineImage.image) === -1) || isRestoring(selected) || (selected.state !== 'detached' && selected.state !== 'attached') || selected?.dataEngine === 'v2' },
    { key: 'updateReplicaCount', name: t('volumeActions.actions.updateReplicaCount'), disabled: selected.state !== 'attached' || isRestoring(selected) || selected.standby || upgradingEngine() },
    { key: 'updateDataLocality', name: t('volumeActions.actions.updateDataLocality'), disabled: !canUpdateDataLocality() || upgradingEngine() },
    { key: 'updateSnapshotDataIntegrity', name: t('volumeActions.actions.updateSnapshotDataIntegrity'), disabled: false },
    { key: 'updateAccessMode', name: t('volumeActions.actions.updateAccessMode'), disabled: (selected.kubernetesStatus && selected.kubernetesStatus.pvStatus) || !canUpdateAccessMode() },
    { key: 'updateBackupTargetName', name: t('volumeActions.actions.updateBackupTarget') },
    { key: 'updateReplicaAutoBalance', name: t('volumeActions.actions.updateReplicaAutoBalance'), disabled: !canUpdateReplicaAutoBalance() },
    { key: 'updateUnmapMarkSnapChainRemoved', name: t('volumeActions.actions.allowSnapshotsRemovalDuringTrim'), disabled: false },
    { key: 'updateReplicaSoftAntiAffinity', name: t('volumeActions.actions.updateReplicaSoftAntiAffinity'), disabled: false },
    { key: 'updateReplicaZoneSoftAntiAffinity', name: t('volumeActions.actions.updateReplicaZoneSoftAntiAffinity'), disabled: false },
    { key: 'updateSnapshotMaxCount', name: t('volumeActions.actions.updateSnapshotMaxCount'), disabled: false },
    { key: 'updateSnapshotMaxSize', name: t('volumeActions.actions.updateSnapshotMaxSize'), disabled: false },
    { key: 'updateReplicaDiskSoftAntiAffinity', name: t('volumeActions.actions.updateReplicaDiskSoftAntiAffinity'), disabled: false },
    { key: 'updateFreezeFilesystemForSnapshot', name: t('volumeActions.actions.updateFreezeFilesystemForSnapshot'), disabled: false },
    { key: 'offlineReplicaRebuilding', name: t('volumeActions.actions.offlineReplicaRebuilding'), disabled: false },
  ]
  const availableActions = [
    { key: 'backups', name: t('volumeActions.actions.backups'), disabled: selected.standby || isRestoring(selected) },
    { key: 'delete', name: t('volumeActions.actions.delete') },
  ]

  allActions.forEach(action => {
    for (const key of Object.keys(selected.actions)) {
      if (key === action.key) {
        availableActions.push(action)
      }
    }
  })
  if (selected.dataEngine === 'v1') {
    availableActions.push({ key: 'rebuildConcurrentSyncLimit', name: 'Update Rebuild Concurrent Sync Limit', disabled: false })
  }
  if (selected.dataEngine === 'v2') {
    availableActions.push({ key: 'updateReplicaRebuildingBandwidthLimit', name: t('volumeActions.actions.updateReplicaRebuildingBandwidthLimit'), disabled: false })
  }

  if (selected.frontend === 'ublk') {
    availableActions.push({ key: 'updateUblkNumberOfQueue', name: t('volumeActions.actions.updateUblkNumberOfQueue'), disabled: selected.state !== 'detached' })
    availableActions.push({ key: 'updateUblkQueueDepth', name: t('volumeActions.actions.updateUblkQueueDepth'), disabled: selected.state !== 'detached' })
  }

  availableActions.push({ key: 'cloneVolume', name: t('volumeActions.actions.cloneVolume'), disabled: selected.standby || isRestoring(selected) })
  availableActions.push({ key: 'expandVolume', name: t('volumeActions.actions.expandVolume'), disabled: selected?.conditions?.Scheduled?.status?.toLowerCase() !== 'true' })
  if (selected.controllers && selected.controllers[0] && !selected.controllers[0].isExpanding && selected.controllers[0].size !== 0 && selected.controllers[0].size !== selected.size && selected.controllers[0].size !== '0') {
    availableActions.push({ key: 'cancelExpansion', name: t('volumeActions.actions.cancelExpansion'), disabled: false })
  }
  availableActions.push({ key: 'pvAndpvcCreate', name: t('volumeActions.actions.pvAndpvcCreate'), disabled: (selected.kubernetesStatus.pvcName && !selected.kubernetesStatus.lastPVCRefAt) || selected.robustness === 'faulted' || selected.standby || selected.state === 'attaching' || selected.state === 'detaching' || isRestoring(selected) || !selected.actions?.pvCreate || !selected.actions?.pvcCreate })
  if (selected.standby) {
    availableActions.push({ key: 'changeVolume', name: t('volumeActions.actions.activateDisasterRecoveryVolume'), disabled: !selected.standby })
  }
  availableActions.push({ key: 'trimFilesystem', name: t('volumeActions.actions.trimFilesystem'), disabled: selected.state !== 'attached' })

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
  t: PropTypes.func,
}

export default withTranslation()(actions)
