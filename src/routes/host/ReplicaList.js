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
  const statusMap = {
    healthy: { className: 'healthy', label: 'Healthy' },
    rebuilding: { className: 'rebuilding', label: 'Rebuilding' },
    err: { className: 'error', label: 'Error' },
    unknown: { className: 'unknown', label: 'Unknown' },
    failed: { className: 'failed', label: 'Failed' },
  }
  const parseStatus = (replica) => {
    let s
    if (replica.running) {
      switch (replica.mode) {
        case 'rw':
          s = statusMap.healthy
          break
        case 'wo':
          s = statusMap.rebuilding
          break
        case 'err':
          s = statusMap.err
          break
        default:
          s = statusMap.unknown
      }
    } else {
      s = statusMap.failed
    }
    return s
  }
  const columns = [
    {
      title: 'Status',
      dataIndex: 'running',
      key: 'running',
      width: 100,
      className: 'active',
      render: (text, record) => {
        let status = parseStatus(record)
        return (
          <div className={status.className}>{status.label}</div>
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
