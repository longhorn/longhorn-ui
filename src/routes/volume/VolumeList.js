import React, { PropTypes } from 'react'
import { Table, Icon, Tooltip } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { LinkTo } from '../../components'

import { formatMib, utcStrToDate } from '../../utils/formater'
import VolumeActions from './VolumeActions'
import { isSchedulingFailure, getHealthState, needToWaitDone, frontends } from './helper/index'
import { sortTable, sortTableByUTCDate } from '../../utils/sort'
import { setSortOrder } from '../../utils/store'

function list({ loading, dataSource, engineImages, showAttachHost, showEngineUpgrade, showRecurring, showSnapshots, detach, deleteVolume, showBackups, takeSnapshot, showSalvage, rollback, rowSelection, sorter, onSorterChange = f => f }) {
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
  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 130,
      sorter: (a, b) => sortTable(a, b, 'state'),
      render: (text, record) => {
        return (
          <div className={classnames({ [text.toLowerCase()]: true, capitalize: true })}>
            {text.hyphenToHump()} {needToWaitDone(text, record.replicas) ? <Icon type="loading" /> : null}
          </div>
        )
      },
    }, {
      title: 'Health',
      dataIndex: 'robustness',
      key: 'robustness',
      width: 120,
      sorter: (a, b) => sortTable(a, b, 'robustness'),
      render: (text) => {
        return (
          <div className={classnames({ [text.toLowerCase()]: true, capitalize: true })}>
            {getHealthState(text)}
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
          <div style={{ minWidth: '58px' }}>
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
      width: 110,
      render: (text) => {
        return (frontends.find(item => item.value === text) || '').label
      },
    }, {
      title: 'Attached Node',
      key: 'host',
      render: (text, record) => {
        return (<div style={{ minWidth: '106px' }}>
          {record.controllers.map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px', minHeight: '22px' }} key={item.hostId}>{item.hostId ? <span>{item.hostId}</span> : <span>&nbsp;</span>}</div>)}
        </div>)
      },
    },
    {
      title: 'Endpoint',
      key: 'endpoint',
      render: (text, record) => {
        return (<div>
          {record.controllers.map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px', minHeight: '22px' }} key={item.hostId}>{item.endpoint ? <div style={{ backgroundColor: '#f2f4f5', padding: '2px 5px' }}>{item.endpoint}</div> : <span>&nbsp;</span>}</div>)}
        </div>)
      },
    }, {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      sorter: (a, b) => sortTable(a, b, 'size'),
      render: (text) => {
        return (
          <div style={{ minWidth: '46px' }}>
            {formatMib(text)}
          </div>
        )
      },
    }, {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      sorter: (a, b) => sortTableByUTCDate(a, b, 'created'),
      render: (text) => {
        return (
          <div style={{ minWidth: '72px' }}>
            {moment(utcStrToDate(text)).fromNow()}
          </div>
        )
      },
    }, {
      title: '',
      key: 'operation',
      width: 62,
      render: (text, record) => {
        return (
          <VolumeActions {...volumeActionsProps} selected={record} />
        )
      },
    },
  ]

  const pagination = false
  const onChange = (p, f, s) => {
    onSorterChange(s)
  }
  setSortOrder(columns, sorter)
  return (
    <div>
      <Table
        rowSelection={rowSelection}
        bordered={false}
        columns={columns}
        onChange={onChange}
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
  sorter: PropTypes.object,
  onSorterChange: PropTypes.func,
}

export default list
