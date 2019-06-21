import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from 'antd'
import highAvailabilityRed from '../../assets/images/high-availability-red.svg'
import highAvailabilityYellow from '../../assets/images/high-availability-yellow.svg'

export default function ReplicaHATooltip({ type = 'warning' }) {
  let content = ''
  let icon = ''
  if (type === 'warning') {
    content = 'Limited node redundancy: at least one healthy replica is running at the same node as another'
    icon = highAvailabilityYellow
  } else if (type === 'danger') {
    content = 'No node redundancy: all the healthy replicas are running on the same node'
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
  type: PropTypes.string,
}
