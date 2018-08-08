import React, { PropTypes } from 'react'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import HostList from './HostList'
import AddDisk from './AddDisk'
import EditDisk from './EditDisk'
import HostReplica from './HostReplica'
import HostFilter from './HostFilter'
import { filterNode, schedulableNode, unschedulableNode, schedulingDisabledNode, downNode } from '../../utils/filter'

function Host({ host, volume, loading, dispatch, location }) {
  const { data, selected, modalVisible, replicaModalVisible, addDiskModalVisible, editDisksModalVisible } = host
  const { field, value, stateValue } = location.query
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
  const getSelected = () => {
    if (!selected.id) {
      return {}
    }
    return data.find(item => item.id === selected.id) || {}
  }

  const nodeFilterMap = {
    schedulable: schedulableNode,
    unschedulable: unschedulableNode,
    schedulingDisabled: schedulingDisabledNode,
    down: downNode,
  }

  let nodes = data
  if (field && field === 'status' && nodeFilterMap[stateValue]) {
    nodes = nodeFilterMap[stateValue](data)
  } else if (field && value && field !== 'status') {
    nodes = filterNode(data, field, value)
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
    dataSource: nodes,
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
    selected: getSelected(selected.id),
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

  const HostFilterProps = {
    location,
    stateOption: [
      { value: 'schedulable', name: 'Schedulable' },
      { value: 'unschedulable', name: 'Unschedulable' },
      { value: 'schedulingDisabled', name: 'Disabled' },
      { value: 'down', name: 'Down' },
    ],
    fieldOption: [
      { value: 'name', name: 'Name' },
      { value: 'status', name: 'Status' },
    ],
    onSearch(filter) {
      const { field: filterField, value: filterValue, stateValue: filterStateValue } = filter
      filterField && (filterValue || filterStateValue) ? dispatch(routerRedux.push({
        pathname: '/node',
        query: {
          ...location.query,
          field: filterField,
          value: filterValue,
          stateValue: filterStateValue,
        },
      })) : dispatch(routerRedux.push({
        pathname: '/node',
        query: {
        },
      }))
    },
  }

  return (
    <div className="content-inner">
      <HostFilter {...HostFilterProps} />
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
