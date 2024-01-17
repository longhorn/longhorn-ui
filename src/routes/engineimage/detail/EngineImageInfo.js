import React from 'react'
import PropTypes from 'prop-types'
import { formatDate } from '../../../utils/formatDate'
import classnames from 'classnames'
import styles from './EngineImageInfo.less'

function EngineImageInfo({ selectedEngineImage }) {
  const nodeDeploymentMapElement = (nodeDeploymentMap) => {
    if (nodeDeploymentMap) {
      return Object.keys(nodeDeploymentMap).map((key) => {
        return (<div className={styles.descriptionsMap} key={key}>{key}: {nodeDeploymentMap[key].toString().firstUpperCase()}</div>)
      })
    }

    return ''
  }

  return (
    <div>
      <div className={styles.row}>
        <span className={styles.label}>Name:</span>
        <span>{selectedEngineImage.name}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Build Date:</span>
        <span>{ formatDate(selectedEngineImage.buildDate) }</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Status:</span>
        <span className={classnames({ [selectedEngineImage.incompatible ? 'incompatible' : selectedEngineImage.state.toLowerCase()]: true, capitalize: true })}>{selectedEngineImage.incompatible ? 'Incompatible' : selectedEngineImage.state.hyphenToHump()}</span>
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
      <div className={styles.row} style={{ display: 'flex' }}>
        <span className={styles.label}>NodeDeploymentMap:</span>
        <span>{nodeDeploymentMapElement(selectedEngineImage.nodeDeploymentMap)}</span>
      </div>
    </div>
  )
}

EngineImageInfo.propTypes = {
  selectedEngineImage: PropTypes.object,
}

export default EngineImageInfo
