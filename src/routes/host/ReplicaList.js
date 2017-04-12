import React, { PropTypes } from 'react'
import { Table, Modal } from 'antd'
import { DropOption } from '../../components'
const confirm = Modal.confirm

function list({ dataSource, deleteReplica }) {
  const handleMenuClick = (record, event) => {
    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete replica ${record.name} ?`,
          onOk() {
            deleteReplica(record.name, record.removeUrl)
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
          <div className={text ? 'healthy' : 'faulted'}>{text ? 'Running' : 'Error'}</div>
        )
      },
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
    <div>
      <Table
        bordered={false}
        columns={columns}
        dataSource={dataSource}
        simple
        pagination={pagination}
        rowKey={record => record.name}
      />
    </div>
  )
}

list.propTypes = {
  dataSource: PropTypes.array,
  deleteReplica: PropTypes.func,
}

export default list
