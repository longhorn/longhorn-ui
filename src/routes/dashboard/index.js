import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { ResourceOverview } from './components'

function Dashboard({ host, volume, loading }) {
  return (
    <div>
      <ResourceOverview host={host} volume={volume} loading={loading} />
    </div>
  )
}

Dashboard.propTypes = {
  host: PropTypes.object,
  volume: PropTypes.object,
  loading: PropTypes.object,
}

export default connect(({ host, volume, loading }) => ({ host, volume, loading }))(Dashboard)
