import React, { PropTypes } from 'react'
import styles from './DiskList.less'
import StorageInfo from './components/StorageInfo'

function diskList({ disks, node, showDiskReplicaModal }) {
  const getDiskStatus = (d) => {
    if (node.allowScheduling === false || d.allowScheduling === false) {
      return (<span className={styles.disabled}>Disabled</span>)
    }
    const status = d.conditions.Schedulable.status.toLowerCase() === 'true'
    if (status) {
      return (<span className={styles.schedulable}>Schedulable</span>)
    }
    return (<span className={styles.unschedulable}>Unschedulable</span>)
  }
  return (
    <div className={styles.diskList}>
      <div className={styles.title}>Disks</div>
      {disks.map(d => (
        <div key={d.id} className={styles.diskItem}>
          <div className={styles.leftPart}>
            <div className={styles.path}>
              {getDiskStatus(d)}
              <span className={styles.pathLabel}>Path: &nbsp;</span>
              <span className={styles.pathValue}>{d.path}</span>
            </div>
            <div className={styles.replicas}>
              <a onClick={() => showDiskReplicaModal(d)}>
              {d.replicas ? d.replicas.length : 0} {d.replicas && d.replicas.length > 1 ? 'Replicas' : 'Replica'}
              </a>
            </div>
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
  node: PropTypes.object,
  showDiskReplicaModal: PropTypes.func,
}

export default diskList
