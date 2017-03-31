import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import VolumeList from './VolumeList'
import VolumeFilter from './VolumeFilter'

function Volume({ host, volume, location, loading, dispatch }) {
  const { data } = volume
  const hosts = host.data
  const { field, keyword } = location.query

  const volumeListProps = {
    dataSource: data,
    loading,
  }

  const volumeFilterProps = {
    hosts,
    field,
    keyword,
    onSearch(fieldsValue) {
      fieldsValue.keyword.length ? dispatch(routerRedux.push({
        pathname: '/volume',
        query: {
          field: fieldsValue.field,
          keyword: fieldsValue.keyword,
        },
      })) : dispatch(routerRedux.push({
        pathname: '/volume',
      }))
    },
    onAdd() {
      dispatch({
        type: 'volume/showModal',
        payload: {
          modalType: 'volume',
        },
      })
    },
  }

  return (
    <div className="content-inner" >
      <VolumeFilter {...volumeFilterProps} />
      <VolumeList {...volumeListProps} />
    </div>
  )
}

Volume.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  host: PropTypes.object,
}

export default connect(({ host, volume, loading }) => ({ host, volume, loading: loading.models.volume }))(Volume)
