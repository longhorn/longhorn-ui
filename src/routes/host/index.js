import React, { PropTypes } from 'react'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import HostList from './HostList'
import AddDisk from './AddDisk'
import EditDisk from './EditDisk'
import HostReplica from './HostReplica'
import HostFilter from './HostFilter'
import { filterNode, schedulableNode, unschedulableNode, schedulingDisabledNode, downNode } from '../../utils/filter'

function Host({ host, volume, setting, loading, dispatch, location }) {
  let hostList = null
  let hostFilter = null
  const { data, selected, modalVisible, replicaModalVisible, addDiskModalVisible, editDisksModalVisible, diskReplicaModalVisible, selectedDiskID } = host
  const { field, value, stateValue } = location.query
  const volumeList = volume.data
  const storageOverProvisioningPercentage = setting.data.find(item => item.id === 'storage-over-provisioning-percentage')
  const minimalSchedulingQuotaWarning = setting.data.find(item => item.id === 'minimal-scheduling-quota-warning') || { value: '90' }
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
    Object.keys(agent.disks).forEach(id => {
      agent.disks[id].replicas = replicas.filter(r => r.diskID === id)
    })
  })
  const getSelected = () => {
    if (!selected.id) {
      return {}
    }
    return data.find(item => item.id === selected.id) || {}
  }
  const getSelectedDisk = (diskID) => {
    if (diskID) {
      const node = data.find(n => n.disks[diskID])
      if (node) {
        return { ...node.disks[diskID], name: node.disks[diskID].path }
      }
    }
    return {}
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
      dispatch({
        type: 'app/changeBlur',
        payload: false,
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
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }

  const hostListProps = {
    dataSource: nodes,
    storageOverProvisioningPercentage: (storageOverProvisioningPercentage && Number(storageOverProvisioningPercentage.value)) || 0,
    minimalSchedulingQuotaWarning: (minimalSchedulingQuotaWarning && Number(minimalSchedulingQuotaWarning.value)) || 90,
    loading,
    onAllExpandedOrCollapsed(isAllExpanded) {
      hostFilter && hostFilter.toggleExpand(isAllExpanded)
    },
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
    showDiskReplicaModal(disk) {
      dispatch({
        type: 'host/showDiskReplicaModal',
        payload: {
          selectedDiskID: disk.id,
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
  const diskReplicaModalProps = {
    selected: getSelectedDisk(selectedDiskID),
    visible: diskReplicaModalVisible,
    onCancel() {
      dispatch({
        type: 'host/hideDiskReplicaModal',
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
    expandAll() {
      hostList && hostList.expandAll()
    },
    collapseAll() {
      hostList && hostList.collapseAll()
    },
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
      <HostFilter ref={(component) => { hostFilter = component }} {...HostFilterProps} />
      <HostList ref={(component) => { hostList = component }} {...hostListProps} />
      {modalVisible && <AddDisk {...addDiskModalProps} />}
      {replicaModalVisible && <HostReplica {...hostReplicaModalProps} />}
      {editDisksModalVisible && <EditDisk {...editDiskModalProps} />}
      {diskReplicaModalVisible && <HostReplica {...diskReplicaModalProps} />}
    </div>
  )
}

Host.propTypes = {
  host: PropTypes.object,
  volume: PropTypes.object,
  setting: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
}

export default connect(({ volume, host, setting, loading }) => ({ volume, host, setting, loading: loading.models.host }))(Host)
