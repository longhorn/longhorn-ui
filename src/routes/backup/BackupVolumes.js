import React, { PropTypes } from 'react'
import { Table } from 'antd'
import { formatMib } from '../../utils/formater'
import BackupList from './BackupList'
import moment from 'moment'

function list({ loading, backups, dataSource, showRestoreBackup, deleteBackup, queryBackups }) {
  const columns = [
    {
      title: 'Volume Name',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (text) => {
        return (
          <div>
            {formatMib(text)}
          </div>
        )
      },
    }, {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      render: (text) => {
        return (
          <div>
            {moment(new Date(text)).fromNow()}
          </div>
        )
      },
    },
  ]

  const pagination = false

  const expandedRowRender = (record) => {
    const backupListProps = {
      showRestoreBackup,
      deleteBackup,
      queryBackups,
      backups,
      backupVolume: record,
    }
    return (<BackupList {...backupListProps} />)
  }

  return (
    <div>
      <Table
        bordered={false}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        simple
        pagination={pagination}
        rowKey={record => record.id}
        expandedRowRender={expandedRowRender}
      />
    </div>
  )
}

list.propTypes = {
  backups: PropTypes.object,
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  showRestoreBackup: PropTypes.func,
  deleteBackup: PropTypes.func,
  queryBackups: PropTypes.func,
}

export default list
