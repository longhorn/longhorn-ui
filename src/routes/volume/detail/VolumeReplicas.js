import React, { PropTypes } from 'react'
import { Table, Card } from 'antd'
import { DropOption } from '../../../components'

function list({ loading, dataSource }) {
  const columns = [
    {
      title: 'Status',
      dataIndex: 'running',
      key: 'running',
      width: 100,
      className: 'active',
      render: () => {
        return (
          <span>Healthy</span>
        )
      },
    }, {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
    }, {
      title: 'Used',
      dataIndex: 'used',
      key: 'used',
    }, {
      title: 'Host',
      dataIndex: 'hostId',
      key: 'hostId',
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
    <Card bordered={false} bodyStyle={{ padding: 0 }}>
      <Table
        bordered={false}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        simple
        pagination={pagination}
        rowKey={record => record.id}
      />
    </Card>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
}

export default list
