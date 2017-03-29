import React, { PropTypes } from 'react'
import { connect } from 'dva'
import HostList from './HostList'

function Host({ host, loading }) {
  const { data } = host

  const hostListProps = {
    dataSource: data,
    loading,
  }

  return (
    <div className="content-inner">
      <HostList {...hostListProps} />
    </div>
  )
}

Host.propTypes = {
  host: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
}

export default connect(({ host, loading }) => ({ host, loading: loading.models.host }))(Host)
