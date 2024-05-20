import React from 'react'
import PropTypes from 'prop-types'
import { formatDate } from '../../../utils/formatDate'
import { Icon, Tooltip } from 'antd'

const toolTipContent = (field, prefix, value = '') => {
  if (!field) return null
  const text = prefix === 'Last Probe Time' || prefix === 'Last Transition Time' ? formatDate(value) : value
  return (<div style={{ marginBottom: 5 }}>{prefix}: {text}</div>)
}

function ConditionTooltip({ selectedVolume, conditionKey }) {
  let icon = <Icon style={{ marginRight: 5 }} type="exclamation-circle" />
  let conditionClassName = ''
  const { type, lastProbeTime, lastTransitionTime, message, reason, status } = selectedVolume.conditions[conditionKey] || {}
  let title = selectedVolume.conditions[conditionKey] ? (
    <div>
      {toolTipContent(type, 'Name', type)}
      {toolTipContent(lastProbeTime, 'Last Probe Time', lastProbeTime)}
      {toolTipContent(lastTransitionTime, 'Last Transition Time', lastTransitionTime)}
      {toolTipContent(message, 'Message', message)}
      {toolTipContent(reason, 'Reason', reason)}
      {toolTipContent(status, 'Status', status)}
    </div>) : ''

  switch (conditionKey) {
    case 'TooManySnapshots':
      if (status && (status.toLowerCase() === 'false' || reason === '')) { // hasn't reach TooManySnapshots
        icon = <Icon style={{ marginRight: 5 }} type="exclamation-circle" />
        title = (
          <div>
            {toolTipContent(type, 'Name', type) }
            {toolTipContent(lastTransitionTime, 'Last Transition Time', lastTransitionTime)}
            {toolTipContent(status, 'Status', 'The snapshot number threshold (100) has not been exceeded')}
          </div>
        )
      } else {
        conditionClassName = 'faulted' // red
        title = (
          <div>
            {toolTipContent(type, 'Name', type)}
            {toolTipContent(lastProbeTime, 'Last Probe Time', lastProbeTime)}
            {toolTipContent(lastTransitionTime, 'Last Transition Time', lastTransitionTime)}
            {toolTipContent(message, 'Message', message)}
            {toolTipContent(reason, 'Reason', reason)}
            {toolTipContent(reason, 'Suggestion', 'Try to delete unused snapshots to free up space if needed')}
            {toolTipContent(status, 'Status', status)}
          </div>
        )
      }
      break
    case 'Restore':
      icon = <Icon style={{ marginRight: 5 }} type="check-circle" />
      if (reason === '' && status?.toLowerCase() === 'false') {
        conditionClassName = 'unknown' // grey
      } else {
        conditionClassName = 'healthy' // green
      }
      break
    case 'Scheduled':
      if (status && status.toLowerCase() === 'true') {
        conditionClassName = 'healthy'
        icon = <Icon style={{ marginRight: 5 }} type="check-circle" />
      } else {
        conditionClassName = 'faulted'
      }
      break
    default:
      break
  }
  const text = type || conditionKey
  return (

    <Tooltip key={conditionKey} title={title}>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: 10 }} className={conditionClassName}>
        {icon}{text}
      </div>
    </Tooltip>
  )
}

ConditionTooltip.propTypes = {
  selectedVolume: PropTypes.object,
  conditionKey: PropTypes.string,
}

export default ConditionTooltip
