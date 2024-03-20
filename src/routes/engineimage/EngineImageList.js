import React from 'react'
import PropTypes from 'prop-types'
import { Table, Icon } from 'antd'
import classnames from 'classnames'
import { formatDate } from '../../utils/formatDate'
import EngineImageActions from './EngineImageActions'
import { LinkTo } from '../../components'

function list({ loading, dataSource, deleteEngineImage }) {
  const engineImageActionsProps = {
    deleteEngineImage,
  }

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 300,
      render: (text, record) => {
        return (
          <div>
            <LinkTo to={{ pathname: `/engineimage/${record.id}` }}>
              {text}
            </LinkTo>
          </div>
        )
      },
    }, {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (text, record) => {
        return (
          <div className={classnames({ [record.incompatible ? 'incompatible' : text.toLowerCase()]: true, capitalize: true })}>
            {record.incompatible ? 'Incompatible' : text.hyphenToHump()}
          </div>
        )
      },
    }, {
      title: 'Default',
      dataIndex: 'default',
      key: 'default',
      width: 200,
      render: _default => {
        return (
          _default ? <Icon type="star" /> : <div></div>
        )
      },
    }, {
      title: 'Reference Count',
      dataIndex: 'refCount',
      key: 'refCount',
      width: 200,
      render: (text) => {
        return (
          <div>{text}</div>
        )
      },
    }, {
      title: 'Build Date',
      dataIndex: 'buildDate',
      key: 'buildDate',
      width: 200,
      render: (text) => {
        return (
          <div>
            {formatDate(text)}
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
