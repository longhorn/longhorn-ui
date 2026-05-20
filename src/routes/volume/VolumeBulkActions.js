import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Menu, Dropdown, Icon, Tooltip } from 'antd'
import { detachable, attachable, isRestoring } from './helper'
import style from './VolumeBulkActions.less'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function bulkActions({
  selectedRows,
  engineImages,
  bulkDeleteVolume,
  showBulkEngineUpgrade,
  showBulkChangeVolume,
  showBulkAttachHost,
  bulkBackup,
  bulkExpandVolume,
  createPVAndPVC,
  showBulkDetachHost,
  showBulkCloneVolume,
  commandKeyDown,
  showUpdateBulkReplicaCount,
  showUpdateBulkDataLocality,
  showUpdateBulkAccessMode,
  engineUpgradePerNodeLimit,
  showUpdateReplicaAutoBalanceModal,
  backupTargetAvailable,
  backupTargetMessage,
  showBulkUnmapMarkSnapChainRemovedModal,
  trimBulkFilesystem,
  showUpdateBulkBackupTarget,
  showUpdateBulkSnapshotDataIntegrityModal,
  showUpdateReplicaSoftAntiAffinityModal,
  showUpdateReplicaZoneSoftAntiAffinityModal,
  showUpdateReplicaDiskSoftAntiAffinityModal,
  showUpdateBulkFreezeFilesystemForSnapshotModal,
  toggleOfflineRebuildingModal,
  toggleReplicaRebuildingBandwidthLimitModal,
  toggleUblkParamsModal,
  toggleRebuildConcurrentSyncLimitModal,
  t,
}) {
  const deleteWranElement = (rows) => {
    let workloadResources = []
    let pvResources = []
    let hasPVRows = []
    let hasWorkloadsRows = []
    let hasVolumeAttachedRows = []

    rows.forEach((item) => {
      if (item && item.kubernetesStatus && item.kubernetesStatus.pvStatus && item.kubernetesStatus.pvName) {
        pvResources.push((<div style={{ margin: '10px', color: '#b7b7b7' }}>
          <div style={{ paddingLeft: '10px' }}>{t('volumeBulkActions.deleteWarning.pvName')}: {item.kubernetesStatus.pvName}</div>
          { !item.kubernetesStatus.lastPVCRefAt && item.kubernetesStatus.pvcName ? <div style={{ paddingLeft: '10px' }}>{t('volumeBulkActions.deleteWarning.pvcName')}: {item.kubernetesStatus.pvcName}</div> : ''}
        </div>))
        hasPVRows.push(item.name)
      }
      if (item.kubernetesStatus && item.kubernetesStatus.workloadsStatus && !item.kubernetesStatus.lastPodRefAt && item.kubernetesStatus.workloadsStatus.length > 0) {
        workloadResources.push((<div>
          <div style={{ margin: '10px 0px', color: '#b7b7b7' }}>{item.kubernetesStatus.workloadsStatus.map((ele, i) => {
            return (<div key={i} style={{ paddingLeft: '10px' }}>{t('volumeBulkActions.deleteWarning.podName')}: {ele.podName} ({ele.podStatus})</div>)
          })}</div>
        </div>))
        hasWorkloadsRows.push(item.name)
      }
      if (item.state === 'attached') {
        hasVolumeAttachedRows.push(item.name)
      }
    })
    return (<div>
      {hasVolumeAttachedRows.length > 0 ? <div>{t('volumeBulkActions.deleteWarning.attachedVolumes', { volumes: hasVolumeAttachedRows.map(item => item).join(', ') })}</div> : ''}
      {workloadResources.length > 0 ? <div>{t('volumeBulkActions.deleteWarning.workloadVolumes', { volumes: hasWorkloadsRows.map(item => item).join(', ') })}</div> : ''}
      {workloadResources.map((item, i) => <div key={i}>{item}</div>)}
      {pvResources.length > 0 ? <div>{t('volumeBulkActions.deleteWarning.pvResources', { volumes: hasPVRows.map(item => item).join(', ') })}</div> : ''}
      {pvResources.map((item, i) => <div key={i}>{item}</div>)}
      <div style={{ marginTop: 10 }}>{t('volumeBulkActions.deleteWarning.confirmDelete', { volumes: rows.map(item => item.name).join(', ') })}</div>
    </div>)
  }
  const handleClick = (action) => {
    switch (action) {
      case 'delete':
        if (commandKeyDown) {
          bulkDeleteVolume(selectedRows)
        } else {
          let title = deleteWranElement(selectedRows)
          confirm({
            width: 700,
            title,
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
        showBulkDetachHost(selectedRows)
        break
      case 'bulkCloneVolume':
        showBulkCloneVolume(selectedRows)
        break
      case 'backup':
        bulkBackup(selectedRows)
        break
      case 'updateBulkReplicaCount':
        showUpdateBulkReplicaCount(selectedRows)
        break
      case 'updateBulkDataLocality':
        showUpdateBulkDataLocality(selectedRows)
        break
      case 'updateSnapshotDataIntegrity':
        showUpdateBulkSnapshotDataIntegrityModal(selectedRows)
        break
      case 'updateBulkAccessMode':
        showUpdateBulkAccessMode(selectedRows)
        break
      case 'updateBulkBackupTarget':
        showUpdateBulkBackupTarget(selectedRows)
        break
      case 'createPVAndPVC':
        createPVAndPVC(selectedRows)
        break
      case 'expandVolume':
        bulkExpandVolume(selectedRows)
        break
      case 'updateReplicaAutoBalance':
        showUpdateReplicaAutoBalanceModal(selectedRows)
        break
      case 'updateUnmapMarkSnapChainRemoved':
        showBulkUnmapMarkSnapChainRemovedModal(selectedRows)
        break
      case 'updateReplicaSoftAntiAffinity':
        showUpdateReplicaSoftAntiAffinityModal(selectedRows)
        break
      case 'updateReplicaZoneSoftAntiAffinity':
        showUpdateReplicaZoneSoftAntiAffinityModal(selectedRows)
        break
      case 'updateReplicaDiskSoftAntiAffinity':
        showUpdateReplicaDiskSoftAntiAffinityModal(selectedRows)
        break
      case 'updateFreezeFilesystemForSnapshot':
        showUpdateBulkFreezeFilesystemForSnapshotModal(selectedRows)
        break
      case 'trimFilesystem':
        confirm({
          title: t('volumeBulkActions.trimConfirm', { volumes: selectedRows.map(item => item.name).join(', ') }),
          onOk() {
            trimBulkFilesystem(selectedRows)
          },
        })
        break
      case 'offlineReplicaRebuilding':
        toggleOfflineRebuildingModal(selectedRows)
        break
      case 'updateReplicaRebuildingBandwidthLimit':
        toggleReplicaRebuildingBandwidthLimitModal(selectedRows)
        break
      case 'updateUblkNumberOfQueue':
        toggleUblkParamsModal(selectedRows, 'ublkNumberOfQueue')
        break
      case 'updateUblkQueueDepth':
        toggleUblkParamsModal(selectedRows, 'ublkQueueDepth')
        break
      case 'rebuildConcurrentSyncLimit':
        toggleRebuildConcurrentSyncLimitModal(selectedRows)
        break
      default:
    }
  }
  const hasNonAttachedVolume = () => selectedRows.some(item => item.state !== 'attached')
  const hasAction = action => selectedRows.every(item => item.actions && Object.keys(item.actions).includes(action))
  const hasDoingState = (exclusions = []) => selectedRows.some(item => (item.state.endsWith('ing') && !exclusions.includes(item.state)) || item.currentImage !== item.image)
  const isSnapshotDisabled = () => selectedRows.every(item => !item.actions || !item.actions.snapshotCRCreate)
  const disableUpdateBulkReplicaCount = () => selectedRows.some(item => !item.actions || !item.actions.updateReplicaCount)
  const disableUpdateBulkDataLocality = () => selectedRows.some(item => !item.actions || !item.actions.updateDataLocality)
  const disableUpdateReplicaAutoBalance = () => selectedRows.some(item => !item.actions || !item.actions.updateReplicaAutoBalance)
  const disableUpdateAccessMode = () => selectedRows.some(item => (item.kubernetesStatus && item.kubernetesStatus.pvStatus) || !item.actions || !item.actions.updateAccessMode)
  const isHasStandy = () => selectedRows.some(item => item.standby)
  const canUpgradeEngine = () => selectedRows.some(item => (item.state !== 'detached' && item.state !== 'attached'))
  const isFaulted = () => selectedRows.some(item => item.robustness === 'faulted')
  const isHasPVC = () => selectedRows.some(item => item.kubernetesStatus && item.kubernetesStatus.pvStatus && item.kubernetesStatus.pvStatus === 'Bound')
  const hasVolumeRestoring = () => selectedRows.some((selected) => {
    return isRestoring(selected)
  })
  const isAutomaticallyUpgradeEngine = () => {
    return selectedRows.some((item) => {
      if (engineUpgradePerNodeLimit && engineUpgradePerNodeLimit.value !== '0') {
        let defaultEngineImage = engineImages.find(engineImage => engineImage.default)
        if (defaultEngineImage) {
          return item.image === defaultEngineImage.image
        }
        return true
      }
      return false
    })
  }
  const disableExpandVolume = () => selectedRows.some(item => item.conditions?.Scheduled?.status?.toLowerCase() !== 'true')
  const upgradingEngine = () => selectedRows.some((item) => item.currentImage !== item.image)
  const notAttached = () => selectedRows.some(item => item.state !== 'attached')
  /*
  * PV/PVC decides whether to disable it
  */
  const hasMoreOptions = () => engineImages.findIndex(engineImage => selectedRows.findIndex(item => item.image === engineImage.image) === -1) === -1
  const allActions = [
    { key: 'delete', name: t('volumeActions.actions.delete'), disabled() { return selectedRows.length === 0 } },
    { key: 'attach', name: t('volumeActions.actions.attach'), disabled() { return selectedRows.length === 0 || selectedRows.some((item) => !attachable(item)) } },
    { key: 'detach', name: t('volumeActions.actions.detach'), disabled() { return selectedRows.length === 0 || selectedRows.some((item) => !detachable(item)) } },
    { key: 'backup', name: t('volumeBulkActions.actions.createBackup'), disabled() { return selectedRows.length === 0 || hasNonAttachedVolume() || isSnapshotDisabled() || hasDoingState() || isHasStandy() || hasVolumeRestoring() || !backupTargetAvailable }, toolTip: backupTargetMessage },
    { key: 'bulkCloneVolume', name: t('volumeActions.actions.cloneVolume'), disabled() { return selectedRows.length === 0 || selectedRows.every(item => item.standby || isRestoring(item)) } },

  ]

  const allDropDownActions = [
    { key: 'upgrade', name: t('volumeBulkActions.actions.upgradeEngine'), disabled() { return selectedRows.length === 0 || isAutomaticallyUpgradeEngine() || !hasAction('engineUpgrade') || hasDoingState() || hasMoreOptions() || hasVolumeRestoring() || canUpgradeEngine() } },
    { key: 'expandVolume', name: t('volumeActions.actions.expandVolume'), disabled() { return selectedRows.length === 0 || disableExpandVolume() } },
    { key: 'updateBulkReplicaCount', name: t('volumeActions.actions.updateReplicaCount'), disabled() { return selectedRows.length === 0 || isHasStandy() || disableUpdateBulkReplicaCount() || upgradingEngine() } },
    { key: 'updateBulkDataLocality', name: t('volumeActions.actions.updateDataLocality'), disabled() { return selectedRows.length === 0 || isHasStandy() || disableUpdateBulkDataLocality() || upgradingEngine() } },
    { key: 'updateSnapshotDataIntegrity', name: t('volumeActions.actions.updateSnapshotDataIntegrity'), disabled() { return selectedRows.length === 0 } },
    { key: 'updateBulkAccessMode', name: t('volumeActions.actions.updateAccessMode'), disabled() { return selectedRows.length === 0 || isHasStandy() || disableUpdateAccessMode() } },
    { key: 'updateBulkBackupTarget', name: t('volumeActions.actions.updateBackupTarget'), disabled() { return selectedRows.length === 0 } },
    { key: 'updateReplicaAutoBalance', name: t('volumeActions.actions.updateReplicaAutoBalance'), disabled() { return selectedRows.length === 0 || disableUpdateReplicaAutoBalance() } },
    { key: 'createPVAndPVC', name: t('volumeActions.actions.pvAndpvcCreate'), disabled() { return selectedRows.length === 0 || isHasStandy() || hasVolumeRestoring() || isHasPVC() || isFaulted() || !hasAction('pvCreate') || !hasAction('pvcCreate') } },
    { key: 'bulkChangeVolume', name: t('volumeActions.actions.activateDisasterRecoveryVolume'), disabled() { return selectedRows.length === 0 || selectedRows.some((item) => !item.standby) } },
    { key: 'updateUnmapMarkSnapChainRemoved', name: t('volumeActions.actions.allowSnapshotsRemovalDuringTrim'), disabled() { return selectedRows.length === 0 } },
    { key: 'updateReplicaSoftAntiAffinity', name: t('volumeActions.actions.updateReplicaSoftAntiAffinity'), disabled() { return selectedRows.length === 0 } },
    { key: 'updateReplicaZoneSoftAntiAffinity', name: t('volumeActions.actions.updateReplicaZoneSoftAntiAffinity'), disabled() { return selectedRows.length === 0 } },
    { key: 'updateReplicaDiskSoftAntiAffinity', name: t('volumeActions.actions.updateReplicaDiskSoftAntiAffinity'), disabled() { return selectedRows.length === 0 } },
    { key: 'trimFilesystem', name: t('volumeActions.actions.trimFilesystem'), disabled() { return selectedRows.length === 0 || notAttached() } },
    { key: 'updateFreezeFilesystemForSnapshot', name: t('volumeActions.actions.updateFreezeFilesystemForSnapshot'), disabled() { return selectedRows.length === 0 } },
    { key: 'offlineReplicaRebuilding', name: t('volumeActions.actions.offlineReplicaRebuilding'), disabled() { return selectedRows.length === 0 || selectedRows.every((row) => !row.actions?.offlineReplicaRebuilding) } },
    { key: 'updateReplicaRebuildingBandwidthLimit', name: t('volumeActions.actions.updateReplicaRebuildingBandwidthLimit'), disabled() { return selectedRows.length === 0 || selectedRows.some((row) => row?.dataEngine === 'v1') } },
    { key: 'rebuildConcurrentSyncLimit', name: t('volumeBulkActions.actions.rebuildConcurrentSyncLimit'), disabled() { return selectedRows.length === 0 || selectedRows.some((row) => row?.dataEngine === 'v2') } },
  ]

  if (selectedRows.some((row) => row?.frontend === 'ublk')) {
    allDropDownActions.push({ key: 'updateUblkNumberOfQueue', name: t('volumeActions.actions.updateUblkNumberOfQueue'), disabled() { return selectedRows.every((row) => row.state !== 'detached') } })
    allDropDownActions.push({ key: 'updateUblkQueueDepth', name: t('volumeActions.actions.updateUblkQueueDepth'), disabled() { return selectedRows.every((row) => row.state !== 'detached') } })
  }

  const menu = (
      <Menu style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {allDropDownActions.map(item => (
          <Menu.Item key={item.key}>
            <Button
              style={{ width: '100%', textAlign: 'left' }}
              type="link"
              disabled={item.disabled()}
              onClick={() => handleClick(item.key)}
            >
              {item.name}
            </Button>
          </Menu.Item>
        ))}
      </Menu>
  )

  return (
    <div className={style.bulkActions}>
      { allActions.map(item => {
        return (
          <div key={item.key}>
            &nbsp;
            <Tooltip title={`${item.toolTip ? item.toolTip : ''}`}>
              <Button size="large" type="primary" disabled={item.disabled()} onClick={() => handleClick(item.key)}>{ item.name }</Button>
            </Tooltip>
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
  showBulkDetachHost: PropTypes.func,
  showBulkSalvage: PropTypes.func,
  bulkBackup: PropTypes.func,
  createPVAndPVC: PropTypes.func,
  bulkExpandVolume: PropTypes.func,
  showBulkCloneVolume: PropTypes.func,
  showUpdateBulkReplicaCount: PropTypes.func,
  showUpdateBulkDataLocality: PropTypes.func,
  showUpdateBulkBackupTarget: PropTypes.func,
  showUpdateBulkAccessMode: PropTypes.func,
  showUpdateBulkSnapshotDataIntegrityModal: PropTypes.func,
  showUpdateReplicaAutoBalanceModal: PropTypes.func,
  engineUpgradePerNodeLimit: PropTypes.object,
  backupTargetAvailable: PropTypes.bool,
  backupTargetMessage: PropTypes.string,
  commandKeyDown: PropTypes.bool,
  showBulkUnmapMarkSnapChainRemovedModal: PropTypes.func,
  trimBulkFilesystem: PropTypes.func,
  showUpdateBulkFreezeFilesystemForSnapshotModal: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(bulkActions)
