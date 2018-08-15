import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Card } from 'antd'
import { routerRedux } from 'dva/router'
import { ResourceOverview, EventLogs } from './components'

function Dashboard({ host, volume, eventlog, loading, dispatch, location }) {
  const resourceOverviewProps = {
    host,
    volume,
    loading,
    onVolumeClick(v) {
      dispatch(routerRedux.push({
        pathname: '/volume',
        query: {
          ...location.query,
          field: 'status',
          stateValue: v.key,
        },
      }))
    },
    onNodeClick(n) {
      dispatch(routerRedux.push({
        pathname: '/node',
        query: {
          ...location.query,
          field: 'status',
          stateValue: n.key,
        },
      }))
    },
  }
  const eventLogsProps = {
    data: eventlog.data,
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
