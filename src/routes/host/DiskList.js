import React from 'react'
import PropTypes from 'prop-types'
import { Table, Progress, Tooltip } from 'antd'
import { byteToGi, getStorageProgressStatus } from './helper/index'
import { formatMib } from '../../utils/formater'
import './DiskList.less'

function diskList({ disks, node, storageOverProvisioningPercentage, minimalSchedulingQuotaWarning, showDiskReplicaModal }) {
  const getDiskStatus = (d) => {
    if (node.conditions.Ready.status.toLowerCase() === 'false') {
      return (<span className="error">Error</span>)
    }
    if (node.allowScheduling === false || d.allowScheduling === false) {
      return (<span className="disabled">Disabled</span>)
    }
    const status = d.conditions.Schedulable.status.toLowerCase() === 'true'
    if (status) {
      return (<span className="schedulable">Schedulable</span>)
    }
    return (<span className="unschedulable">Unschedulable</span>)
  }
  const columns = [
    {
      key: 'status',
      width: 160,
      render: (text, record) => {
        return (<div style={{ padding: '0 0 0 20px' }} className="status">{getDiskStatus(record)}</div>)
      },
    },
    {
      key: 'path',
      dataIndex: 'path',
      width: 360,
      render: (text) => {
        return (
          <div className="path" style={{textAlign: 'center'}}>
            <span className="pathLabel">Path: &nbsp;</span>
            <span>{text}</span>
          </div>
        )
      },
    },
    {
      key: 'replicas',
      dataIndex: 'replicas',
      width: 96,
      render: (text, record) => {
        return (
          <div className="replicas">
            <a onClick={() => showDiskReplicaModal(record)}>
              {text ? text.length : 0}
            </a>
          </div>
        )
      },
    },
    {
      key: 'allocated',
      dataIndex: 'storageScheduled',
      width: 180,
      render: (text, record) => {
        const allocated = text
        const total = ((record.storageMaximum - record.storageReserved) * storageOverProvisioningPercentage) / 100
        const p = total === 0 ? 0 : Math.round((allocated / total) * 100)
        return (
          <div className="allocated">
            <div>
            <Tooltip title={`${p}%`}>
              <Progress strokeWidth={14} status={getStorageProgressStatus(minimalSchedulingQuotaWarning, p)} percent={p > 100 ? 100 : p} showInfo={false} />
            </Tooltip>
            </div>
            <div className="secondLabel">
              {byteToGi(allocated)} / {byteToGi(total)} Gi
            </div>
          </div>
        )
      },
    },
    {
      key: 'used',
      width: 180,
      render: (text, record) => {
        const used = record.storageMaximum - record.storageAvailable
        const total = record.storageMaximum
        const p = total === 0 ? 0 : Math.round((used / total) * 100)
        return (
          <div className="used">
            <div>
              <Tooltip title={`${p}%`}>
                <Progress strokeWidth={14} status={getStorageProgressStatus(minimalSchedulingQuotaWarning, p)} percent={p > 100 ? 100 : p} showInfo={false} />
              </Tooltip>
            </div>
            <div className="secondLabel">
              {byteToGi(used)} / {byteToGi(total)} Gi
            </div>
          </div>
        )
      },
    },
    {
      key: 'size',
      width: 180,
      render: (text, record) => {
        const reserved = record.storageReserved
        const total = record.storageMaximum - record.storageReserved
        return (
          <div className="size">
            <div>{formatMib(total)}</div>
            <div className="secondLabel" style={{ color: '#b9b9b9', height: '22px' }}>{reserved > 0 ? `+${formatMib(reserved)} Reserved` : null}</div>
          </div>
        )
      },
    },
    {
      key: 'operation',
      width: 38,
    },
  ]

  const pagination = false
  return (
    <div className="diskList">
      <div className="title">Disks</div>
      <div className="content">
        <Table
          showHeader={false}
          defaultExpandAllRows
          bordered={false}
          columns={columns}
          dataSource={disks}
          simple
          pagination={pagination}
          rowKey={record => record.id}
        />
      </div>
    </div>
  )
}
diskList.propTypes = {
  disks: PropTypes.array,
  node: PropTypes.object,
  storageOverProvisioningPercentage: PropTypes.number,
  minimalSchedulingQuotaWarning: PropTypes.number,
  showDiskReplicaModal: PropTypes.func,
}

export default diskList
