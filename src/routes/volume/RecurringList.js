import React, { PropTypes } from 'react'
import { Table, Button } from 'antd'

function list({ dataSource }) {
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    }, {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
    }, {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
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
          <div>
            <Button style={{ marginRight: '20px' }} type="primary" icon="delete" shape="circle" />
            <Button type="primary" icon="edit" shape="circle" />
          </div>
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
