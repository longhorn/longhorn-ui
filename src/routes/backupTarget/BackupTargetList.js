import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import BackupTargetActions from './BackupTargetActions'
import { pagination } from '../../utils/page'

function list({ loading, dataSource, deleteBackupTarget, editBackupTarget, rowSelection, height }) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => {
        return (
          <div>{text}</div>
        )
      },
    }, {
      title: 'URL',
      dataIndex: 'backupTargetURL',
      key: 'backupTargetURL',
      width: 220,
      sorter: (a, b) => a.backupTargetURL.localeCompare(b.backupTargetURL),
      render: (text) => {
        return (
          <div>{text}</div>
        )
      },
    }, {
      title: 'Credential Secret',
      dataIndex: 'credentialSecret',
      key: 'credentialSecret',
      width: 150,
      sorter: (a, b) => a.credentialSecret.localeCompare(b.credentialSecret),
      render: (text) => {
        return (
          <div>{text}</div>
        )
      },
    }, {
      title: 'Poll Interval',
      dataIndex: 'pollInterval',
      key: 'pollInterval',
      width: 100,
      sorter: (a, b) => a.pollInterval.localeCompare(b.pollInterval),
      render: (text) => {
        return (
          <div>{text}</div>
        )
      },
    }, {
      title: 'Status',
      dataIndex: 'available',
      key: 'available',
      width: 90,
      sorter: (a, b) => a.available - b.available,
      render: (text) => {
        return (
          <div className={text === true ? 'healthy' : 'error'}>
            {text === true ? 'Available' : 'Error'}
          </div>
        )
      },
    }, {
      title: 'Operation',
      key: 'operation',
      width: 110,
      fixed: 'right',
      render: (text, record) => {
        return (
          <BackupTargetActions editBackupTarget={editBackupTarget} deleteBackupTarget={deleteBackupTarget} selected={record} />
        )
      },
    },
  ]

  return (
    <div id="backupTargetTable" style={{ flex: 1, height: '1px', overflow: 'hidden' }}>
      <Table
        className="common-table-class"
        bordered={false}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={dataSource}
        loading={loading}
        simple
        pagination={pagination('backupTargetPageSize')}
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
  deleteBackupTarget: PropTypes.func,
  editBackupTarget: PropTypes.func,
}

export default list
