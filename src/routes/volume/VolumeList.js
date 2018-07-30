import React, { PropTypes } from 'react'
import { Table, Icon, Tooltip } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { LinkTo } from '../../components'

import { formatMib } from '../../utils/formater'
import VolumeActions from './VolumeActions'
import { isSchedulingFailure } from './helper/index'
import { sortTable } from '../../utils/sort'

function list({ loading, dataSource, engineImages, showAttachHost, showEngineUpgrade, showRecurring, showSnapshots, detach, deleteVolume, showBackups, takeSnapshot, showSalvage, rollback, rowSelection }) {
  const volumeActionsProps = {
    engineImages,
    showAttachHost,
    showEngineUpgrade,
    showRecurring,
    showSnapshots,
    detach,
    showBackups,
    deleteVolume,
    takeSnapshot,
    showSalvage,
    rollback,
  }
  const needToWait = (state, replicas) => {
    return state === '' || state.endsWith('ing') || replicas.findIndex(item => item.mode.toLowerCase() === 'wo') > -1
  }
  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      sorter: (a, b) => sortTable(a, b, 'state'),
      render: (text, record) => {
        return (
          <div className={classnames({ [text.toLowerCase()]: true, capitalize: true })}>
            {text.hyphenToHump()} {needToWait(text, record.replicas) ? <Icon type="loading" /> : null}
          </div>
        )
      },
    }, {
      title: 'Robustness',
      dataIndex: 'robustness',
      key: 'robustness',
      width: 100,
      sorter: (a, b) => sortTable(a, b, 'robustness'),
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
      sorter: (a, b) => sortTable(a, b, 'id'),
      render: (text, record) => {
        return (
          <div>
            <LinkTo to={`/volume/${text}`}>
              {isSchedulingFailure(record) ? <Tooltip title={'The volume cannot be scheduled'}><Icon type="exclamation-circle-o" className={'error'} /></Tooltip> : null} {text}
            </LinkTo>
          </div>
        )
      },
    }, {
      title: 'Frontend',
      dataIndex: 'frontend',
      key: 'frontend',
    }, {
      title: 'Attached Node & Endpoint',
      children: [
        {
          title: 'Attached Node',
          key: 'host',
          render: (text, record) => {
            return (<div>
              {record.controllers.map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px' }} key={item.hostId}>{item.hostId}</div>)}
            </div>)
          },
        },
        {
          title: 'Endpoint',
          key: 'endpoint',
          render: (text, record) => {
            return (<div>
              {record.controllers.map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px' }} key={item.hostId}>{item.endpoint ? <span style={{ backgroundColor: '#f2f4f5', padding: '2px 5px' }}>{item.endpoint}</span> : null}</div>)}
            </div>)
          },
        },
      ],
    }, {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      sorter: (a, b) => sortTable(a, b, 'size'),
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
      sorter: (a, b) => sortTable(a, b, 'created'),
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
        rowSelection={rowSelection}
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
  engineImages: PropTypes.array,
  detach: PropTypes.func,
  deleteVolume: PropTypes.func,
  showAttachHost: PropTypes.func,
  showEngineUpgrade: PropTypes.func,
  showRecurring: PropTypes.func,
  showSnapshots: PropTypes.func,
  showBackups: PropTypes.func,
  takeSnapshot: PropTypes.func,
  showSalvage: PropTypes.func,
  rollback: PropTypes.func,
  rowSelection: PropTypes.object,
}

export default list
