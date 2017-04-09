import React, { PropTypes } from 'react'
import { Table, Modal } from 'antd'
import { DropOption } from '../../components'
import moment from 'moment'
const confirm = Modal.confirm

function list({ loading, dataSource, showRestoreBackup, deleteBackup }) {
  const handleMenuClick = (record, event) => {
    switch (event.key) {
      case 'restore':
        showRestoreBackup(record)
        break
      case 'delete':
        confirm({
          title: `Are you sure you want to delete backup ${record.name} ?`,
          onOk() {
            deleteBackup(record)
          },
        })
        break
      default:
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    }, {
      title: 'Volume',
      dataIndex: 'volumeName',
      key: 'volumeName',
    }, {
      title: 'Snaphost Name',
      dataIndex: 'snapshotName',
      key: 'snapshotName',
    }, {
      title: 'Timestamp',
      dataIndex: 'snapshotCreated',
      key: 'snapshotCreated',
      render: (text) => {
        return (
          <div>
            {moment(new Date(text)).fromNow()}
          </div>
        )
      },
    }, {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    }, {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: (text) => {
        return (
          <div>
            {moment(new Date(text)).fromNow()}
          </div>
        )
      },
    }, {
      title: '',
      key: 'operation',
      width: 100,
      render: (text, record) => {
        return (
          <DropOption menuOptions={[
            { key: 'delete', name: 'Delete' },
            { key: 'restore', name: 'Restore' },
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
  showRestoreBackup: PropTypes.func,
  deleteBackup: PropTypes.func,
}

export default list
