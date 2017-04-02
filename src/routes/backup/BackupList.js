import React, { PropTypes } from 'react'
import { Table } from 'antd'
import { DropOption } from '../../components'

function list({ loading, dataSource, showRestoreBackup }) {
  const handleMenuClick = (record, event) => {
    if (event.key === '2') {
      showRestoreBackup(record)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    }, {
      title: 'Snaphost Name',
      dataIndex: 'snapshot',
      key: 'snapshot',
    }, {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
    }, {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    }, {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
    }, {
      title: '',
      key: 'operation',
      width: 100,
      render: (text, record) => {
        return (
          <DropOption menuOptions={[
            { key: '1', name: 'Delete' },
            { key: '2', name: 'Restore' },
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
}

export default list
