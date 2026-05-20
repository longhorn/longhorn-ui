import React from 'react'
import PropTypes from 'prop-types'
import { formatMib } from '../../../utils/formatter'
import styles from './StorageInfo.less'
import { withTranslation } from 'react-i18next'

function StorageInfo({ storage, t }) {
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
        <div className={styles.storageLabel}>{t('storageInfo.schedulable')}</div>
      </div>
      <div className={styles.storage}>
        <div className={styles.storageValue}>{formatMib(storage.storageAvailable)}</div>
        <div className={styles.storageLabel}>{t('storageInfo.available')}</div>
      </div>
      <div className={styles.storage}>
        <div className={styles.storageValue}>{formatMib(storage.storageReserved)}</div>
        <div className={styles.storageLabel}>{t('storageInfo.reserved')}</div>
      </div>
      <div className={styles.storage}>
        <div className={styles.storageValue}>{formatMib(storage.storageMaximum)}</div>
        <div className={styles.storageLabel}>{t('storageInfo.maximum')}</div>
      </div>
      <div className={styles.storage}>
        <div className={styles.storageValue}>{formatMib(storage.storageScheduled)}</div>
        <div className={styles.storageLabel}>{t('storageInfo.scheduled')}</div>
      </div>
    </div>
  )
}

StorageInfo.propTypes = {
  storage: PropTypes.object,
  t: PropTypes.func,
}

export default withTranslation()(StorageInfo)
