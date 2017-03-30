import React, { PropTypes } from 'react'
import { Table } from 'antd'
import { DropOption } from '../../components'

function list({ dataSource }) {
  const columns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      className: 'active',
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: 'Used',
      dataIndex: 'used',
      key: 'used',
    }, {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
    }, {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
    }, {
      title: '',
      key: 'operation',
      width: 100,
      render: () => {
        return (
          <DropOption menuOptions={[
            { key: '1', name: 'Delete' },
          ]} />
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
        rowKey={record => record.id}
      />
    </div>
  )
}

list.propTypes = {
  dataSource: PropTypes.array,
}

export default list
