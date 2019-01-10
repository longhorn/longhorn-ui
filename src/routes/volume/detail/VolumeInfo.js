import React, { PropTypes } from 'react'
import { Row, Col, Alert, Icon } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { formatMib, utcStrToDate } from '../../../utils/formater'
import { isSchedulingFailure, getHealthState, needToWaitDone, frontends } from '../helper/index'
import styles from './VolumeInfo.less'
import LatestBackup from './LatestBackup'

function VolumeInfo({ clearBackupStatus, backupStatus, selectedVolume, queryBackupStatus, snapshotData, snapshotModalState }) {
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
  return (
    <div>
      {errorMsg}
      <div className={styles.row}>
        <span className={styles.label}> State:</span>
        <span className={classnames({ [selectedVolume.state.toLowerCase()]: true, capitalize: true })}>
          {selectedVolume.state.hyphenToHump()} {needToWaitDone(selectedVolume.state, selectedVolume.replicas) ? <Icon type="loading" /> : null}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Health:</span>
        <span className={classnames({ [selectedVolume.robustness.toLowerCase()]: true, capitalize: true })}>
          {getHealthState(selectedVolume.robustness)}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Frontend:</span>
        {(frontends.find(item => item.value === selectedVolume.frontend) || '').label}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Attached Node &amp; Endpoint :</span>
        {selectedVolume.controllers.filter(item => item.hostId !== '' && item.endpoint !== '').map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px' }} key={item.hostId}>{item.hostId} <br /> <span style={{ backgroundColor: '#f2f4f5' }}> {item.endpoint} </span></div>)}
      </div>
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
        <Row>
          <Col xs={10}>
            <span className={styles.label}> Latest Backup:</span>
          </Col>
          <Col xs={14}>
            <LatestBackup clearBackupStatus={clearBackupStatus} backupStatus={backupStatus} queryBackupStatus={queryBackupStatus} />
          </Col>
        </Row>
      </div>
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
}

export default VolumeInfo
