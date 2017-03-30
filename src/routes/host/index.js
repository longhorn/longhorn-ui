import React, { PropTypes } from 'react'
import { connect } from 'dva'
import HostList from './HostList'
import AddHost from './AddHost'
import AddDisk from './AddDisk'
import HostAction from './HostAction'

function Host({ host, loading, dispatch }) {
  const { data, modalVisible, addDiskModalVisible } = host

  const addHostModalProps = {
    visible: modalVisible,
    onCancel() {
      dispatch({
        type: 'host/hideModal',
      })
    },
  }

  const addDiskModalProps = {
    item: {},
    visible: addDiskModalVisible,
    onOk(disk) {
      dispatch({
        type: 'host/createDisk',
        payload: disk,
      })
    },
    onCancel() {
      dispatch({
        type: 'host/hideAddDiskModal',
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
    showAddDiskModal() {
      dispatch({
        type: 'host/showAddDiskModal',
        payload: {
          modalType: 'create',
        },
      })
    },
  }

  const AddDiskGen = () =>
    <AddDisk {...addDiskModalProps} />

  return (
    <div className="content-inner">
      <HostAction {...hostActionProps} />
      <HostList {...hostListProps} />
      <AddHost {...addHostModalProps} />
      <AddDiskGen />
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
