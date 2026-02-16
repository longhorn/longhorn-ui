import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from 'antd'
import highAvailabilityRed from '../../assets/images/high-availability-red.svg'
import highAvailabilityYellow from '../../assets/images/high-availability-yellow.svg'
import { withTranslation } from 'react-i18next'

function ReplicaHATooltip({ t, type = 'warning' }) {
  let content = ''
  let icon = ''
  if (type === 'warning') {
    content = t('replicaHATooltip.warning')
    icon = highAvailabilityYellow
  } else if (type === 'danger') {
    content = t('replicaHATooltip.danger')
    icon = highAvailabilityRed
  }

  return (
  <Tooltip placement="topLeft"
    title={
    <div>
    { content }
    </div>
    }>
    <img style={{ marginRight: '5px', width: '22px', height: '22px' }} src={icon} alt={content}></img>
  </Tooltip>)
}

ReplicaHATooltip.propTypes = {
  t: PropTypes.func,
  type: PropTypes.string,
}

export default withTranslation()(ReplicaHATooltip)
