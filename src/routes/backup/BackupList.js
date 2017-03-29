import React, { PropTypes } from 'react'
import { Table } from 'antd'

function list({ loading, dataSource }) {
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
}

export default list
