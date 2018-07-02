import React, { PropTypes } from 'react'
import { Table } from 'antd'
import styles from './HostList.less'
import classnames from 'classnames'
import HostActions from './HostActions'

function list({ loading, dataSource, showReplicaModal, toggleScheduling }) {
  const hostActionsProps = {
    toggleScheduling,
  }
  const columns = [
    {
      title: 'State',
      dataIndex: 'status',
      key: 'status',
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
  toggleScheduling: PropTypes.func,
}

export default list
