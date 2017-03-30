import React, { PropTypes } from 'react'
import { Table } from 'antd'
import { DropOption } from '../../components'
import styles from './HostList.less'

function list({ loading, dataSource, showAddDiskModal, showReplicaModal }) {
  const handleMenuClick = (event) => {
    if (event.key === '4') {
      showAddDiskModal()
    }
  }

  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      className: styles.status,
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
    }, {
      title: 'Replicas',
      dataIndex: 'replicas',
      key: 'replicas',
      render: (text, record) => {
        return (
          <a onClick={e => showReplicaModal(record, e)}>
            {text.length} Replicas
          </a>
        )
      },
    }, {
      title: 'Total Space',
      dataIndex: 'total',
      key: 'total',
    }, {
      title: 'Used Space',
      dataIndex: 'used',
      key: 'used',
    }, {
      title: '',
      key: 'operation',
      width: 100,
      render: () => {
        return (
          <DropOption menuOptions={[
            { key: '1', name: 'Deactivate' },
            { key: '2', name: 'Activate' },
            { key: '3', name: 'Delete' },
            { key: '4', name: 'Add Disk' },
          ]} onMenuClick={handleMenuClick}
          />
        )
      },
    },
  ]

  const pagination = false

  return (
    <div>
      <Table
        bordered={false}
        columns={columns}
        dataSource={dataSource}
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
}

export default list
