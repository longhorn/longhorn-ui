import React, { PropTypes } from 'react'
import { Table } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { LinkTo } from '../../components'

import { formatMib } from '../../utils/formater'
import VolumeActions from './VolumeActions'

function list({ loading, dataSource, showAttachHost, showEngineUpgrade, showRecurring, showSnapshots, detach, deleteVolume, showBackups, takeSnapshot, showSalvage }) {
  const volumeActionsProps = {
    showAttachHost,
    showEngineUpgrade,
    showRecurring,
    showSnapshots,
    detach,
    showBackups,
    deleteVolume,
    takeSnapshot,
    showSalvage,
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
            <LinkTo to={`/volume/${text}`}>
              {text}
            </LinkTo>
          </div>
        )
      },
    }, {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
    }, {
      title: 'Engine Image',
      dataIndex: 'engineImage',
      key: 'engineImage',
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
  showEngineUpgrade: PropTypes.func,
  showRecurring: PropTypes.func,
  showSnapshots: PropTypes.func,
  showBackups: PropTypes.func,
  takeSnapshot: PropTypes.func,
  showSalvage: PropTypes.func,
}

export default list
