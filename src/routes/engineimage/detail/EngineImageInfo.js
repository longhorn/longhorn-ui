import React from 'react'
import PropTypes from 'prop-types'
import { formatDate } from '../../../utils/formatDate'
import classnames from 'classnames'
import styles from './EngineImageInfo.less'
import { withTranslation } from 'react-i18next'

function EngineImageInfo({ selectedEngineImage, t }) {
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
        <span className={styles.label}>{t('common.name')}:</span>
        <span>{selectedEngineImage.name}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('engineImageInfo.fields.buildDate')}:</span>
        <span>{ formatDate(selectedEngineImage.buildDate) }</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('columns.status')}:</span>
        <span className={classnames({ [selectedEngineImage.incompatible ? 'incompatible' : selectedEngineImage.state.toLowerCase()]: true, capitalize: true })}>{selectedEngineImage.incompatible ? t('engineImageInfo.status.incompatible') : selectedEngineImage.state.hyphenToHump()}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('engineImageInfo.fields.default')}:</span>
        <span>{selectedEngineImage.default ? t('common.true') : t('common.false')}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('engineImageInfo.fields.cliAPIVersion')}:</span>
        <span>{selectedEngineImage.cliAPIVersion}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('engineImageInfo.fields.controllerAPIVersion')}:</span>
        <span>{selectedEngineImage.controllerAPIVersion}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('engineImageInfo.fields.image')}:</span>
        <span>{selectedEngineImage.image}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('engineImageInfo.fields.refCount')}:</span>
        <span>{selectedEngineImage.refCount}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>{t('engineImageInfo.fields.noRefSince')}:</span>
        <span>{selectedEngineImage.noRefSince}</span>
      </div>
      <div className={styles.row} style={{ display: 'flex' }}>
        <span className={styles.label}>{t('engineImageInfo.fields.nodeDeploymentMap')}:</span>
        <span>{nodeDeploymentMapElement(selectedEngineImage.nodeDeploymentMap)}</span>
      </div>
    </div>
  )
}

EngineImageInfo.propTypes = {
  selectedEngineImage: PropTypes.object,
  t: PropTypes.func,
}

export default withTranslation()(EngineImageInfo)
