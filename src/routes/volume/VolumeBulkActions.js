import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Menu, Dropdown, Icon, Tooltip } from 'antd'
import { detachable, attachable, isRestoring } from './helper'
import style from './VolumeBulkActions.less'

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
  showUpdateBulkSnapshotDataIntegrityModal,
  showUpdateReplicaSoftAntiAffinityModal,
  showUpdateReplicaZoneSoftAntiAffinityModal,
  showUpdateReplicaDiskSoftAntiAffinityModal,
  showUpdateBulkFreezeFilesystemForSnapshotModal,
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
          <div style={{ paddingLeft: '10px' }}>PV Name: {item.kubernetesStatus.pvName}</div>
          { !item.kubernetesStatus.lastPVCRefAt && item.kubernetesStatus.pvcName ? <div style={{ paddingLeft: '10px' }}>PVC Name: {item.kubernetesStatus.pvcName}</div> : ''}
        </div>))
        hasPVRows.push(item.name)
      }
      if (item.kubernetesStatus && item.kubernetesStatus.workloadsStatus && !item.kubernetesStatus.lastPodRefAt && item.kubernetesStatus.workloadsStatus.length > 0) {
        workloadResources.push((<div>
          <div style={{ margin: '10px 0px', color: '#b7b7b7' }}>{item.kubernetesStatus.workloadsStatus.map((ele, i) => {
            return (<div key={i} style={{ paddingLeft: '10px' }}>Pod Name: {ele.podName} ({ele.podStatus})</div>)
          })}</div>
        </div>))
        hasWorkloadsRows.push(item.name)
      }
      if (item.state === 'attached') {
        hasVolumeAttachedRows.push(item.name)
      }
    })
    return (<div>
      {hasVolumeAttachedRows.length > 0 ? <div>{`Some of the selected volumes (${hasVolumeAttachedRows.map(item => item).join(', ')}) are attached to a node and may cause errors in any applications using them once they are deleted.`}</div> : ''}
      {workloadResources.length > 0 ? <div>{ `Some of the selected volumes (${hasWorkloadsRows.map(item => item).join(', ')}) have workloads associated with them which may encounter errors once the volume(s) are deleted:` }</div> : '' }
      {workloadResources.map((item, i) => <div key={i}>{item}</div>)}
      {pvResources.length > 0 ? <div>{ `The following resources (PersistentVolumes and PersistentVolumeClaims) associated with these volumes(s) (${hasPVRows.map(item => item).join(', ')}) will be deleted:` }</div> : ''}
      {pvResources.map((item, i) => <div key={i}>{item}</div>)}
      <div style={{ marginTop: 10 }}>{`Are you sure you want to delete volume(s) (${rows.map(item => item.name).join(', ')}) ?`} </div>
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
          title: `Are you sure you want to trim (${selectedRows.map(item => item.name).join(', ')}) Filesystem ?`,
          onOk() {
            trimBulkFilesystem(selectedRows)
          },
        })
        break
      default:
    }
  }
  const hasAction = action => selectedRows.every(item => Object.keys(item.actions).includes(action))
  const hasDoingState = (exclusions = []) => selectedRows.some(item => (item.state.endsWith('ing') && !exclusions.includes(item.state)) || item.currentImage !== item.image)
  const isSnapshotDisabled = () => selectedRows.every(item => !item.actions || !item.actions.snapshotCreate)
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
  const conditionsScheduled = () => selectedRows.some(item => item.conditions && item.conditions.Scheduled && item.conditions.Scheduled.status && item.conditions.Scheduled.status.toLowerCase() === 'true')
  const upgradingEngine = () => selectedRows.some((item) => item.currentImage !== item.image)
  const notAttached = () => selectedRows.some(item => item.state !== 'attached')
  /*
  * PV/PVC decides whether to disable it
  */
  const hasMoreOptions = () => engineImages.findIndex(engineImage => selectedRows.findIndex(item => item.image === engineImage.image) === -1) === -1
  const allActions = [
    { key: 'delete', name: 'Delete', disabled() { return selectedRows.length === 0 } },
    { key: 'attach', name: 'Attach', disabled() { return selectedRows.length === 0 || selectedRows.some((item) => !attachable(item)) } },
    { key: 'detach', name: 'Detach', disabled() { return selectedRows.length === 0 || selectedRows.some((item) => !detachable(item)) } },
    { key: 'backup', name: 'Create Backup', disabled() { return selectedRows.length === 0 || isSnapshotDisabled() || hasDoingState() || isHasStandy() || hasVolumeRestoring() || !backupTargetAvailable }, toolTip: backupTargetMessage },
    { key: 'bulkCloneVolume', name: 'Clone Volume', disabled() { return selectedRows.length === 0 || selectedRows.every(item => item.standby || isRestoring(item)) } },

  ]

  const allDropDownActions = [
    { key: 'upgrade', name: 'Upgrade Engine', disabled() { return selectedRows.length === 0 || isAutomaticallyUpgradeEngine() || !hasAction('engineUpgrade') || hasDoingState() || hasMoreOptions() || hasVolumeRestoring() || canUpgradeEngine() } },
    { key: 'expandVolume', name: 'Expand Volume', disabled() { return selectedRows.length === 0 || !conditionsScheduled() } },
    { key: 'updateBulkReplicaCount', name: 'Update Replicas Count', disabled() { return selectedRows.length === 0 || isHasStandy() || disableUpdateBulkReplicaCount() || upgradingEngine() } },
    { key: 'updateBulkDataLocality', name: 'Update Data Locality', disabled() { return selectedRows.length === 0 || isHasStandy() || disableUpdateBulkDataLocality() || upgradingEngine() } },
    { key: 'updateSnapshotDataIntegrity', name: 'Snapshot Data Integrity', disabled() { return selectedRows.length === 0 } },
    { key: 'updateBulkAccessMode', name: 'Update Access Mode', disabled() { return selectedRows.length === 0 || isHasStandy() || disableUpdateAccessMode() } },
    { key: 'updateReplicaAutoBalance', name: 'Update Replicas Auto Balance', disabled() { return selectedRows.length === 0 || disableUpdateReplicaAutoBalance() } },
    { key: 'createPVAndPVC', name: 'Create PV/PVC', disabled() { return selectedRows.length === 0 || isHasStandy() || hasVolumeRestoring() || isHasPVC() || isFaulted() || !hasAction('pvCreate') || !hasAction('pvcCreate') } },
    { key: 'bulkChangeVolume', name: 'Activate Disaster Recovery Volume', disabled() { return selectedRows.length === 0 || selectedRows.some((item) => !item.standby) } },
    { key: 'updateUnmapMarkSnapChainRemoved', name: 'Allow snapshots removal during trim', disabled() { return selectedRows.length === 0 } },
    { key: 'updateReplicaSoftAntiAffinity', name: 'Update Replica Soft Anti Affinity', disabled() { return selectedRows.length === 0 } },
    { key: 'updateReplicaZoneSoftAntiAffinity', name: 'Update Replica Zone Soft Anti Affinity', disabled() { return selectedRows.length === 0 } },
    { key: 'updateReplicaDiskSoftAntiAffinity', name: 'Update Replica Disk Soft Anti Affinity', disabled() { return selectedRows.length === 0 } },
    { key: 'trimFilesystem', name: 'Trim Filesystem', disabled() { return selectedRows.length === 0 || notAttached() } },
    { key: 'updateFreezeFilesystemForSnapshot', name: 'Update Freeze Filesystem For Snapshot', disabled() { return selectedRows.length === 0 } },
  ]

  const menu = (<Menu>
    {
      allDropDownActions.map((item) => {
        return (<Menu.Item key={item.key}>
          <Button style={{ width: '100%', textAlign: 'left' }} size="large" type="link" disabled={item.disabled()} onClick={() => handleClick(item.key)}>{ item.name }</Button>
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
}

export default bulkActions
