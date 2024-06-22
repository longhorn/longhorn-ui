import React from 'react'
import moment from 'moment'
import { Tooltip } from 'antd'

function utcStrToDate(utcStr) {
  const reg = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) \+\d{4} UTC$/
  const results = utcStr.match(reg)
  if (results && results.length === 3) {
    const d = results[1].split('-').map(item => parseInt(item, 10))
    const t = results[2].split(':').map(item => parseInt(item, 10))
    return new Date(Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1], t[2]))
  }
  return utcStr
}

export function formatDate(date, hasTooltip = true) {
  // Initial date return null
  if (date === '0001-01-01 00:00:00 +0000 UTC' || !date) {
    return ''
  }
  let gmt = utcStrToDate(date)
  if (hasTooltip) {
    return <Tooltip title={`${moment(gmt).utc().format()}`}>
      {moment(gmt).fromNow()}
    </Tooltip>
  }
  return moment(gmt).fromNow()
}
