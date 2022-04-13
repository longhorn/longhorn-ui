import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import RecurringJobActions from './RecurringJobActions'
import prettyCron from '../../utils/prettycron'
import { pagination } from '../../utils/page'

function list({ loading, dataSource, rowSelection, height, deleteRecurringJob, editRecurringJob }) {
  const recurringJobActionsProps = {
    deleteRecurringJob,
    editRecurringJob,
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text, record) => {
        return (
          <div>{record.name}</div>
        )
      },
    }, {
      title: 'Groups',
      dataIndex: 'groups',
      key: 'groups',
      width: 200,
      render: (text, record) => {
        return (
          <div>{record.groups && record.groups.join(', ')}</div>
        )
      },
    }, {
      title: 'Type',
      dataIndex: 'task',
      key: 'task',
      width: 100,
      render: (text, record) => {
        return (
          <div>{record.task}</div>
        )
      },
    }, {
      title: 'Schedule',
      dataIndex: 'cron',
      key: 'cron',
      width: 200,
      render: (text, record) => {
        return (
          <div>
            {prettyCron.toString(record.cron)}
          </div>
        )
      },
    }, {
      title: 'Labels',
      dataIndex: 'labels',
      key: 'labels',
      width: 200,
      render: (text, record) => {
        return (
          <div>{record.labels && Object.keys(record.labels).map((key) => {
            return key ? `${key}: ${record.labels[key]}` : ''
          }).join(', ')}</div>
        )
      },
    }, {
      title: 'Retain',
      key: 'retain',
      width: 120,
      render: (record) => {
        return (
          <div>{record.retain}</div>
        )
      },
    }, {
      title: 'Concurrency',
      key: 'concurrency',
      width: 120,
      render: (record) => {
        return (
          <div>{record.concurrency}</div>
        )
      },
    }, {
      title: 'Operation',
      key: 'operation',
      width: 120,
      render: (text, record) => {
        return (
          <RecurringJobActions {...recurringJobActionsProps} selected={record} />
        )
      },
    },
  ]

  return (
    <div id="recurringJobTable" style={{ flex: 1, height: '1px', overflow: 'hidden' }}>
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
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
  deleteRecurringJob: PropTypes.func,
  editRecurringJob: PropTypes.func,
}

export default list
