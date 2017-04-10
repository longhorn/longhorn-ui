import React, { PropTypes } from 'react'
import { Table } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { Link } from 'dva/router'
import { formatMib } from '../../utils/formater'
import VolumeActions from './VolumeActions'

function list({ loading, dataSource, showAttachHost, showRecurring, showSnapshots, detach, deleteVolume, showBackups }) {
  const getStateWeight = (state) => {
    switch (state) {
      case 'healthy':
        return 0
      case 'faulted':
        return 1
      case 'detached':
        return 2
      default:
        return 99
    }
  }
  dataSource.sort((a, b) => getStateWeight(a.state) - getStateWeight(b.state))
  const volumeActionsProps = {
    showAttachHost,
    showRecurring,
    showSnapshots,
    detach,
    showBackups,
    deleteVolume,
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
      render: (text) => {
        return (
          <div>
            <Link to={`/volume/${text}`}>
              {text}
            </Link>
          </div>
        )
      },
    }, {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
    }, {
      title: 'Frontend',
      dataIndex: 'endpoint',
      key: 'endpoint',
    }, {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (text) => {
        return (
          <div>
            {formatMib(text)}
          </div>
        )
      },
    }, {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
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
          <VolumeActions {...volumeActionsProps} selected={record} />
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
  detach: PropTypes.func,
  deleteVolume: PropTypes.func,
  showAttachHost: PropTypes.func,
  showRecurring: PropTypes.func,
  showSnapshots: PropTypes.func,
  showBackups: PropTypes.func,
}

export default list
