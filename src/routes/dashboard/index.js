import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import queryString from 'query-string'
import { Card } from 'antd'
import { routerRedux } from 'dva/router'
import { ResourceOverview, EventLogs } from './components'

function Dashboard({ host, volume, eventlog, loading, dispatch, location }) {
  let { data: eventlogsData, sorter } = eventlog
  let eventlogs = eventlogsData.map((item) => {
    let obj = {}
    obj.eventType = item.eventType
    return Object.assign(obj, item.event)
  })
  const resourceOverviewProps = {
    host,
    volume,
    loading,
    onVolumeClick(v) {
      dispatch(routerRedux.push({
        pathname: '/volume',
        search: queryString.stringify({
          ...queryString.parse(location.search),
          field: 'status',
          stateValue: v.key,
        }),
      }))
    },
    onNodeClick(n) {
      dispatch(routerRedux.push({
        pathname: '/node',
        search: queryString.stringify({
          ...queryString.parse(location.search),
          field: 'status',
          stateValue: n.key,
        }),
      }))
    },
  }
  const eventLogsProps = {
    data: eventlogs,
    onSorterChange(s) {
      dispatch({
        type: 'eventlog/updateSorter',
        payload: { field: s.field, order: s.order, columnKey: s.columnKey },
      })
    },
    sorter,
    dispatch,
  }
  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      <Card bordered={false}>
        <ResourceOverview {...resourceOverviewProps} />
        <EventLogs {...eventLogsProps} />
      </Card>
    </div>
  )
}

Dashboard.propTypes = {
  host: PropTypes.object,
  volume: PropTypes.object,
  eventlog: PropTypes.object,
  loading: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
}

export default connect(({ host, volume, eventlog, loading }) => ({ host, volume, eventlog, loading }))(Dashboard)
