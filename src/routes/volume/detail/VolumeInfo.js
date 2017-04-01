import React, { PropTypes } from 'react'
import { Card } from 'antd'
import styles from './VolumeInfo.less'

function VolumeInfo({ selectedVolume }) {
  return (
    <Card bordered={false} bodyStyle={{ padding: '20px' }}>
      <div className={styles.row}>
        <span className={styles.label}> Status:</span>
        <span className="active">Running</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}> HOST:</span>
        {selectedVolume.hostId}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Frontend:</span>
        {selectedVolume.frontEnd}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Size:</span>
        {selectedVolume.size}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Size On Disk:</span>
        {selectedVolume.used}
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Provisioned IOPS:</span>
        1000
      </div>
      <div className={styles.row}>
        <span className={styles.label}> Created:</span>
        {selectedVolume.created}
      </div>
    </Card>
  )
}

VolumeInfo.propTypes = {
  selectedVolume: PropTypes.object,
}

export default VolumeInfo
