import React, { PropTypes } from 'react'
import { Card, Row, Col } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { formatMib } from '../../../utils/formater'
import styles from './VolumeInfo.less'
import LatestBackup from './LatestBackup'

function VolumeInfo({ clearBackupStatus, backupStatus, selectedVolume, queryBackupStatus }) {
  return (
    <Card bordered={false} bodyStyle={{ padding: '20px' }}>
      <div className={styles.row}>
        <span className={styles.label}> Status:</span>
        <span className={classnames({ [selectedVolume.state.toLowerCase()]: true, capitalize: true })}>
          {selectedVolume.state.hyphenToHump()}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}> HOST:</span>
        {selectedVolume.host}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Frontend:</span>
        {selectedVolume.endpoint}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Size:</span>
        {formatMib(selectedVolume.size)}
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
    </Card>
  )
}

VolumeInfo.propTypes = {
  backupStatus: PropTypes.object,
  selectedVolume: PropTypes.object,
  queryBackupStatus: PropTypes.func,
  clearBackupStatus: PropTypes.func,
}

export default VolumeInfo
