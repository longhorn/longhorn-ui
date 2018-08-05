import React, { PropTypes } from 'react'
import styles from './DiskList.less'
import StorageInfo from './components/StorageInfo'

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
            <StorageInfo storage={d} />
            <div className={styles.scheduling}>
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
