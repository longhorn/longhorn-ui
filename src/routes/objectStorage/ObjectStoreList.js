import React from 'react'
import PropTypes from 'prop-types'
import { Table, Tooltip } from 'antd'
import { pagination } from '../../utils/page'
import ObjectStoreActions from './ObjectStoreActions'

function list({
  dataSource,
  height,
  loading,
  rowSelection,
  editObjectStore,
  administrateObjectStore,
  deleteObjectStore,
}) {
  const actionsProps = {
    editObjectStore,
    administrateObjectStore,
    deleteObjectStore,
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

  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 160,
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
      render: (text, record) => {
        return (
          <div>{record.name}</div>
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

  return (
    <div id="objectStoreTable" style={{ flex: 1, height: '1px', overflow: 'hidden' }}>
      <Table
        className="common-table-class"
        bordered={false}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={dataSource}
        loading={loading}
        simple
        pagination={pagination}
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
  administrateObjectStore: PropTypes.func,
  deleteObjectStore: PropTypes.func,
}

export default list
