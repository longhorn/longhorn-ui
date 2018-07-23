import React, { PropTypes } from 'react'
import { Table } from 'antd'
import styles from './HostList.less'
import classnames from 'classnames'
import HostActions from './HostActions'
import DiskActions from './DiskActions'
import { formatMib } from '../../utils/formater'

function list({ loading, dataSource, showReplicaModal, toggleScheduling, updateDisk, showEditDisksModal }) {
  const hostActionsProps = {
    toggleScheduling,
    showEditDisksModal,
  }
  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      className: styles.status,
      render: (text) => {
        return (
          <div className={classnames({ capitalize: true })}>
          {text}
          </div>
        )
      },
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: 'Agent Address',
      dataIndex: 'address',
      key: 'address',
    }, {
      title: 'Replicas',
      dataIndex: 'replicas',
      key: 'replicas',
      render: (text, record) => {
        return (
          <a onClick={e => showReplicaModal(record, e)}>
            {text ? text.length : 0} Replicas
          </a>
        )
      },
    }, {
      title: 'Allow Scheduling',
      dataIndex: 'allowScheduling',
      key: 'allowScheduling',
      render: (text) => {
        return (
          <div>
            {text ? 'True' : 'False'}
          </div>
        )
      },
    }, {
      title: '',
      key: 'operation',
      width: 100,
      render: (text, record) => {
        return (
          <HostActions {...hostActionsProps} selected={record} />
        )
      },
    },
  ]

  const disks = function (node) {
    const formatSi = (val) => {
      return formatMib(val)
    }
    const diskActionsProps = {
      node,
      updateDisk,
    }

    const diskColumns = [
      {
        title: 'Path',
        dataIndex: 'path',
        key: 'path',
      },
      {
        title: 'Storage Available',
        dataIndex: 'storageAvailable',
        key: 'storageAvailable',
        render: formatSi,
      },
      {
        title: 'Storage Maximum',
        dataIndex: 'storageMaximum',
        key: 'storageMaximum',
        render: formatSi,
      },
      {
        title: 'Storage Reserved',
        dataIndex: 'storageReserved',
        key: 'storageReserved',
        render: formatSi,
      },
      {
        title: 'Storage Scheduled',
        dataIndex: 'storageScheduled',
        key: 'storageScheduled',
        render: formatSi,
      },
      {
        title: 'Allow Scheduling',
        dataIndex: 'allowScheduling',
        key: 'allowScheduling',
        render: (text) => {
          return (
            <div>
              {text ? 'True' : 'False'}
            </div>
          )
        },
      },
      {
        title: '',
        key: 'opration',
        width: 100,
        render: (text, record) => {
          return (
            <DiskActions {...diskActionsProps} selected={record} />
          )
        },
      },
    ]
    const data = Object.keys(node.disks).map(diskId => {
      const disk = node.disks[diskId]
      return {
        id: diskId,
        ...disk,
      }
    })
    return (
      <Table
        columns={diskColumns}
        dataSource={data}
        pagination={false}
        rowKey={disk => disk.id}
      />
    )
  }

  const pagination = false

  return (
    <div>
      <Table
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
  updateDisk: PropTypes.func,
  showEditDisksModal: PropTypes.func,
}

export default list
