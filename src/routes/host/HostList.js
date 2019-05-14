import React from 'react'
import PropTypes from 'prop-types'
import { Table, Progress, Tooltip } from 'antd'
import styles from './HostList.less'
import classnames from 'classnames'
import { sortTable } from '../../utils/sort'
import DiskList from './DiskList'
import HostActions from './HostActions'
import { nodeStatusColorMap } from '../../utils/filter'
import { byteToGi, getStorageProgressStatus } from './helper/index'
import { formatMib } from '../../utils/formater'
import { setSortOrder } from '../../utils/store'

class List extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expandedRowKeys: [],
      sorterOrderChanged: false,
    }
  }
  onExpand = (expanded, record) => {
    if (expanded) {
      this.setState({
        expandedRowKeys: this.state.expandedRowKeys.concat([record.id]),
      })
    } else {
      this.setState({
        expandedRowKeys: this.state.expandedRowKeys.filter(item => item !== record.id),
      })
    }
  }
  onExpandedRowsChange = (expandedRows) => {
    const { onAllExpandedOrCollapsed = f => f, dataSource } = this.props
    if (expandedRows.length === dataSource.length) {
      onAllExpandedOrCollapsed(true)
    } else if (expandedRows.length === 0) {
      onAllExpandedOrCollapsed(false)
    }
  }
  collapseAll = () => {
    this.setState({
      expandedRowKeys: [],
    })
  }
  expandAll = () => {
    const { dataSource } = this.props
    this.setState({
      expandedRowKeys: dataSource.map(item => item.id),
    })
  }
  render() {
    const { loading, dataSource, storageOverProvisioningPercentage, minimalSchedulingQuotaWarning, showReplicaModal, toggleScheduling, deleteHost, showEditDisksModal, showDiskReplicaModal, sorter, onSorterChange = f => f } = this.props
    const hostActionsProps = {
      toggleScheduling,
      showEditDisksModal,
      deleteHost,
    }
    const computeTotalAllocated = (record) => {
      const max = Object.values(record.disks).reduce((total, item) => total + item.storageMaximum, 0)
      const reserved = Object.values(record.disks).reduce((total, item) => total + item.storageReserved, 0)
      return ((max - reserved) * storageOverProvisioningPercentage) / 100
    }
    const computeAllocated = (record) => {
      return Object.values(record.disks).reduce((total, item) => total + item.storageScheduled, 0)
    }
    const coumputeTotalUsed = (record) => {
      return Object.values(record.disks).reduce((total, item) => total + item.storageMaximum, 0)
    }
    const computeUsed = (record) => {
      return Object.values(record.disks).reduce((total, item) => total + (item.storageMaximum - item.storageAvailable), 0)
    }
    const computeSize = (record) => {
      return Object.values(record.disks).reduce((total, item) => total + (item.storageMaximum - item.storageReserved), 0)
    }
    const computeReserved = (record) => {
      return Object.values(record.disks).reduce((total, item) => total + item.storageReserved, 0)
    }
    const columns = [
      {
        title: <span style={{ display: 'inline-block', padding: '0 0 0 30px' }}>Status</span>,
        dataIndex: 'conditions.Ready.status',
        key: 'status',
        width: 210,
        className: styles.status,
        sorter: (a, b) => sortTable(a, b, 'conditions.Ready.status'),
        render: (text, record) => {
          const status = record.status
          const message = record.conditions.Ready.message
          const colorMap = nodeStatusColorMap[status.key] || { color: '', bg: '' }
          return (
            <Tooltip title={`${message}`}>
              <div style={{ padding: '0 0 0 30px' }}>
                <div className={classnames({ capitalize: true })} style={{ display: 'inline-block', padding: '0 4px', color: colorMap.color, border: `1px solid ${colorMap.color}`, backgroundColor: colorMap.bg }}>
                {status.name}
                </div>
              </div>
            </Tooltip>
          )
        },
      }, {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 300,
        className: styles.name,
        sorter: (a, b) => sortTable(a, b, 'name'),
        render: (text, record) => {
          return (
            <div style={{ textAlign: 'center' }}>
              <div>{text}</div>
              <div className={styles.secondLabel} style={{ color: '#b9b9b9' }}>{record.address}</div>
            </div>
          )
        },
      }, {
        title: 'Replicas',
        dataIndex: 'replicas',
        key: 'replicas',
        width: 96,
        className: styles.replicas,
        sorter: (a, b) => a.replicas.length - b.replicas.length,
        render: (text, record) => {
          return (
            <a style={{ textAlign: 'center', display: 'block', paddingRight: '20px' }} onClick={e => showReplicaModal(record, e)}>
              {text ? text.length : 0}
            </a>
          )
        },
      }, {
        title: 'Allocated',
        dataIndex: 'storageScheduled',
        key: 'allocated',
        width: 180,
        className: styles.allocated,
        sorter: (a, b) => computeAllocated(a) - computeAllocated(b),
        render: (text, record) => {
          const allocated = computeAllocated(record)
          const total = computeTotalAllocated(record)
          const p = total === 0 ? 0 : Math.round((allocated / total) * 100)
          return (
            <div>
              <div>
                <Tooltip title={`${p}%`}>
                  <Progress strokeWidth={14} status={getStorageProgressStatus(minimalSchedulingQuotaWarning, p)} percent={p > 100 ? 100 : p} showInfo={false} />
                </Tooltip>
              </div>
              <div className={styles.secondLabel}>
                {byteToGi(allocated)} / {byteToGi(total)} Gi
              </div>
            </div>
          )
        },
      }, {
        title: 'Used',
        key: 'used',
        width: 180,
        className: styles.used,
        sorter: (a, b) => computeUsed(a) - computeUsed(b),
        render: (text, record) => {
          const used = computeUsed(record)
          const total = coumputeTotalUsed(record)
          const p = total === 0 ? 0 : Math.round((used / total) * 100)
          return (
            <div>
              <div>
                <Tooltip title={`${p}%`}>
                  <Progress strokeWidth={14} status={getStorageProgressStatus(minimalSchedulingQuotaWarning, p)} percent={p > 100 ? 100 : p} showInfo={false} />
                </Tooltip>
              </div>
              <div className={styles.secondLabel}>
                {byteToGi(used)} / {byteToGi(total)} Gi
              </div>
            </div>
          )
        },
      }, {
        title: 'Size',
        key: 'size',
        width: 180,
        className: styles.size,
        sorter: (a, b) => computeSize(a) - computeSize(b),
        render: (text, record) => {
          const reserved = computeReserved(record)
          const total = computeSize(record)
          return (
            <div>
              <div>{formatMib(total < 0 ? 0 : total)}</div>
              <div className={styles.secondLabel} style={{ color: '#b9b9b9', height: '22px' }}>{reserved > 0 ? `+${formatMib(reserved)} Reserved` : null}</div>
            </div>
          )
        },
      }, {
        title: '',
        key: 'operation',
        width: 48,
        render: (text, record) => {
          return (
            <HostActions {...hostActionsProps} selected={record} />
          )
        },
      },
    ]
    const disks = function (node) {
      const data = Object.keys(node.disks).map(diskId => {
        const disk = node.disks[diskId]
        return {
          id: diskId,
          ...disk,
        }
      })
      return (
       <DiskList disks={data} node={node} showDiskReplicaModal={showDiskReplicaModal} storageOverProvisioningPercentage={storageOverProvisioningPercentage} minimalSchedulingQuotaWarning={minimalSchedulingQuotaWarning} />
      )
    }
    const pagination = false
    const onChange = (p, f, s) => {
      onSorterChange(s)
    }
    setSortOrder(columns, sorter)
    return (
      <div style={{ overflow: 'hidden' }}>
        <Table
          bordered={false}
          columns={columns}
          dataSource={dataSource}
          expandedRowRender={disks}
          onExpand={this.onExpand}
          expandedRowKeys={this.state.expandedRowKeys}
          onExpandedRowsChange={this.onExpandedRowsChange}
          loading={loading}
          onChange={onChange}
          simple
          pagination={pagination}
          rowKey={record => record.id}
        />
      </div>
    )
  }
}

List.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  storageOverProvisioningPercentage: PropTypes.number,
  minimalSchedulingQuotaWarning: PropTypes.number,
  showAddDiskModal: PropTypes.func,
  showReplicaModal: PropTypes.func,
  toggleScheduling: PropTypes.func,
  showEditDisksModal: PropTypes.func,
  deleteHost: PropTypes.func,
  showDiskReplicaModal: PropTypes.func,
  onAllExpandedOrCollapsed: PropTypes.func,
  sorter: PropTypes.object,
  onSorterChange: PropTypes.func,
}

export default List
