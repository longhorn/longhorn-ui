import React from 'react'
import PropTypes from 'prop-types'
import { Alert, Icon, Tag, Progress, Tooltip } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { formatMib, utcStrToDate } from '../../../utils/formater'
import { isSchedulingFailure, getHealthState, needToWaitDone, frontends, extractImageVersion } from '../helper/index'
import styles from './VolumeInfo.less'
import { EngineImageUpgradeTooltip, ReplicaHATooltip } from '../../../components'
import { isVolumeImageUpgradable, isVolumeReplicaNotRedundancy, isVolumeRelicaLimited } from '../../../utils/filter'

function VolumeInfo({ selectedVolume, snapshotData, snapshotModalState, engineImages }) {
  let errorMsg = null
  const state = snapshotModalState

  if (isSchedulingFailure(selectedVolume)) {
    errorMsg = (
      <Alert
        message="Scheduling Failure"
        description={selectedVolume.conditions.scheduled.reason.replace(/([A-Z])/g, ' $1')}
        type="warning"
        className="ant-alert-error"
        showIcon
      />
    )
  }
  const computeActualSize = () => {
    let total = 0
    snapshotData.forEach(item => {
      total += Number(item.size)
    })
    return total
  }
  const defaultImage = engineImages.find(image => image.default === true)
  const healthState = getHealthState(selectedVolume.robustness)
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
      <Tag key={index} color="rgb(39, 174, 95)">
        {tag}
      </Tag>
    )
  }

  let forMapDisk = (tag, index) => {
    return (
      <Tag key={index} color="#108eb9">
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

  // resotring progress
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
      <div className={styles.row}>
        <span className={styles.label}> Health:</span>
        <span className={classnames({ [selectedVolume.robustness.toLowerCase()]: true, capitalize: true }, styles.volumeState)}>
          {ha} {healthState}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Frontend:</span>
        {(frontends.find(item => item.value === selectedVolume.frontend) || '').label}
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
        {formatMib(selectedVolume.size)}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Actual Size:</span>
        {state ? formatMib(computeActualSize()) : 'Unknown'}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Base Image:</span>
        {selectedVolume.baseImage}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Engine Image:</span>
        {selectedVolume.engineImage}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Created:</span>
        {moment(utcStrToDate(selectedVolume.created)).fromNow()}
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
        {selectedVolume.lastBackupAt ? moment(selectedVolume.lastBackupAt).fromNow() : ''}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Instance Manager:</span>
        {selectedVolume.controllers ? selectedVolume.controllers.filter(item => item.instanceManagerName !== '').map(item => <div key={item.hostId} style={{ fontFamily: 'monospace', margin: '2px 0px' }}> <span style={{ backgroundColor: '#f2f4f5' }}> {item.instanceManagerName} </span></div>) : ''}
      </div>
      { selectedVolume.kubernetesStatus ? <div>
          { selectedVolume.kubernetesStatus.lastPVCRefAt ? <div className={styles.row}>
              <span className={styles.label}> Last time bound with PVC:</span>
              {selectedVolume.kubernetesStatus.lastPVCRefAt ? moment(new Date(selectedVolume.kubernetesStatus.lastPVCRefAt)).fromNow() : ''}
            </div> : ''
          }
          {selectedVolume.kubernetesStatus.lastPodRefAt ? <div className={styles.row}>
              <span className={styles.label}> Last time used by Pod:</span>
              {selectedVolume.kubernetesStatus.lastPodRefAt ? moment(new Date(selectedVolume.kubernetesStatus.lastPodRefAt)).fromNow() : ''}
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
  snapshotData: PropTypes.array,
  snapshotModalState: PropTypes.bool,
  engineImages: PropTypes.array,
}

export default VolumeInfo
