import React from 'react'
import PropTypes from 'prop-types'
import { Table, Modal } from 'antd'
import { DropOption, LinkTo } from '../../components'
const confirm = Modal.confirm

function list({ dataSource, deleteReplicas, rowSelection }) {
  const handleMenuClick = (record, event) => {
    switch (event.key) {
      case 'delete':
        confirm({
          title: `Are you sure you want to delete replica ${record.name}?`,
          onOk() {
            deleteReplicas([record])
          },
        })
        break
      default:
    }
  }
  const statusMap = {
    healthy: { className: 'healthy', label: 'Healthy' },
    rebuilding: { className: 'rebuilding', label: 'Rebuilding' },
    err: { className: 'error', label: 'Error' },
    unknown: { className: 'unknown', label: 'Unknown' },
    failed: { className: 'failed', label: 'Failed' },
    stopped: { className: 'stopped', label: 'Stopped' },
  }
  const parseStatus = (replica) => {
    let s
    if (replica.running) {
      const m = replica.mode.toLowerCase()
      switch (m) {
        case 'rw':
          s = statusMap.healthy
          break
        case 'wo':
          s = statusMap.rebuilding
          break
        case 'err':
          s = statusMap.err
          break
        default:
          s = statusMap.unknown
      }
    } else if (replica.failedAt === '') {
      s = statusMap.stopped
    } else {
      s = statusMap.failed
    }
    return s
  }
  const columns = [
    {
      title: 'Status',
      dataIndex: 'running',
      key: 'running',
      width: 100,
      className: 'active',
      render: (text, record) => {
        let status = parseStatus(record)
        return (
          <div className={status.className}>{status.label}</div>
        )
      },
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        let volumeName = record.volumeName ? record.volumeName : ''

        return (
          <div>
            { volumeName ? <LinkTo to={{ pathname: `/volume/${volumeName}` }}>
                {text}
              </LinkTo> : text }
          </div>
        )
      },
    }, {
      title: 'Operation',
      key: 'operation',
      width: 100,
      render: (text, record) => {
        let deleteTooltip = ''
        if (record.volState !== 'detached' && record.volState !== 'attached') {
          deleteTooltip = `Replica belongs to volume currently ${record.volState}. Volume must be attached or detached.`
        }
        return (
          <DropOption menuOptions={[
            { key: 'delete', name: 'Delete', disabled: deleteTooltip !== '', tooltip: deleteTooltip },
          ]}
            onMenuClick={e => handleMenuClick(record, e)}
          />
        )
      },
    },
  ]

  const pagination = true

  return (
    <div>
      <Table
        bordered={false}
        columns={columns}
        dataSource={dataSource}
        simple
        size="small"
        pagination={pagination}
        rowKey={record => record.name}
        rowSelection={rowSelection}
      />
    </div>
  )
}

list.propTypes = {
  dataSource: PropTypes.array,
  deleteReplicas: PropTypes.func,
  rowSelection: PropTypes.object,
}

export default list
