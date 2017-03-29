import React, { PropTypes } from 'react'
import { connect } from 'dva'
import HostList from './HostList'
import AddHost from './AddHost'
import HostAction from './HostAction'

function Host({ host, loading, dispatch }) {
  const { data, modalVisible } = host

  const addHostModalProps = {
    visible: modalVisible,
    onCancel() {
      dispatch({
        type: 'host/hideModal',
      })
    },
  }

  const hostActionProps = {
    onAdd() {
      dispatch({
        type: 'host/showModal',
        payload: {
          modalType: 'create',
        },
      })
    },
  }

  const hostListProps = {
    dataSource: data,
    loading,
  }

  return (
    <div className="content-inner">
      <HostAction {...hostActionProps} />
      <HostList {...hostListProps} />
      <AddHost {...addHostModalProps} />
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
