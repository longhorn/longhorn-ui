import React, { PropTypes } from 'react'
import { Table, Card, Modal } from 'antd'
import { DropOption } from '../../../components'
const confirm = Modal.confirm

function list({ loading, dataSource, deleteReplica }) {
  const handleMenuClick = (record, event) => {
    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete replica ${record.name} ?`,
          onOk() {
            deleteReplica(record.name)
          },
        })
        break
      default:
    }
  }
  const columns = [
    {
      title: 'Status',
      dataIndex: 'running',
      key: 'running',
      width: 100,
      className: 'active',
      render: (text) => {
        return (
          <span className={text ? 'healthy' : 'faulted'}>{text ? 'Running' : 'Error'}</span>
        )
      },
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
    }, {
      title: '',
      key: 'operation',
      width: 100,
      render: (text, record) => {
        return (
          <DropOption menuOptions={[
            { key: 'delete', name: 'Delete' },
          ]} onMenuClick={e => handleMenuClick(record, e)}
          />
        )
      },
    },
  ]

  const pagination = false

  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }}>
      <Table
        bordered={false}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        simple
        pagination={pagination}
        rowKey={record => record.name}
      />
    </Card>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  deleteReplica: PropTypes.func,
}

export default list
