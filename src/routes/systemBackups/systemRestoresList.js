import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import { pagination } from '../../utils/page'
import { sortTable, sortTableByUTCDate } from '../../utils/sort'
import { formatDate } from '../../utils/formatDate'
import SystemRestoresAction from './systemRestoresAction'

function list({ loading, dataSource, height, rowSelection, deleteSystemRestore }) {
  const systemRestoresActionsProps = {
    deleteSystemRestore,
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 120,
      key: 'name',
      sorter: (a, b) => sortTable(a, b, 'name'),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    },
    {
      title: 'Version',
      dataIndex: 'version',
      width: 120,
      key: 'version',
      sorter: (a, b) => sortTable(a, b, 'version'),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    },
    {
      title: 'State',
      dataIndex: 'state',
      width: 120,
      key: 'state',
      sorter: (a, b) => sortTable(a, b, 'state'),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    },
    {
      title: 'Age',
      dataIndex: 'createdAt',
      width: 120,
      key: 'createdAt',
      sorter: (a, b) => sortTableByUTCDate(a, b, 'createdAt'),
      render: (text) => {
        return (
          <div>
            {formatDate(text)}
          </div>
        )
      },
    },
    {
      title: 'Error',
      dataIndex: 'error',
      width: 220,
      key: 'error',
      sorter: (a, b) => sortTable(a, b, 'error'),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
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
          <SystemRestoresAction {...systemRestoresActionsProps} selected={record} />
        )
      },
    },
  ]

  // dynamic column width
  let columnWidth = 0

  columns.forEach((ele) => {
    columnWidth += ele.width
  })
  // const scroll = dataSource.length > 0 ? { x: columnWidth, y: height } : { x: columnWidth }
  return (
    <Table
      className="common-table-class"
      bordered={false}
      columns={columns}
      dataSource={dataSource}
      rowSelection={rowSelection}
      rowKey={record => record.name}
      loading={loading}
      height={`${dataSource.length > 0 ? height : 1}px`}
      scroll={{ x: columnWidth, y: dataSource.length > 0 ? height : 1 }}
      pagination={pagination('SystemRestoreSize')}
      simple
    />
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
  deleteSystemRestore: PropTypes.func,
}

export default list
