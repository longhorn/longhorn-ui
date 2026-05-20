import React from 'react'
import PropTypes from 'prop-types'
import { Alert, Icon, Tag, Progress, Tooltip } from 'antd'
import { formatDate } from '../../../utils/formatDate'
import classnames from 'classnames'
import { formatMib } from '../../../utils/formatter'
import {
  isSchedulingFailure,
  getHealthState,
  needToWaitDone,
  frontends,
  extractImageVersion,
} from '../helper/index'
import styles from './VolumeInfo.less'
import { diskTagColor, nodeTagColor } from '../../../utils/constants'
import { EngineImageUpgradeTooltip, ReplicaHATooltip } from '../../../components'
import ConditionTooltip from './ConditionTooltip'
import { isVolumeImageUpgradable, isVolumeReplicaNotRedundancy, isVolumeRelicaLimited } from '../../../utils/filter'
import { withTranslation } from 'react-i18next'


function VolumeInfo({ t, selectedVolume, snapshotModalState, engineImages, hosts, currentBackingImage, snapshotWarningThreshold }) {
  let errorMsg = null
  const state = snapshotModalState

  const attchedNodeIsDown = selectedVolume.state === 'attached' && selectedVolume.robustness === 'unknown' && hosts && hosts.some((host) => {
    return selectedVolume.controllers && selectedVolume.controllers[0] && host.id === selectedVolume.controllers[0].hostId && host.conditions && host.conditions.Ready && host.conditions.Ready.status === 'False'
  })

  const dataLocalityWarn = selectedVolume.dataLocality === 'best-effort' && selectedVolume.state === 'attached' && selectedVolume.replicas && selectedVolume.replicas.every((item) => {
    let attachedNode = selectedVolume.controllers && selectedVolume.controllers[0] && selectedVolume.controllers[0].hostId ? selectedVolume.controllers[0].hostId : ''

    return item.hostId !== attachedNode
  })

  if (isSchedulingFailure(selectedVolume)) {
    const scheduledConditions = selectedVolume?.conditions?.Scheduled
    if (scheduledConditions) {
      const { reason, message } = scheduledConditions
      errorMsg = (
        <Alert
          message={t('volumeInfo.alerts.schedulingFailure.title')}
          description={
            <div>
              {reason && <div>{reason.replace(/([A-Z])/g, ' $1')}</div>}
              {message && <div>{`${t('volumeInfo.alerts.schedulingFailure.errorMessage')}: ${message}`}</div>}
            </div>
          }
          type="warning"
          className="ant-alert-error"
          showIcon
        />
      )
    }
  }

  const computeActualSize = selectedVolume && selectedVolume.controllers && selectedVolume.controllers[0] && selectedVolume.controllers[0].actualSize ? selectedVolume.controllers[0].actualSize : ''
  const defaultImage = engineImages.find(image => image.default === true)
  const healthState = getHealthState(selectedVolume.robustness)
  const accessModeObject = {
    rwo: 'ReadWriteOnce',
    rwop: 'ReadWriteOncePod',
    rwx: 'ReadWriteMany',
  }
  let upgrade = ''
  let ha = ''
  if (isVolumeImageUpgradable(selectedVolume, defaultImage)) {
    const currentVersion = extractImageVersion(selectedVolume.currentImage)
    const latestVersion = extractImageVersion(defaultImage.image)
    upgrade = (<EngineImageUpgradeTooltip currentVersion={currentVersion} latestVersion={latestVersion} />)
  }
  if (isVolumeReplicaNotRedundancy(selectedVolume)) {
    ha = (<ReplicaHATooltip type="danger" />)
  } else if (isVolumeRelicaLimited(selectedVolume)) {
    ha = (<ReplicaHATooltip type="warning" />)
  }
  let podList = ''
  if (selectedVolume.kubernetesStatus.workloadsStatus) {
    podList = selectedVolume.kubernetesStatus.workloadsStatus.map((item, index) => {
      return (
        <div key={index} style={{ border: '1px solid #f4f4f4', marginBottom: '10px' }}>
          <div className={styles.row}>
            <span className={styles.label}>{selectedVolume.kubernetesStatus.lastPodRefAt ? t('volumeInfo.kubernetesStatus.lastPodName') : t('volumeInfo.kubernetesStatus.podName')}</span>
            {item.podName}
          </div>
          {!selectedVolume.kubernetesStatus.lastPodRefAt ? <div className={styles.row}>
              <span className={styles.label}>{t('volumeInfo.kubernetesStatus.podStatus')}</span>
              {item.podStatus}
            </div> : ''
          }
          <div className={styles.row}>
            <span className={styles.label}>{selectedVolume.kubernetesStatus.lastPodRefAt ? t('volumeInfo.kubernetesStatus.lastWorkloadName') : t('volumeInfo.kubernetesStatus.workloadName')}</span>
            {item.workloadName}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{selectedVolume.kubernetesStatus.lastPodRefAt ? t('volumeInfo.kubernetesStatus.lastWorkloadType') : t('volumeInfo.kubernetesStatus.workloadType')}</span>
            {item.workloadType}
          </div>
        </div>
      )
    })
  }

  let forMapNode = (tag, index) => {
    return (
      <Tag key={index} color={nodeTagColor}>
        {tag}
      </Tag>
    )
  }

  let forMapDisk = (tag, index) => {
    return (
      <Tag key={index} color={diskTagColor}>
        {tag}
      </Tag>
    )
  }
  let tagDiskChild = ''
  if (selectedVolume.diskSelector) {
    tagDiskChild = selectedVolume.diskSelector.map(forMapDisk)
  }

  let tagNodeChild = ''
  if (selectedVolume.diskSelector && selectedVolume.nodeSelector) {
    tagNodeChild = selectedVolume.nodeSelector.map(forMapNode)
  }

  // resorting progress
  let restoreProgress = null
  if (selectedVolume.restoreStatus && selectedVolume.restoreStatus.length > 0) {
    let total = 0
    let restoreErrorMsg = ''
    let isRestoring = false
    selectedVolume.restoreStatus.forEach((ele) => {
      if (ele.error) {
        restoreErrorMsg = ele.error
      }
      if (ele.isRestoring) {
        isRestoring = ele.isRestoring
      }
      total += ele.progress
    })
    let progress = Math.floor(total / selectedVolume.restoreStatus.length)

    if (!isRestoring && !restoreErrorMsg) {
      restoreProgress = ''
    } else if (isRestoring && !restoreErrorMsg) {
      restoreProgress = <div className={styles.row} style={{ display: 'flex' }}><span className={styles.label}>{t('volumeInfo.restoring.label')}</span> <div style={{ width: '80%' }}> <Progress percent={progress} /> </div></div>
    } else {
      restoreProgress = <div className={styles.row} style={{ display: 'flex' }}><span className={styles.label}>{t('volumeInfo.restoring.label')}</span> <div style={{ width: '80%' }}><Tooltip title={restoreErrorMsg}><Progress status="exception" percent={progress} /></Tooltip></div> </div>
    }
  }

  const volumeSizeEle = () => {
    let expectedSize = selectedVolume.size
    let currentSize = selectedVolume?.controllers[0]?.size ?? ''
    let isExpanding = selectedVolume?.controllers[0] && parseInt(expectedSize, 10) !== parseInt(currentSize, 10) && selectedVolume.state === 'attached' && parseInt(currentSize, 10) !== 0
    // The expected size of engine should not be smaller than the current size.
    let expandingFailed = isExpanding && selectedVolume?.controllers[0]?.lastExpansionError !== ''
    let message = ''
    if (expandingFailed) {
      message = (<div>
        <div>{t('volumeInfo.volumeSize.expansionError')}: {selectedVolume.controllers[0].lastExpansionError}</div>
        <div>{t('volumeInfo.volumeSize.expansionNote')}</div>
      </div>)
    } else if (isExpanding) {
      message = t('volumeInfo.volumeSize.expansionInProgress', { currentSize: formatMib(currentSize), expectedSize: formatMib(expectedSize) })
    }

    return (
      <div style={{ display: 'inline-block' }}>
        {isExpanding && !expandingFailed ? <Tooltip title={message}>
          <div style={{ position: 'relative', color: 'rgb(16, 142, 233)' }}>
            <div className={styles.expendVolumeIcon}>
              <Icon type="loading" />
            </div>
            <div style={{ fontSize: '20px' }}>
              <Icon type="arrows-alt" style={{ transform: 'rotate(45deg)' }} />
            </div>
          </div>
        </Tooltip> : <Tooltip title={message}>
          <div className={expandingFailed ? 'error' : ''}>
            {expandingFailed ? <div>
              <Icon style={{ fontSize: '20px', marginRight: '15px' }} type="info-circle" />
              <div className={'error'} style={{ position: 'relative', display: 'inline-block' }}>
                <div className={styles.expendVolumeIcon}>
                  <Icon type="loading" />
                </div>
                <div style={{ fontSize: '20px' }}>
                  <Icon type="arrows-alt" style={{ transform: 'rotate(45deg)' }} />
                </div>
              </div>
            </div> : formatMib(expectedSize)}
          </div>
        </Tooltip>}
      </div>
    )
  }

  const addGlobalSettingDescription = (text) => {
    if (text) {
      return (
        <Tooltip title={text === 'ignored' ? t('volumeInfo.globalSettingTooltip') : ''}>{text}</Tooltip>
      )
    }
    return text
  }

  const renderLabelTooltip = (title) => (
    <Tooltip overlayClassName={styles.labelTooltip} title={title}>
      <Icon type="info-circle" />
    </Tooltip>
  )

  return (
    <div>
      {errorMsg}
      {restoreProgress}
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.state.label')}</span>
        <span className={classnames({ [selectedVolume.state.toLowerCase()]: true, capitalize: true }, styles.volumeState)}>
          {upgrade} {selectedVolume.state.hyphenToHump()} {needToWaitDone(selectedVolume.state, selectedVolume.replicas) ? <Icon type="loading" /> : null}
        </span>
      </div>
      <div className={styles.row} style={{ display: 'flex', alignItems: 'center' }}>
        <span className={styles.label}>{t('volumeInfo.health.label')}</span>
        {attchedNodeIsDown ? <Tooltip title={t('volumeInfo.health.attachedNodeDown')}><Icon className="faulted" style={{ transform: 'rotate(45deg)', marginRight: 8 }} type="api" /></Tooltip> : ''}
        <span className={classnames({ [selectedVolume.robustness.toLowerCase()]: true, capitalize: true }, styles.volumeState)}>
          {ha} {healthState}
        </span>
        {dataLocalityWarn ? <Tooltip title={t('volumeInfo.health.dataLocalityWarning')}><Icon style={{ fontSize: '16px', marginLeft: 6 }} className="color-warning" type="warning" /></Tooltip> : ''}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.readyForWorkload.label')}</span>
        {selectedVolume.ready ? <span className="healthy">{t('volumeInfo.readyForWorkload.ready')}</span> : <Tooltip title={t('volumeInfo.readyForWorkload.notReadyTooltip', { robustness: selectedVolume.robustness === 'faulted' ? t('volumeInfo.readyForWorkload.volumeFaulted') : t('volumeInfo.readyForWorkload.volumeUnderMaintenance') })}><span className="faulted">{t('volumeInfo.readyForWorkload.notReady')}</span></Tooltip>}
      </div>
      <div className={styles.row}>
        <div className={styles.formItem} style={{ display: 'flex' }}>
          <span className={styles.label}>
            {t('volumeInfo.conditions.label')}
          </span>
          <div className={styles.control} style={{ display: 'flex' }}>
            {selectedVolume?.conditions
              && ['Restore', 'Scheduled', 'TooManySnapshots', 'OfflineRebuilding']
                .filter((key) => selectedVolume.conditions[key])
                .map((key) => (
                  <ConditionTooltip
                    key={key}
                    selectedVolume={selectedVolume}
                    conditionKey={key}
                    snapshotWarningThreshold={snapshotWarningThreshold}
                  />
                ))}
          </div>
        </div>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('common.frontend')}:</span>
        {selectedVolume.disableFrontend ? <Tooltip title={t('volumeInfo.frontend.disabledTooltip')}>
            <Icon type="disconnect" className="healthy" />
          </Tooltip> : (frontends.find(item => item.value === selectedVolume.frontend) || '').label}
      </div>
      {selectedVolume.frontend === 'ublk' && (
        <>
          <div className={styles.row}>
            <span className={styles.label}>{t('volumeInfo.ublk.numberOfQueues')}</span>
            {selectedVolume.ublkNumberOfQueue}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('volumeInfo.ublk.queueDepth')}</span>
            {selectedVolume.ublkQueueDepth}
          </div>
        </>
      )}
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.backupTarget.label')}</span>
        {selectedVolume.backupTargetName || ''}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('columns.backupBlockSize')}:</span>
        {formatMib(selectedVolume.backupBlockSize)}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('columns.dataEngine')}:</span>
        {selectedVolume.dataEngine}
      </div>
      {!selectedVolume.disableFrontend ? <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.attachedNodeAndEndpoint.label')}</span>
        {selectedVolume.controllers ? selectedVolume.controllers.filter(item => item.hostId !== '' && item.endpoint !== '').map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px' }} key={item.hostId}>{item.hostId} <br /> <span style={{ backgroundColor: '#f2f4f5' }}> {item.endpoint} </span></div>) : ''}
      </div> : <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.attachedNode.label')}</span>
        {selectedVolume.controllers ? selectedVolume.controllers.filter(item => item.hostId !== '').map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px' }} key={item.hostId}>{item.hostId}</div>) : ''}
      </div>}
      <div className={styles.row}>
        <span className={styles.label}>
          <span>{t('columns.size')}</span>
          {renderLabelTooltip(t('volumeInfo.size.tooltip'))}
          <span>:</span>
        </span>
        {volumeSizeEle()}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>
          <span>{t('volumeInfo.actualSize.label')}</span>
          {renderLabelTooltip(t('volumeInfo.actualSize.tooltip'))}
          <span>:</span>
        </span>
        {state ? formatMib(computeActualSize) : t('volumeInfo.actualSize.unknown')}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.dataLocality.label')}</span>
        {selectedVolume.dataLocality}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('columns.accessMode')}:</span>
        {accessModeObject[selectedVolume.accessMode] ? accessModeObject[selectedVolume.accessMode] : ''}
      </div>
      {currentBackingImage ? <div>
        <div className={styles.row}>
          <span className={styles.label}>{t('common.backingImage')}:</span>
          {selectedVolume.backingImage}
        </div>
        <div className={styles.row}>
          <span className={styles.label}>{t('volumeInfo.backingImageSize.label')}</span>
          {formatMib(currentBackingImage.size)}
        </div>
      </div> : ''}
      <div className={styles.row}>
        <span className={styles.label}>
          <span>{t('volumeInfo.engineImage.label')}</span>
          {renderLabelTooltip(t('volumeInfo.engineImage.tooltip'))}
          <span>:</span>
        </span>
        {selectedVolume.image}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.created.label')}</span>
        {formatDate(selectedVolume.created)}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('common.encrypted')}:</span>
        {String(selectedVolume.encrypted).firstUpperCase()}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.nodeTags.label')}</span>
        {tagNodeChild}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.diskTags.label')}</span>
        {tagDiskChild}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.lastBackup.label')}</span>
        {selectedVolume.lastBackup}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.lastBackupAt.label')}</span>
        {selectedVolume.lastBackupAt ? formatDate(selectedVolume.lastBackupAt) : ''}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.replicaAutoBalance.label')}</span>
        {addGlobalSettingDescription(selectedVolume?.replicaAutoBalance)}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.snapshotDataIntegrity.label')}</span>
        {addGlobalSettingDescription(selectedVolume?.snapshotDataIntegrity)}
      </div>
       <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.snapshotMaxCount.label')}</span>
        {selectedVolume.snapshotMaxCount}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.snapshotMaxSize.label')}</span>
        {formatMib(selectedVolume.snapshotMaxSize)}
      </div>
      {
        selectedVolume.dataEngine === 'v1' && (
          <div className={styles.row}>
            <span className={styles.label}>{t('createVolume.fields.rebuildConcurrentSyncLimit')}:</span>
            {selectedVolume.rebuildConcurrentSyncLimit}
          </div>
        )
      }
      <div className={styles.row}>
        <span className={styles.label}>
          <span>{t('volumeInfo.instanceManager.label')}</span>
          {renderLabelTooltip(t('volumeInfo.instanceManager.tooltip'))}
          <span>:</span>
        </span>
        {selectedVolume.controllers ? selectedVolume.controllers.filter(item => item.instanceManagerName !== '').map(item => <div key={item.hostId} style={{ fontFamily: 'monospace', margin: '2px 0px' }}> <span style={{ backgroundColor: '#f2f4f5' }}> {item.instanceManagerName} </span></div>) : ''}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.allowSnapshotsRemovalDuringTrim.label')}</span>
        {addGlobalSettingDescription(selectedVolume?.unmapMarkSnapChainRemoved)}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.replicaSoftAntiAffinity.label')}</span>
        {selectedVolume?.replicaSoftAntiAffinity}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.replicaZoneSoftAntiAffinity.label')}</span>
        {selectedVolume?.replicaZoneSoftAntiAffinity}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.replicaDiskSoftAntiAffinity.label')}</span>
        {selectedVolume?.replicaDiskSoftAntiAffinity}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.freezeFilesystemForSnapshot.label')}</span>
        {addGlobalSettingDescription(selectedVolume?.freezeFilesystemForSnapshot)}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('volumeInfo.offlineReplicaRebuilding.label')}</span>
        {selectedVolume?.offlineRebuilding}
      </div>
      {
        selectedVolume.dataEngine === 'v2' && (
          <div className={styles.row}>
            <span className={styles.label}>{t('volumeInfo.replicaRebuildingBandwidthLimit.label')}</span>
            {selectedVolume?.replicaRebuildingBandwidthLimit}
          </div>
        )
      }
      { selectedVolume.kubernetesStatus ? <div>
          { selectedVolume.kubernetesStatus.lastPVCRefAt ? <div className={styles.row}>
              <span className={styles.label}>{t('volumeInfo.kubernetesStatus.lastTimeBoundWithPVC')}</span>
              {selectedVolume.kubernetesStatus.lastPVCRefAt ? formatDate(selectedVolume.kubernetesStatus.lastPVCRefAt) : ''}
            </div> : ''
          }
          {selectedVolume.kubernetesStatus.lastPodRefAt ? <div className={styles.row}>
              <span className={styles.label}>{t('volumeInfo.kubernetesStatus.lastTimeUsedByPod')}</span>
              {selectedVolume.kubernetesStatus.lastPodRefAt ? formatDate(selectedVolume.kubernetesStatus.lastPodRefAt) : ''}
            </div> : ''
          }
          <div className={styles.row}>
            <span className={styles.label}>{ selectedVolume.kubernetesStatus.lastPVCRefAt ? t('volumeInfo.kubernetesStatus.lastNamespace') : t('volumeInfo.kubernetesStatus.namespace')}</span>
            {selectedVolume.kubernetesStatus.namespace}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{ selectedVolume.kubernetesStatus.lastPVCRefAt ? t('volumeInfo.kubernetesStatus.lastBoundedPVCName') : t('volumeInfo.kubernetesStatus.pvcName')}</span>
            {selectedVolume.kubernetesStatus.pvcName}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('volumeInfo.kubernetesStatus.pvName')}</span>
            {selectedVolume.kubernetesStatus.pvName}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('volumeInfo.kubernetesStatus.pvStatus')}</span>
            {selectedVolume.kubernetesStatus.pvStatus}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('volumeInfo.revisionCounterDisabled.label')}</span>
            {selectedVolume.revisionCounterDisabled ? t('common.true') : t('common.false')}
          </div>
          {podList}
        </div>
        : ''
      }
    </div>
  )
}

VolumeInfo.propTypes = {
  t: PropTypes.func,
  backupStatus: PropTypes.object,
  selectedVolume: PropTypes.object,
  queryBackupStatus: PropTypes.func,
  clearBackupStatus: PropTypes.func,
  snapshotModal: PropTypes.object,
  snapshotModalState: PropTypes.bool,
  engineImages: PropTypes.array,
  snapshotWarningThreshold: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentBackingImage: PropTypes.object,
  hosts: PropTypes.array,
}

export default withTranslation()(VolumeInfo)
