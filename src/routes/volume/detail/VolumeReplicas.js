import React, { PropTypes } from 'react'
import { Table, Card } from 'antd'

function list({ loading, dataSource }) {
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
}

export default list
