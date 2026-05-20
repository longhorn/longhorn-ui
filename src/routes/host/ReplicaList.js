import React from 'react'
import PropTypes from 'prop-types'
import { Table, Modal } from 'antd'
import { DropOption, LinkTo } from '../../components'
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

function list({ dataSource, deleteReplicas, rowSelection, t }) {
  const handleMenuClick = (record, event) => {
    switch (event.key) {
      case 'delete':
        confirm({
          title: t('replicaList.deleteConfirm', { replicaName: record.name }),
          onOk() {
            deleteReplicas([record])
          },
        })
        break
      default:
    }
  }
  const statusMap = {
    healthy: { className: 'healthy', label: t('replicaList.status.healthy') },
    rebuilding: { className: 'rebuilding', label: t('replicaList.status.rebuilding') },
    err: { className: 'error', label: t('replicaList.status.error') },
    unknown: { className: 'unknown', label: t('replicaList.status.unknown') },
    failed: { className: 'failed', label: t('replicaList.status.failed') },
    stopped: { className: 'stopped', label: t('replicaList.status.stopped') },
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
      title: t('columns.status'),
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
      title: t('columns.name'),
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
      title: t('columns.operation'),
      key: 'operation',
      width: 100,
      render: (text, record) => {
        let deleteTooltip = ''
        if (record.volState !== 'detached' && record.volState !== 'attached') {
          deleteTooltip = t('replicaList.deleteTooltip', { volumeState: record.volState })
        }
        return (
          <DropOption menuOptions={[
            { key: 'delete', name: t('common.delete'), disabled: deleteTooltip !== '', tooltip: deleteTooltip },
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
  t: PropTypes.func,
}

export default withTranslation()(list)
