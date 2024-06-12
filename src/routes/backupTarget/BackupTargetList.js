import React from 'react'
import PropTypes from 'prop-types'
import { Table, Icon, Tooltip } from 'antd'
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
      width: 250,
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
      title: 'Available',
      dataIndex: 'available',
      key: 'available',
      width: 80,
      sorter: (a, b) => a.available - b.available,
      render: (text) => {
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {text === true ? (
               <Tooltip title="This backup target is available to sync backup to it">
                <Icon type="check-square" style={{ color: 'green', alignSelf: 'center' }} />
              </Tooltip>
            ) : (
              <Tooltip title="This backup target is unavailable, please check the URL and credential secret are all correct.">
                <Icon type="exclamation-circle" style={{ color: 'red', alignSelf: 'center' }} />
              </Tooltip>
            )}
          </div>
        )
      },
    }, {
      title: 'Operation',
      key: 'operation',
      width: 100,
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
