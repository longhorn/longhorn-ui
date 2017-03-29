import React, { PropTypes } from 'react'
import { connect } from 'dva'
import VolumeList from './VolumeList'

function Volume({ volume, loading }) {
  const { data } = volume

  const volumeListProps = {
    dataSource: data,
    loading,
  }

  return (
    <div className="content-inner">
      <VolumeList {...volumeListProps} />
    </div>
  )
}

Volume.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
}

export default connect(({ volume, loading }) => ({ volume, loading: loading.models.volume }))(Volume)
