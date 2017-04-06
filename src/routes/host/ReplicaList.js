import React, { PropTypes } from 'react'
import { Table } from 'antd'

function list({ dataSource }) {
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
}

export default list
