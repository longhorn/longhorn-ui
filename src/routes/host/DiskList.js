import React, { PropTypes } from 'react'
import { formatMib } from '../../utils/formater'
import styles from './DiskList.less'

function diskList({ disks }) {
  return (
    <div className={styles.diskList}>
      <div className={styles.title}>Disks</div>
      {disks.map(d => (
        <div key={d.id} className={styles.diskItem}>
          <div className={styles.path}>
            <span className={styles.pathLabel}>Path: &nbsp;</span>
            <span className={styles.pathValue}>{d.path}</span>
          </div>
          <div className={styles.storageInfo}>
            <div className={styles.storage}>
              <div className={styles.storageValue}>{formatMib(d.storageAvailable)}</div>
              <div className={styles.storageLabel}>Available</div>
            </div>
            <div className={styles.storage}>
              <div className={styles.storageValue}>{formatMib(d.storageMaximum)}</div>
              <div className={styles.storageLabel}>Maximum</div>
            </div>
            <div className={styles.storage}>
              <div className={styles.storageValue}>{formatMib(d.storageReserved)}</div>
              <div className={styles.storageLabel}>Reserved</div>
            </div>
            <div className={styles.storage}>
              <div className={styles.storageValue}>{formatMib(d.storageScheduled)}</div>
              <div className={styles.storageLabel}>Scheduled</div>
            </div>
            <div className={styles.storage}>
              <div className={styles.schedulingValue}>{d.allowScheduling ? 'Enabled' : 'Disabled'}</div>
              <div className={styles.schedulingLabel}>Scheduling</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
diskList.propTypes = {
  disks: PropTypes.array,
}

export default diskList
