import React from 'react'
import { Button } from 'antd'
import PropTypes from 'prop-types'
import { routerRedux } from 'dva/router'
import { connect } from 'dva'
import queryString from 'query-string'
import HostList from './HostList'
import AddDisk from './components/AddDisk'
import EditDisk from './components/EditDisk'
import EditNode from './EditNode'
import HostReplica from './HostReplica'
import HostFilter from './HostFilter'
import BulkEditNode from './BulkEditNode'
import { filterNode, schedulableNode, unschedulableNode, schedulingDisabledNode, downNode, getNodeStatus, nodeDisks } from '../../utils/filter'

function Host({ host, disk, volume, setting, loading, dispatch, location }) {
  let hostList = null
  let hostFilter = null
  const { data, selected, replicaModalVisible, diskReplicaModalVisible, instanceManagerVisible, selectedHostRows, currentNode, editBulkNodesModalVisible, editNodeModalVisible } = host
  const { selectedDisk, addDiskModalVisible, editDiskModalVisible } = disk
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
            replica.volumeName = vol.name
            replicas.push(replica)
          }
        })
      }
    })
    agent.replicas = replicas
    nodeDisks(agent.id, disk.data).forEach(item => {
      item.replicas = replicas.filter(r => r.diskID === item.id)
    })
    agent.status = getNodeStatus(agent, disk.data)
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

      if (node && nodeDisks(node.id, disk.data).length > 0) {
        let currentDisk = nodeDisks(node.id, disk.data).find((item) => item.id === diskID)

        return currentDisk ? { ...currentDisk, name: currentDisk.path } : {}
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
    nodes = nodeFilterMap[stateValue](data, disk.data)
  } else if (field && value && field !== 'status') {
    nodes = filterNode(data, field, value)
  }

  const addDiskModalProps = {
    nodes,
    visible: addDiskModalVisible,
    onOk(diskParams) {
      dispatch({
        type: 'disk/createDisk',
        payload: diskParams,
      })
    },
    onCancel() {
      dispatch({
        type: 'disk/hideAddDiksModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }
  const editDiskModalProps = {
    selectedDisk,
    visible: editDiskModalVisible,
    onOk(diskParams) {
      dispatch({
        type: 'disk/updateDisk',
        payload: diskParams,
      })
    },
    onCancel() {
      dispatch({
        type: 'disk/hideEditDiskModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }

  const editNodeModalProps = {
    visible: editNodeModalVisible,
    node: selected,
    onOk(updateNode) {
      dispatch({
        type: 'host/updateNode',
        payload: {
          updateNode,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'host/hideEditNodeModal',
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
    onOk(opt) {
      if (opt.allowScheduling === 'noOperation') {
        dispatch({
          type: 'host/hideBulkEditNodeModal',
        })
      } else {
        dispatch({
          type: 'host/changeBulkNodeScheduling',
          payload: {
            allowScheduling: opt.allowScheduling,
            evictionRequested: opt.evictionRequested,
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
    disks: disk.data,
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
    showDiskReplicaModal(diskParams, node) {
      dispatch({
        type: 'host/showDiskReplicaModal',
        payload: {
          selectedDiskID: diskParams.id,
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
    showEditDisksModal(record) {
      dispatch({
        type: 'host/showEditNodeModal',
        payload: {
          selected: record,
        },
      })
    },
    showEditNodeModal(record) {
      dispatch({
        type: 'host/showEditNodeModal',
        payload: {
          selected: record,
        },
      })
    },
    // disk options
    deleteDisk(record) {
      dispatch({
        type: 'disk/deleteDisk',
        payload: record,
      })
    },
    updateDisk(record) {
      dispatch({
        type: 'disk/showEditDiskModal',
        payload: {
          selectedDisk: record,
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
        pathname: '/node',
        search: queryString.stringify({
          ...queryString.parse(location.search),
          field: filterField,
          value: filterValue,
          stateValue: filterStateValue,
        }),
      })) : dispatch(routerRedux.push({
        pathname: '/node',
        search: queryString.stringify({}),
      }))
    },
  }

  const addDisk = () => {
    dispatch({
      type: 'disk/showAddDiksModal',
    })
  }

  return (
    <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
      <Button style={{ position: 'absolute', top: '-50px', right: '0px' }} size="large" type="primary" onClick={addDisk}>Connect Disk</Button>
      <HostFilter ref={(component) => { hostFilter = component }} {...HostFilterProps} />
      <HostList ref={(component) => { hostList = component }} {...hostListProps} />
      {addDiskModalVisible && <AddDisk {...addDiskModalProps} />}
      {editDiskModalVisible && <EditDisk {...editDiskModalProps} />}
      {replicaModalVisible && <HostReplica {...hostReplicaModalProps} />}
      {editNodeModalVisible && <EditNode {...editNodeModalProps} />}
      {diskReplicaModalVisible && <HostReplica {...diskReplicaModalProps} />}
      {editBulkNodesModalVisible && <BulkEditNode {...editBulkNodesModalProps} />}
    </div>
  )
}

Host.propTypes = {
  host: PropTypes.object,
  disk: PropTypes.object,
  volume: PropTypes.object,
  setting: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
}

export default connect(({ volume, host, disk, setting, loading }) => ({ volume, host, disk, setting, loading: loading.models.host || loading.models.disk }))(Host)
