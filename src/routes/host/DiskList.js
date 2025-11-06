import React from 'react'
import PropTypes from 'prop-types'
import { Table, Progress, Tooltip, Tag } from 'antd'
import { byteToGi, getStorageProgressStatus } from './helper/index'
import { diskTagColor } from '../../utils/constants'
import { NODE_STATUS } from '../../utils/status'
import { formatMib } from '../../utils/formatter'
import './DiskList.less'

function diskList({ disks, node, storageOverProvisioningPercentage, minimalSchedulingQuotaWarning, showDiskReplicaModal }) {
  const getDiskStatus = (record) => {
    const readyStatus = node?.conditions?.Ready?.status?.toLowerCase()
    const schedulableStatus = node?.conditions?.Schedulable?.status?.toLowerCase()
    const diskSchedulable = record?.conditions?.Schedulable?.status?.toLowerCase()

    if (readyStatus === 'false') {
      return { label: <span className="error">Error</span>, statusKey: 'error' }
    }

    if (node?.allowScheduling === false || record?.allowScheduling === false) {
      return { label: <span className="disabled">Disabled</span>, statusKey: NODE_STATUS.DISABLED }
    }

    if (schedulableStatus === 'false' || diskSchedulable === 'false') {
      return { label: <span className="unschedulable">Unschedulable</span>, statusKey: NODE_STATUS.UNSCHEDULABLE }
    }

    return { label: <span className="schedulable">Schedulable</span>, statusKey: NODE_STATUS.SCHEDULABLE }
  }

  const columns = [
    {
      key: 'status',
      width: 170,
      render: (text, record) => {
        const { label, statusKey } = getDiskStatus(record)
        const schedulableMessage = record?.conditions?.Schedulable?.message

        const StatusTag = (
          <div style={{ padding: '0 0 0 20px' }} className="status">
            {label}
          </div>
        )

        if (statusKey === NODE_STATUS.UNSCHEDULABLE && schedulableMessage) {
          return (
            <Tooltip
              title={schedulableMessage}
              overlayStyle={{ maxWidth: 350 }}
              overlayInnerStyle={{ whiteSpace: 'normal' }}
            >
              {StatusTag}
            </Tooltip>
          )
        }

        return StatusTag
      },
    },
    {
      key: 'id',
      dataIndex: 'id',
      width: 200,
      render: (text) => {
        return (<div>{text}</div>)
      },
    },
    {
      key: 'diskType',
      dataIndex: 'diskType',
      width: 100,
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    },
    {
      key: 'path',
      dataIndex: 'path',
      width: 360,
      render: (text) => {
        return (
          <div className="path" style={{ textAlign: 'center' }}>
            <span className="pathLabel">Path: &nbsp;</span>
            <span>{text}</span>
          </div>
        )
      },
    },
    {
      key: 'scheduledReplica',
      dataIndex: 'scheduledReplica',
      width: 96,
      render: (replicas, record) => {
        let numberOfReplicas = replicas ? Object.keys(replicas).length : 0

        return (
          <div className="replicas">
            <a onClick={() => showDiskReplicaModal(record, node)}>
              {numberOfReplicas}
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
            <div className="secondLabel" style={{ textAlign: 'center' }}>
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
            <div className="secondLabel" style={{ textAlign: 'center' }}>
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
          <div className="size" style={{ textAlign: 'center' }}>
            <div>{formatMib(total)}</div>
            <div className="secondLabel" style={{ color: '#b9b9b9', height: '22px' }}>{reserved > 0 ? `+${formatMib(reserved)} Reserved` : null}</div>
          </div>
        )
      },
    },
    {
      title: 'Tags',
      key: 'tags',
      width: 100,
      render: (text, record) => {
        let forMap = (tag, index) => {
          return (
            <span style={{ marginBottom: '6px' }} key={index}>
              <Tag color={diskTagColor}>
                {tag}
              </Tag>
            </span>
          )
        }
        let tagChild = ''
        if (record.tags) {
          tagChild = record.tags.map(forMap)
        }

        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
            {tagChild}
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
          scroll={{ y: '100%' }}
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
