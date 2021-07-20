import React from 'react'
import moment from 'moment'
import { Tooltip } from 'antd'

export function formatDate(date, hasTooltip = true) {
  if (hasTooltip) {
    return <Tooltip title={moment(date).format('YYYY-MM-DD h:mm:ss')}>
      {moment(date).fromNow()}
    </Tooltip>
  }
  return moment(date).fromNow()
}
