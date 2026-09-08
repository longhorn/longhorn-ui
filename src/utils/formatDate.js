import React from 'react'
import moment from 'moment'
import { Tooltip } from 'antd'
import { utcStrToDate } from './formatter'

export function formatDate(date, hasTooltip = true) {
  // Initial date return null
  if (date === '0001-01-01 00:00:00 +0000 UTC' || !date) {
    return ''
  }
  const parsed = utcStrToDate(date)
  // Other formats (e.g. RFC3339) are left to moment
  const gmt = parsed instanceof Date ? parsed : date
  if (hasTooltip) {
    return <Tooltip title={`${moment(gmt).utc().format()}`}>
      {moment(gmt).fromNow()}
    </Tooltip>
  }
  return moment(gmt).fromNow()
}


export const safeParseJSON = str => {
  try {
    return str ? JSON.parse(str) : {}
  } catch {
    return {}
  }
}
