import React, { PropTypes } from 'react'
import { connect } from 'dva'
import HostList from './HostList'
import AddDisk from './AddDisk'
import EditDisk from './EditDisk'
import HostReplica from './HostReplica'

function Host({ host, volume, loading, dispatch }) {
  const { data, selected, modalVisible, replicaModalVisible, addDiskModalVisible, editDisksModalVisible } = host
  const volumeList = volume.data

  data.forEach(agent => {
    const replicas = []
    volumeList.forEach(vol => {
      if (vol.replicas) {
        vol.replicas.forEach(replica => {
          if (agent.id === replica.hostId) {
            replica.removeUrl = vol.actions.replicaRemove
            replicas.push(replica)
          }
        })
      }
    })
    agent.replicas = replicas
  })

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
  const editDiskModalProps = {
    visible: editDisksModalVisible,
    node: selected,
    onOk(disks, disableSchedulingDisks) {
      dispatch({
        type: 'host/updateDisk',
        payload: {
          disks,
          disableSchedulingDisks,
          url: selected.actions.diskUpdate,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'host/hideEditDisksModal',
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
    toggleScheduling(record) {
      dispatch({
        type: 'host/toggleScheduling',
        payload: record,
      })
    },
    updateDisk(disks, url) {
      dispatch({
        type: 'host/updateDisk',
        payload: {
          disks,
          url,
        },
      })
    },
    showEditDisksModal(record) {
      dispatch({
        type: 'host/showEditDisksModal',
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
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
    deleteReplica(name, url) {
      dispatch({
        type: 'volume/deleteReplica',
        payload: {
          name,
          url,
        },
      })
    },
  }

  return (
    <div className="content-inner">
      <HostList {...hostListProps} />
      {modalVisible && <AddDisk {...addDiskModalProps} />}
      {replicaModalVisible && <HostReplica {...hostReplicaModalProps} />}
      {editDisksModalVisible && <EditDisk {...editDiskModalProps} />}
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
