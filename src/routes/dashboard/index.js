import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Card } from 'antd'
import { routerRedux } from 'dva/router'
import { ResourceOverview, EventLogs } from './components'
import { addPrefix } from '../../utils/pathnamePrefix'

function Dashboard({ host, volume, eventlog, loading, dispatch, location }) {
  const { data: eventlogs, sorter } = eventlog
  const resourceOverviewProps = {
    host,
    volume,
    loading,
    onVolumeClick(v) {
      dispatch(routerRedux.push({
        pathname: addPrefix('/volume'),
        query: {
          ...location.query,
          field: 'status',
          stateValue: v.key,
        },
      }))
    },
    onNodeClick(n) {
      dispatch(routerRedux.push({
        pathname: addPrefix('/node'),
        query: {
          ...location.query,
          field: 'status',
          stateValue: n.key,
        },
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
  }
  return (
    <div>
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
