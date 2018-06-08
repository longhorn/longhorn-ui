import React, { PropTypes } from 'react'
import { Table, Icon } from 'antd'
import classnames from 'classnames'
import moment from 'moment'
import EngineImageActions from './EngineImageActions'

function list({ loading, dataSource, deleteEngineImage }) {
  const engineImageActionsProps = {
    deleteEngineImage,
  }

  const columns = [
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (text) => {
        return (
          <div className={classnames({ [text.toLowerCase()]: true, capitalize: true })}>
            {text.hyphenToHump()}
          </div>
        )
      },
    }, {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
    }, {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
    }, {
      title: 'Default',
      dataIndex: 'default',
      key: 'default',
      width: 100,
      render: (defualt) => {
        return (
          defualt ? <Icon type="star" /> : <div></div>
        )
      },
    }, {
      title: 'Build Date',
      dataIndex: 'buildDate',
      key: 'buildDate',
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
          <EngineImageActions {...engineImageActionsProps} selected={record} />
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
  deleteEngineImage: PropTypes.func,
}

export default list
