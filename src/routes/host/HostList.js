import React, { PropTypes } from 'react'
import { Table } from 'antd'
import styles from './HostList.less'

function list({ loading, dataSource, showReplicaModal }) {
  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      className: styles.status,
      render: () => {
        return (
          <div>Activate</div>
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
