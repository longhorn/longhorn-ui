import React, { PropTypes } from 'react'
import { Table, Tooltip } from 'antd'
import styles from './HostList.less'
import classnames from 'classnames'
import HostActions from './HostActions'
import { sortTable } from '../../utils/sort'
import DiskList from './DiskList'
import IconEdit from './components/IconEdit'
import StorageInfo from './components/StorageInfo'
import { getNodeStatus, nodeStatusColorMap } from '../../utils/filter'

function list({ loading, dataSource, showReplicaModal, toggleScheduling, showEditDisksModal }) {
  const hostActionsProps = {
    toggleScheduling,
  }
  const columns = [
    {
      title: 'Status',
      dataIndex: 'conditions.Ready.status',
      key: 'status',
      width: 120,
      className: styles.status,
      sorter: (a, b) => sortTable(a, b, 'conditions.Ready.status'),
      render: (text, record) => {
        const status = getNodeStatus(record)
        return (
          <div className={classnames({ capitalize: true })} style={{ color: nodeStatusColorMap[status.key] }}>
          {status.name}
          </div>
        )
      },
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 400,
      className: styles.name,
      sorter: (a, b) => sortTable(a, b, 'name'),
    }, {
      title: 'Agent Address',
      dataIndex: 'address',
      key: 'address',
      width: 180,
      className: styles.agentAddress,
      sorter: (a, b) => sortTable(a, b, 'address'),
    }, {
      title: 'Replicas',
      dataIndex: 'replicas',
      key: 'replicas',
      width: 120,
      className: styles.replicas,
      render: (text, record) => {
        return (
          <a onClick={e => showReplicaModal(record, e)}>
            {text ? text.length : 0} {text && text.length > 1 ? 'Replicas' : 'Replica'}
          </a>
        )
      },
    }, {
      title: '',
      dataIndex: 'disks',
      key: 'disks',
      render: (disks) => {
        const diskObjs = Object.values(disks)
        const storage = {
          storageAvailable: diskObjs.reduce((total, d) => total + d.storageAvailable, 0),
          storageMaximum: diskObjs.reduce((total, d) => total + d.storageMaximum, 0),
          storageReserved: diskObjs.reduce((total, d) => total + d.storageReserved, 0),
          storageScheduled: diskObjs.reduce((total, d) => total + d.storageScheduled, 0),
        }

        return <StorageInfo storage={storage} />
      },
    }, {
      title: 'Scheduling',
      dataIndex: 'allowScheduling',
      key: 'allowScheduling',
      width: 220,
      className: styles.allowScheduling,
      sorter: (a, b) => sortTable(a, b, 'allowScheduling'),
      render: (text, record) => {
        return (
          <HostActions {...hostActionsProps} selected={record} />
        )
      },
    }, {
      title: '',
      key: 'operation',
      width: 50,
      render: (text, record) => {
        return (
          <Tooltip placement="top" title="Edit Disks"> <a shape="circle" icon="edit" onClick={() => showEditDisksModal(record)} ><IconEdit width={12} height={12} /></a> </Tooltip>
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
     <DiskList disks={data} node={node} />
    )
  }

  const pagination = false

  return (
    <div>
      <Table
        className={styles.table}
        defaultExpandAllRows
        bordered={false}
        columns={columns}
        dataSource={dataSource}
        expandedRowRender={disks}
        loading={loading}
        simple
        pagination={pagination}
        rowKey={record => record.id}
      />
    </div>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  showAddDiskModal: PropTypes.func,
  showReplicaModal: PropTypes.func,
  toggleScheduling: PropTypes.func,
  showEditDisksModal: PropTypes.func,
}

export default list
