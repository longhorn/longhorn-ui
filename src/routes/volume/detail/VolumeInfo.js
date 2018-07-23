import React, { PropTypes } from 'react'
import { Row, Col, Alert } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { formatMib } from '../../../utils/formater'
import styles from './VolumeInfo.less'
import LatestBackup from './LatestBackup'

function VolumeInfo({ clearBackupStatus, backupStatus, selectedVolume, queryBackupStatus, snapshotModal: { snapshotTree } }) {
  let errorMsg = null
  if (!selectedVolume.conditions.scheduled.status) {
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
  const computedVolumeTotalSize = () => {
    let total = Number(selectedVolume.size)
    snapshotTree.forEach(item => {
      total += Number(item.size)
    })
    return total
  }
  return (
    <div>
      {errorMsg}
      <div className={styles.row}>
        <span className={styles.label}> Status:</span>
        <span className={classnames({ [selectedVolume.state.toLowerCase()]: true, capitalize: true })}>
          {selectedVolume.state.hyphenToHump()}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Robustness:</span>
        <span className={classnames({ [selectedVolume.robustness.toLowerCase()]: true, capitalize: true })}>
          {selectedVolume.robustness.hyphenToHump()}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Attached Node:</span>
        {selectedVolume.host}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Frontend:</span>
        {selectedVolume.frontend}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Endpoint:</span>
        {selectedVolume.endpoint}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Size:</span>
        {formatMib(selectedVolume.size)}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Actual Size:</span>
        {formatMib(computedVolumeTotalSize())}
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
        {moment(new Date(selectedVolume.created)).fromNow()}
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
}

export default VolumeInfo
