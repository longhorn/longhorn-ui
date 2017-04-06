import React, { PropTypes } from 'react'
import { connect } from 'dva'
import HostList from './HostList'
import AddHost from './AddHost'
import AddDisk from './AddDisk'
import HostReplica from './HostReplica'
import HostAction from './HostAction'

function Host({ host, volume, loading, dispatch }) {
  const { data, selected, modalVisible, replicaModalVisible, addDiskModalVisible } = host
  const volumeList = volume.data

  data.forEach(agent => {
    const replicas = []
    volumeList.forEach(vol => {
      if (vol.replicas) {
        vol.replicas.forEach(replica => {
          if (agent.id === replica.hostId) {
            replicas.push(replica)
          }
        })
      }
    })
    agent.replicas = replicas
  })

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
      })
    },
  }

  const hostListProps = {
    dataSource: data,
    loading,
    showAddDiskModal() {
      dispatch({
        type: 'host/showAddDiskModal',
      })
    },
    showReplicaModal(record) {
      dispatch({
        type: 'host/showReplicaModal',
        payload: {
          selected: record,
        },
      })
    },
  }

  const hostReplicaModalProps = {
    selected,
    visible: replicaModalVisible,
    onCancel() {
      dispatch({
        type: 'host/hideReplicaModal',
      })
    },
  }

  const AddDiskGen = () =>
    <AddDisk {...addDiskModalProps} />

  const HostReplicaGen = () =>
    <HostReplica {...hostReplicaModalProps} />

  return (
    <div className="content-inner">
      <HostAction {...hostActionProps} />
      <HostList {...hostListProps} />
      <AddHost {...addHostModalProps} />
      <AddDiskGen />
      <HostReplicaGen />
    </div>
  )
}

Host.propTypes = {
  host: PropTypes.object,
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
}

export default connect(({ volume, host, loading }) => ({ volume, host, loading: loading.models.host }))(Host)
