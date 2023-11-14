import React from 'react'
import PropTypes from 'prop-types'
import { Progress, Table, Tooltip } from 'antd'
import { pagination } from '../../utils/page'
import ObjectStoreActions from './ObjectStoreActions'
import { sortTable } from '../../utils/sort'
import { setSortOrder } from '../../utils/store'
import styles from './ObjectStoreList.less'
import { bytesToGiB, getStorageStatus } from './helper/index'

function list({
  dataSource,
  height,
  loading,
  rowSelection,
  editObjectStore,
  stopStartObjectStore,
  deleteObjectStore,
  administrateObjectStore,
  onSorterChange,
  sorter,
  onRowClick,
}) {
  const actionsProps = {
    editObjectStore,
    stopStartObjectStore,
    deleteObjectStore,
    administrateObjectStore,
  }

  const storeStateColorMap = {
    unknown: { color: '#F15354', bg: 'rgba(241,83,84,.05)' },
    starting: { color: '#F1C40F', bg: 'rgba(241,196,15,.05)' },
    running: { color: '#27AE5F', bg: 'rgba(39,174,95,.05)' },
    stopping: { color: '#DEE1E3', bg: 'rgba(241,241,241,.05)' },
    stopped: { color: '#959CA6', bg: 'rgba(241,241,241,.05)' },
    terminating: { color: '#DEE1E3', bg: 'rgba(222,225,227,.05)' },
    error: { color: '#F15354', bg: 'rgba(241,83,84,.1)' },
  }

  const computeUsage = (record) => {
    return Math.round(record.occupiedSize / record.allocatedSize * 100)
  }

  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 160,
      sorter: (a, b) => sortTable(a, b, 'state'),
      render: (text, record) => {
        const tooltip = `Object Store ${record.name} is ${record.state}`
        const colormap = storeStateColorMap[record.state] || { color: '', bg: '' }
        return (
          <Tooltip title={tooltip}>
            <div className="capitalize" style={{ display: 'inline-block', padding: '0 4px', color: colormap.color, border: `1px solid ${colormap.color}`, backgroundColor: colormap.bg }}>
              {record.state}
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => sortTable(a, b, 'name'),
      render: (text, record) => {
        return (
          <div>{record.name}</div>
        )
      },
    },
    {
      title: 'Usage',
      dataIndex: 'storageUsed',
      key: 'usage',
      width: 160,
      className: styles.allocated,
      sorter: (a, b) => computeUsage(a) - computeUsage(b),
      render: (text, record) => {
        const p = computeUsage(record)
        return (
          <div>
            <div>
              <Tooltip title={`${p}%`}>
                <Progress strokeWidth={14} status={getStorageStatus(p)} percent={p > 100 ? 100 : p} showInfo={false} />
              </Tooltip>
            </div>
            <div className={styles.secondLabel}>
              {bytesToGiB(record.occupiedSize)} / {bytesToGiB(record.allocatedSize)} GiB
            </div>
          </div>
        )
      },
    },
    {
      title: 'Endpoints',
      dataIndex: 'endpoints',
      key: 'endpoints',
      width: 500,
      render: (text, record) => {
        return (
          <div>{record.endpoints}</div>
        )
      },
    },
    {
      title: 'Operation',
      key: 'operation',
      width: 110,
      fixed: 'right',
      render: (text, record) => {
        return (
          <ObjectStoreActions {...actionsProps} selected={record} />
        )
      },
    },
  ]

  setSortOrder(columns, sorter)

  return (
    <div id="objectStoreTable" style={{ flex: 1, height: '1px', overflow: 'hidden' }}>
      <Table
        className="common-table-class"
        bordered={false}
        columns={columns}
        onChange={(p, f, s) => onSorterChange(s)}
        rowSelection={rowSelection}
        dataSource={dataSource}
        loading={loading}
        onRowClick={onRowClick}
        simple
        pagination={pagination('objectStoreSize')}
        rowKey={record => record.id}
        scroll={{ x: 970, y: dataSource.length > 0 ? height : 1 }}
      />
    </div>
  )
}

list.propTypes = {
  dataSource: PropTypes.array,
  height: PropTypes.number,
  loading: PropTypes.bool,
  rowSelection: PropTypes.object,
  editObjectStore: PropTypes.func,
  deleteObjectStore: PropTypes.func,
  stopStartObjectStore: PropTypes.func,
  administrateObjectStore: PropTypes.func,
  sorter: PropTypes.object,
  onSorterChange: PropTypes.func,
  onRowClick: PropTypes.func,
}

export default list
