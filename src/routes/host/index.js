import React from 'react'
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import queryString from 'query-string'
import HostList from './HostList'
import AddDisk from './AddDisk'
import EditDisk from './EditDisk'
import HostReplica from './HostReplica'
import HostFilter from './HostFilter'
import BulkEditNode from './BulkEditNode'
import { filterNode, schedulableNode, unschedulableNode, schedulingDisabledNode, downNode, getNodeStatus } from '../../utils/filter'
import { addPrefix } from '../../utils/pathnamePrefix'

function Host({ host, volume, setting, loading, dispatch, location }) {
  let hostList = null
  let hostFilter = null
  const { data, selected, modalVisible, replicaModalVisible, addDiskModalVisible, editDisksModalVisible, diskReplicaModalVisible, instanceManagerVisible, selectedHostRows, currentNode, editBulkNodesModalVisible } = host
  const { selectedDiskID, sorter, selectedReplicaRows, selectedReplicaRowKeys, replicaModalDeleteDisabled, replicaModalDeleteLoading } = host
  const { field, value, stateValue } = queryString.parse(location.search)
  const volumeList = volume.data
  const storageOverProvisioningPercentage = setting.data.find(item => item.id === 'storage-over-provisioning-percentage')
  const minimalSchedulingQuotaWarning = setting.data.find(item => item.id === 'minimal-scheduling-quota-warning') || { value: '90' }
  const defaultInstanceManager = setting.data.find(item => item.id === 'default-instance-manager-image')
  const defaultEngineImage = setting.data.find(item => item.id === 'default-engine-image')

  data.forEach(agent => {
    const replicas = []
    volumeList.forEach(vol => {
      if (vol.replicas) {
        vol.replicas.forEach(replica => {
          if (agent.id === replica.hostId) {
            replica.removeUrl = vol.actions.replicaRemove
            replica.volState = vol.state
            replicas.push(replica)
          }
        })
      }
    })
    agent.replicas = replicas
    Object.keys(agent.disks).forEach(id => {
      agent.disks[id].replicas = replicas.filter(r => r.diskID === id)
    })
    agent.status = getNodeStatus(agent)
  })
  const getSelected = () => {
    if (!selected.id) {
      return {}
    }
    return data.find(item => item.id === selected.id) || {}
  }
  const getSelectedDisk = (nodeId, diskID) => {
    if (diskID) {
      const node = data.find(n => n.id === nodeId)

      if (node && node.disks && node.disks[diskID]) {
        return { ...node.disks[diskID], name: node.disks[diskID].path }
      } else {
        return {}
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
    onOk(disks, disableSchedulingDisks, updateNode) {
      dispatch({
        type: 'host/updateDisk',
        payload: {
          disks,
          disableSchedulingDisks,
          updateNode,
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

  const editBulkNodesModalProps = {
    visible: editBulkNodesModalVisible,
    selectedHostRows,
    onOk(allowScheduling) {
      if (allowScheduling === 'noOperation') {
        dispatch({
          type: 'host/hideBulkEditNodeModal',
        })
      } else {
        dispatch({
          type: 'host/changeBulkNodeScheduling',
          payload: {
            allowScheduling,
            selected: selectedHostRows,
          },
        })
      }
    },
    onCancel() {
      dispatch({
        type: 'host/hideBulkEditNodeModal',
      })
    },
  }

  const hostListProps = {
    dataSource: nodes,
    dispatch,
    instanceManagerVisible,
    defaultInstanceManager,
    defaultEngineImage,
    currentNode,
    storageOverProvisioningPercentage: (storageOverProvisioningPercentage && Number(storageOverProvisioningPercentage.value)) || 0,
    minimalSchedulingQuotaWarning: (minimalSchedulingQuotaWarning && Number(minimalSchedulingQuotaWarning.value)) || 90,
    loading,
    onSorterChange(s) {
      dispatch({
        type: 'host/updateSorter',
        payload: { field: s.field, order: s.order, columnKey: s.columnKey },
      })
    },
    sorter,
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
    showDiskReplicaModal(disk, node) {
      dispatch({
        type: 'host/showDiskReplicaModal',
        payload: {
          selectedDiskID: disk.id,
          selected: node,
        },
      })
    },
    toggleScheduling(record) {
      dispatch({
        type: 'host/toggleScheduling',
        payload: record,
      })
    },
    deleteHost(record) {
      dispatch({
        type: 'host/deleteHost',
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
      dispatch({ type: 'host/hideReplicaModal' })
      dispatch({ type: 'host/clearReplicaSelection' })
      dispatch({ type: 'host/disableReplicaModalDelete' })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
    deleteReplicas(replicas) {
      dispatch({
        type: 'host/deleteReplicas',
        replicas,
      })
    },
    selectedRows: selectedReplicaRows,
    selectedRowKeys: selectedReplicaRowKeys,
    rowSelection: {
      selectedRowKeys: selectedReplicaRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        if (selectedRowKeys.length === 0) {
          dispatch({ type: 'host/disableReplicaModalDelete' })
        } else {
          dispatch({ type: 'host/enableReplicaModalDelete' })
        }
        dispatch({
          type: 'host/changeReplicaSelection',
          payload: {
            selectedReplicaRowKeys: selectedRowKeys,
            selectedReplicaRows: selectedRows,
          },
        })
      },
      getCheckboxProps: record => ({
        disabled: record.volState !== 'detached' && record.volState !== 'attached',
        name: record.name,
      }),
    },
    replicaModalDeleteDisabled,
    replicaModalDeleteLoading,
  }
  const diskReplicaModalProps = {
    selected: getSelectedDisk(selected.id, selectedDiskID),
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
    deleteReplicas(replicas) {
      dispatch({
        type: 'host/deleteReplicas',
        replicas,
      })
    },
    selectedRows: selectedReplicaRows,
    selectedRowKeys: selectedReplicaRowKeys,
    rowSelection: {
      selectedRowKeys: selectedReplicaRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        if (selectedRowKeys.length === 0) {
          dispatch({ type: 'host/disableReplicaModalDelete' })
        } else {
          dispatch({ type: 'host/enableReplicaModalDelete' })
        }
        dispatch({
          type: 'host/changeReplicaSelection',
          payload: {
            selectedReplicaRowKeys: selectedRowKeys,
            selectedReplicaRows: selectedRows,
          },
        })
      },
      getCheckboxProps: record => ({
        disabled: record.volState !== 'detached' && record.volState !== 'attached',
        name: record.name,
      }),
    },
    replicaModalDeleteDisabled,
    replicaModalDeleteLoading,
  }

  const HostFilterProps = {
    location,
    selectedHostRows,
    dispatch,
    stateOption: [
      { value: 'schedulable', name: 'Schedulable' },
      { value: 'unschedulable', name: 'Unschedulable' },
      { value: 'schedulingDisabled', name: 'Disabled' },
      { value: 'down', name: 'Down' },
    ],
    fieldOption: [
      { value: 'name', name: 'Name' },
      { value: 'status', name: 'Status' },
      { value: 'NodeTag', name: 'Node Tag' },
      { value: 'DiskTag', name: 'Disk Tag' },
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
        pathname: addPrefix('/node'),
        search: queryString.stringify({
          ...queryString.parse(location.search),
          field: filterField,
          value: filterValue,
          stateValue: filterStateValue,
        }),
      })) : dispatch(routerRedux.push({
        pathname: addPrefix('/node'),
        search: queryString.stringify({}),
      }))
    },
  }

  return (
    <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
      <HostFilter ref={(component) => { hostFilter = component }} {...HostFilterProps} />
      <HostList ref={(component) => { hostList = component }} {...hostListProps} />
      {modalVisible && <AddDisk {...addDiskModalProps} />}
      {replicaModalVisible && <HostReplica {...hostReplicaModalProps} />}
      {editDisksModalVisible && <EditDisk {...editDiskModalProps} />}
      {diskReplicaModalVisible && <HostReplica {...diskReplicaModalProps} />}
      {editBulkNodesModalVisible && <BulkEditNode {...editBulkNodesModalProps} />}
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
