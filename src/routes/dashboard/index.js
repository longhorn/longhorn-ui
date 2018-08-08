import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { ResourceOverview } from './components'

function Dashboard({ host, volume, loading, dispatch, location }) {
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
  return (
    <div>
      <ResourceOverview {...resourceOverviewProps} />
    </div>
  )
}

Dashboard.propTypes = {
  host: PropTypes.object,
  volume: PropTypes.object,
  loading: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
}

export default connect(({ host, volume, loading }) => ({ host, volume, loading }))(Dashboard)
