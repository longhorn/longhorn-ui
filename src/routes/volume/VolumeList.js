import React, { PropTypes } from 'react'
import { Table } from 'antd'
import styles from './VolumeList.less'
import classnames from 'classnames'


function list({ loading, dataSource }) {
  const columns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    }, {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
    }, {
      title: 'Host',
      dataIndex: 'hostId',
      key: 'hostId',
    }, {
      title: 'External Id',
      dataIndex: 'externalId',
      key: 'externalId',
    }, {
      title: 'Frontend',
      dataIndex: 'frontEnd',
      key: 'frontEnd',
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
        className={classnames({ [styles.table]: true, [styles.motion]: false })}
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
