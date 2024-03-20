import React from 'react'
import PropTypes from 'prop-types'
import { formatMib } from '../../../utils/formatter'
import styles from './StorageInfo.less'

function StorageInfo({ storage }) {
  const computeSchedulableSpace = () => {
    const space = storage.storageAvailable - storage.storageReserved
    if (space < 0) {
      return 0
    }
    return space
  }
  return (
    <div className={styles.storageInfo}>
      <div className={styles.storage}>
        <div className={styles.storageValue}>{formatMib(computeSchedulableSpace())}</div>
        <div className={styles.storageLabel}>Schedulable</div>
      </div>
      <div className={styles.storage}>
        <div className={styles.storageValue}>{formatMib(storage.storageAvailable)}</div>
        <div className={styles.storageLabel}>Available</div>
      </div>
      <div className={styles.storage}>
        <div className={styles.storageValue}>{formatMib(storage.storageReserved)}</div>
        <div className={styles.storageLabel}>Reserved</div>
      </div>
      <div className={styles.storage}>
        <div className={styles.storageValue}>{formatMib(storage.storageMaximum)}</div>
        <div className={styles.storageLabel}>Maximum</div>
      </div>
      <div className={styles.storage}>
        <div className={styles.storageValue}>{formatMib(storage.storageScheduled)}</div>
        <div className={styles.storageLabel}>Scheduled</div>
      </div>
    </div>
  )
}

StorageInfo.propTypes = {
  storage: PropTypes.object,
}

export default StorageInfo
