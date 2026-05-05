import React from 'react'
import PropTypes from 'prop-types'
import { formatDate } from '../../../utils/formatDate'
import { Icon, Tooltip } from 'antd'
import { withTranslation } from 'react-i18next'

const toolTipContent = (field, prefix, value = '', t) => {
  if (!field) return null
  const text = prefix === t('conditionTooltip.lastProbeTime') || prefix === t('conditionTooltip.lastTransitionTime') ? formatDate(value) : value
  return (<div style={{ marginBottom: 5 }}>{prefix}: {text}</div>)
}

const parsePositiveNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) && num > 0 ? num : null
}

function ConditionTooltip({ t, selectedVolume, conditionKey, snapshotWarningThreshold }) {
  let icon = <Icon style={{ marginRight: 5 }} type="exclamation-circle" />
  let conditionClassName = ''
  const { type, lastProbeTime, lastTransitionTime, message, reason, status } = selectedVolume.conditions[conditionKey] || {}
  const computedThreshold = Math.min(
    parsePositiveNumber(snapshotWarningThreshold),
    parsePositiveNumber(selectedVolume.snapshotMaxCount)
  )
  let title = selectedVolume.conditions[conditionKey] ? (
    <div>
      {toolTipContent(type, t('common.name'), type, t)}
      {toolTipContent(lastProbeTime, t('conditionTooltip.lastProbeTime'), lastProbeTime, t)}
      {toolTipContent(lastTransitionTime, t('conditionTooltip.lastTransitionTime'), lastTransitionTime, t)}
      {toolTipContent(message, t('conditionTooltip.message'), message, t)}
      {toolTipContent(reason, t('conditionTooltip.reason'), reason, t)}
      {toolTipContent(status, t('columns.status'), status, t)}
    </div>) : ''

  switch (conditionKey) {
    case 'TooManySnapshots':
      if (status && (status.toLowerCase() === 'false' || reason === '')) { // hasn't reach TooManySnapshots
        icon = <Icon style={{ marginRight: 5 }} type="exclamation-circle" />
        title = (
          <div>
            {toolTipContent(type, t('common.name'), type, t) }
            {toolTipContent(lastTransitionTime, t('conditionTooltip.lastTransitionTime'), lastTransitionTime, t)}
            {toolTipContent(status, t('columns.status'), t('conditionTooltip.tooManySnapshots.notExceeded', { computedThreshold }), t)}
          </div>
        )
      } else {
        conditionClassName = 'faulted' // red
        title = (
          <div>
            {toolTipContent(type, t('common.name'), type, t)}
            {toolTipContent(lastProbeTime, t('conditionTooltip.lastProbeTime'), lastProbeTime, t)}
            {toolTipContent(lastTransitionTime, t('conditionTooltip.lastTransitionTime'), lastTransitionTime, t)}
            {toolTipContent(message, t('conditionTooltip.message'), message, t)}
            {toolTipContent(reason, t('conditionTooltip.reason'), reason, t)}
            {toolTipContent(reason, t('conditionTooltip.suggestion'), t('conditionTooltip.tooManySnapshots.suggestion'), t)}
            {toolTipContent(status, t('columns.status'), status, t)}
          </div>
        )
      }
      break
    case 'Restore':
    case 'OfflineRebuilding':
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
  t: PropTypes.func,
  selectedVolume: PropTypes.object,
  conditionKey: PropTypes.string,
  snapshotWarningThreshold: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default withTranslation()(ConditionTooltip)
