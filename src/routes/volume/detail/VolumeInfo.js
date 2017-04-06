import React, { PropTypes } from 'react'
import { Card } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { formatMib } from '../../../utils/formater'
import styles from './VolumeInfo.less'

function VolumeInfo({ selectedVolume }) {
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
    </Card>
  )
}

VolumeInfo.propTypes = {
  selectedVolume: PropTypes.object,
}

export default VolumeInfo
