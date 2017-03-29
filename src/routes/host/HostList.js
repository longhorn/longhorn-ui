import React, { PropTypes } from 'react'
import { Table } from 'antd'

function list({ loading, dataSource }) {
  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 100,
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
    }, {
      title: 'Total Space',
      dataIndex: 'total',
      key: 'total',
    }, {
      title: 'Used Space',
      dataIndex: 'used',
      key: 'used',
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
