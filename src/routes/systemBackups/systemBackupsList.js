import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import { pagination } from '../../utils/page'
import { sortTable, sortTableByUTCDate } from '../../utils/sort'
import SystemBackupsAction from './systemBackupsAction'
import { formatDate } from '../../utils/formatDate'
import { withTranslation } from 'react-i18next'

function list({ loading, dataSource, height, rowSelection, deleteSystemBackup, createSystemRestore, t }) {
  const systemBackupActionsProps = {
    deleteSystemBackup,
    createSystemRestore,
  }

  const columns = [
    {
      title: t('columns.name'),
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
      title: t('columns.version'),
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
      title: t('columns.state'),
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
      title: t('columns.age'),
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
      title: t('columns.error'),
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
      title: t('columns.operation'),
      key: 'operation',
      width: 110,
      fixed: 'right',
      render: (text, record) => {
        return (
          <SystemBackupsAction {...systemBackupActionsProps} selected={record} />
        )
      },
    },
  ]

  // dynamic column width
  let columnWidth = 0

  columns.forEach((ele) => {
    columnWidth += ele.width
  })

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
      pagination={pagination('systemBackupSize')}
      simple
    />
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
  deleteSystemBackup: PropTypes.func,
  createSystemRestore: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(list)
