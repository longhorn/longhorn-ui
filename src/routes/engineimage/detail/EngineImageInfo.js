import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import classnames from 'classnames'
import styles from './EngineImageInfo.less'

function EngineImageInfo({ selectedEngineImage }) {
  return (
    <div>
      <div className={styles.row}>
        <span className={styles.label}>Name:</span>
        <span>{selectedEngineImage.name}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Build Date:</span>
        <span>{ moment(new Date(selectedEngineImage.buildDate)).fromNow() }</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Status:</span>
        <span className={classnames({ [selectedEngineImage.state.toLowerCase()]: true, capitalize: true })}>{selectedEngineImage.state.hyphenToHump()}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Default:</span>
        <span>{selectedEngineImage.default ? 'True' : 'False'}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Image:</span>
        <span>{selectedEngineImage.image}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>RefCount:</span>
        <span>{selectedEngineImage.refCount}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>NoRefSince:</span>
        <span>{selectedEngineImage.noRefSince}</span>
      </div>

    </div>
  )
}

EngineImageInfo.propTypes = {
  selectedEngineImage: PropTypes.object,
}

export default EngineImageInfo
