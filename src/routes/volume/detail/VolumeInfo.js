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


function VolumeInfo({ selectedVolume, snapshotModalState, engineImages, hosts, currentBackingImage }) {
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
          message="Scheduling Failure"
          description={
            <div>
              {reason && <div>{reason.replace(/([A-Z])/g, ' $1')}</div>}
              {message && <div>{`Error Message: ${message}`}</div>}
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
            <span className={styles.label}>{selectedVolume.kubernetesStatus.lastPodRefAt ? 'Last ' : ''} Pod Name:</span>
            {item.podName}
          </div>
          {!selectedVolume.kubernetesStatus.lastPodRefAt ? <div className={styles.row}>
              <span className={styles.label}> Pod Status:</span>
              {item.podStatus}
            </div> : ''
          }
          <div className={styles.row}>
            <span className={styles.label}>{selectedVolume.kubernetesStatus.lastPodRefAt ? 'Last ' : ''} Workload Name:</span>
            {item.workloadName}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{selectedVolume.kubernetesStatus.lastPodRefAt ? 'Last ' : ''} Workload Type:</span>
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
      restoreProgress = <div className={styles.row} style={{ display: 'flex' }}><span className={styles.label}> Restoring:</span> <div style={{ width: '80%' }}> <Progress percent={progress} /> </div></div>
    } else {
      restoreProgress = <div className={styles.row} style={{ display: 'flex' }}><span className={styles.label}> Restoring:</span> <div style={{ width: '80%' }}><Tooltip title={restoreErrorMsg}><Progress status="exception" percent={progress} /></Tooltip></div> </div>
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
        <div>Expansion Error: {selectedVolume.controllers[0].lastExpansionError}</div>
        <div>Note: You can cancel the expansion to avoid volume crash</div>
      </div>)
    } else if (isExpanding) {
      message = `The volume is in expansion progress from size ${formatMib(currentSize)} to size ${formatMib(expectedSize)}`
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
        <Tooltip title={text === 'ignored' ? 'The is the default option that instructs Longhorn to inherit from the global setting.' : ''}>{text}</Tooltip>
      )
    }
    return text
  }

  return (
    <div>
      {errorMsg}
      {restoreProgress}
      <div className={styles.row}>
        <span className={styles.label}> State:</span>
        <span className={classnames({ [selectedVolume.state.toLowerCase()]: true, capitalize: true }, styles.volumeState)}>
          {upgrade} {selectedVolume.state.hyphenToHump()} {needToWaitDone(selectedVolume.state, selectedVolume.replicas) ? <Icon type="loading" /> : null}
        </span>
      </div>
      <div className={styles.row} style={{ display: 'flex', alignItems: 'center' }}>
        <span className={styles.label}> Health:</span>
        {attchedNodeIsDown ? <Tooltip title={'The attached node is down'}><Icon className="faulted" style={{ transform: 'rotate(45deg)', marginRight: 8 }} type="api" /></Tooltip> : ''}
        <span className={classnames({ [selectedVolume.robustness.toLowerCase()]: true, capitalize: true }, styles.volumeState)}>
          {ha} {healthState}
        </span>
        {dataLocalityWarn ? <Tooltip title={'Volume does not have data locality! There is no healthy replica on the same node as the engine'}><Icon style={{ fontSize: '16px', marginLeft: 6 }} className="color-warning" type="warning" /></Tooltip> : ''}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Ready for workload:</span>
        {selectedVolume.ready ? <span className="healthy">Ready</span> : <Tooltip title={`Not ready for workload. ${selectedVolume.robustness === 'faulted' ? 'Volume Faulted' : 'Volume may be under maintenance or in the restore process.'} `}><span className="faulted">Not Ready</span></Tooltip>}
      </div>
      <div className={styles.row}>
        <div className={styles.formItem} style={{ display: 'flex' }}>
          <span className={styles.label}>
            Conditions:
          </span>
          <div className={styles.control} style={{ display: 'flex' }}>
            {selectedVolume && selectedVolume.conditions && Object.keys(selectedVolume.conditions).filter((key) => ['Restore', 'Scheduled', 'TooManySnapshots'].includes(key)).map((key) => <ConditionTooltip key={key} selectedVolume={selectedVolume} conditionKey={key} />)}
          </div>
        </div>
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Frontend:</span>
        {selectedVolume.disableFrontend ? <Tooltip title={'Attach volume without enabling frontend. Volume data will not be accessible while attached.'}>
            <Icon type="disconnect" className="healthy" />
          </Tooltip> : (frontends.find(item => item.value === selectedVolume.frontend) || '').label}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Data Engine:</span>
        {selectedVolume.dataEngine}
      </div>
      {!selectedVolume.disableFrontend ? <div className={styles.row}>
        <span className={styles.label}> Attached Node &amp; Endpoint:</span>
        {selectedVolume.controllers ? selectedVolume.controllers.filter(item => item.hostId !== '' && item.endpoint !== '').map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px' }} key={item.hostId}>{item.hostId} <br /> <span style={{ backgroundColor: '#f2f4f5' }}> {item.endpoint} </span></div>) : ''}
      </div> : <div className={styles.row}>
        <span className={styles.label}> Attached Node:</span>
        {selectedVolume.controllers ? selectedVolume.controllers.filter(item => item.hostId !== '').map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px' }} key={item.hostId}>{item.hostId}</div>) : ''}
      </div>}
      <div className={styles.row}>
        <span className={styles.label}> Size:</span>
        {/* {formatMib(selectedVolume.size)} */}
        {volumeSizeEle()}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Actual Size:</span>
        {state ? formatMib(computeActualSize) : 'Unknown'}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Data Locality:</span>
        {selectedVolume.dataLocality}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Access Mode:</span>
        {accessModeObject[selectedVolume.accessMode] ? accessModeObject[selectedVolume.accessMode] : ''}
      </div>
      {currentBackingImage ? <div>
        <div className={styles.row}>
          <span className={styles.label}> Backing Image:</span>
          {selectedVolume.backingImage}
        </div>
        <div className={styles.row}>
          <span className={styles.label}> Backing Image Size:</span>
          {formatMib(currentBackingImage.size)}
        </div>
      </div> : ''}
      <div className={styles.row}>
        <Tooltip title={'Provides the binary to start and communicate with the volume engine/replicas.'}>
          <span className={styles.label}> Engine Image:</span>
        </Tooltip>
        {selectedVolume.image}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Created:</span>
        {formatDate(selectedVolume.created)}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Encrypted:</span>
        {String(selectedVolume.encrypted).firstUpperCase()}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Node Tags:</span>
        {tagNodeChild}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Disk Tags:</span>
        {tagDiskChild}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Last Backup:</span>
        {selectedVolume.lastBackup}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Last Backup At:</span>
        {selectedVolume.lastBackupAt ? formatDate(selectedVolume.lastBackupAt) : ''}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Replicas Auto Balance:</span>
        {addGlobalSettingDescription(selectedVolume?.replicaAutoBalance)}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Snapshot Data Integrity:</span>
        {addGlobalSettingDescription(selectedVolume?.snapshotDataIntegrity)}
      </div>
       <div className={styles.row}>
        <span className={styles.label}> Snapshot Max Count:</span>
        {selectedVolume.snapshotMaxCount}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Snapshot Max Size:</span>
        {formatMib(selectedVolume.snapshotMaxSize)}
      </div>
      <div className={styles.row}>
        <Tooltip title={'Manages the engine/replica instances’ life cycle on the node.'}>
          <span className={styles.label}> Instance Manager:</span>
        </Tooltip>
        {selectedVolume.controllers ? selectedVolume.controllers.filter(item => item.instanceManagerName !== '').map(item => <div key={item.hostId} style={{ fontFamily: 'monospace', margin: '2px 0px' }}> <span style={{ backgroundColor: '#f2f4f5' }}> {item.instanceManagerName} </span></div>) : ''}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Allow snapshots removal during trim:</span>
        {addGlobalSettingDescription(selectedVolume?.unmapMarkSnapChainRemoved)}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Replica Soft Anti Affinity:</span>
        {selectedVolume?.replicaSoftAntiAffinity}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Replica Zone Soft Anti Affinity:</span>
        {selectedVolume?.replicaZoneSoftAntiAffinity}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Replica Disk Soft Anti Affinity:</span>
        {selectedVolume?.replicaDiskSoftAntiAffinity}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Freeze Filesystem For Snapshot:</span>
        {addGlobalSettingDescription(selectedVolume?.freezeFilesystemForSnapshot)}
      </div>
      { selectedVolume.kubernetesStatus ? <div>
          { selectedVolume.kubernetesStatus.lastPVCRefAt ? <div className={styles.row}>
              <span className={styles.label}> Last time bound with PVC:</span>
              {selectedVolume.kubernetesStatus.lastPVCRefAt ? formatDate(selectedVolume.kubernetesStatus.lastPVCRefAt) : ''}
            </div> : ''
          }
          {selectedVolume.kubernetesStatus.lastPodRefAt ? <div className={styles.row}>
              <span className={styles.label}> Last time used by Pod:</span>
              {selectedVolume.kubernetesStatus.lastPodRefAt ? formatDate(selectedVolume.kubernetesStatus.lastPodRefAt) : ''}
            </div> : ''
          }
          <div className={styles.row}>
            <span className={styles.label}>{ selectedVolume.kubernetesStatus.lastPVCRefAt ? 'Last' : ''} Namespace:</span>
            {selectedVolume.kubernetesStatus.namespace}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{ selectedVolume.kubernetesStatus.lastPVCRefAt ? 'Last Bounded' : ''} PVC Name:</span>
            {selectedVolume.kubernetesStatus.pvcName}
          </div>
          <div className={styles.row}>
            <span className={styles.label}> PV Name:</span>
            {selectedVolume.kubernetesStatus.pvName}
          </div>
          <div className={styles.row}>
            <span className={styles.label}> PV Status:</span>
            {selectedVolume.kubernetesStatus.pvStatus}
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Revision Counter Disabled:</span>
            {selectedVolume.revisionCounterDisabled ? 'True' : 'False'}
          </div>
          {podList}
        </div>
        : ''
      }
    </div>
  )
}

VolumeInfo.propTypes = {
  backupStatus: PropTypes.object,
  selectedVolume: PropTypes.object,
  queryBackupStatus: PropTypes.func,
  clearBackupStatus: PropTypes.func,
  snapshotModal: PropTypes.object,
  snapshotModalState: PropTypes.bool,
  engineImages: PropTypes.array,
  currentBackingImage: PropTypes.object,
  hosts: PropTypes.array,
}

export default VolumeInfo
