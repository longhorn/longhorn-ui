import React from 'react'
import PropTypes from 'prop-types'
import { Table, Tag } from 'antd'
import { LinkTo } from '../../components'
import SnapshotGroupActions from './SnapshotGroupActions'
import { pagination } from '../../utils/page'
import { formatDate } from '../../utils/formatDate'

const phaseColorMap = {
  Ready: 'green',
  InProgress: 'blue',
  Failed: 'red',
  Degraded: 'orange',
}

function getPhase(record = {}) {
  // Degraded is a condition on a Ready group; surface it as the visible status.
  if (record.degraded) {
    return 'Degraded'
  }
  return record.status?.phase || record.phase || 'InProgress'
}

function getMemberProgress(record = {}) {
  const members = record.status?.members || record.members || []
  const ready = members.filter(m => m.readyToUse).length
  return `${ready}/${members.length}`
}

function list({ loading, dataSource, deleteSnapshotGroup, recreateSnapshotGroup, rowSelection, height }) {
  const columns = [
    {
      title: 'Status',
      key: 'status',
      width: 140,
      render: (text, record) => {
        const phase = getPhase(record)
        return (
          <Tag color={phaseColorMap[phase] || 'default'}>{phase}</Tag>
        )
      },
    }, {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => {
        return (
          <LinkTo to={{ pathname: `/snapshotGroup/${text}` }}>{text}</LinkTo>
        )
      },
    }, {
      title: 'Members',
      key: 'members',
      width: 100,
      render: (text, record) => {
        return (
          <div>{getMemberProgress(record)}</div>
        )
      },
    }, {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      width: 180,
      sorter: (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
      render: (text) => {
        return (
          <div>{formatDate(text)}</div>
        )
      },
    }, {
      title: 'Operation',
      key: 'operation',
      width: 110,
      fixed: 'right',
      render: (text, record) => {
        return (
          <SnapshotGroupActions
            selected={record}
            deleteSnapshotGroup={deleteSnapshotGroup}
            recreateSnapshotGroup={recreateSnapshotGroup}
          />
        )
      },
    },
  ]

  return (
    <div id="snapshotGroupTable" style={{ flex: 1, height: '1px', overflow: 'hidden' }}>
      <Table
        className="common-table-class"
        bordered={false}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={dataSource}
        loading={loading}
        simple
        pagination={pagination('snapshotGroupPageSize')}
        rowKey={record => record.name}
        scroll={{ x: 730, y: dataSource.length > 0 ? height : 1 }}
      />
    </div>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  deleteSnapshotGroup: PropTypes.func,
  recreateSnapshotGroup: PropTypes.func,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
}

export default list
