import React from 'react'
import PropTypes from 'prop-types'
import { Table, Tooltip, Icon } from 'antd'
import BackupTargetActions from './BackupTargetActions'
import { pagination } from '../../utils/page'
import style from './BackupTargetList.less'
import { withTranslation } from 'react-i18next'

function list({ loading, dataSource, deleteBackupTarget, editBackupTarget, rowSelection, height, t }) {
  const columns = [
    {
      title: t('columns.name'),
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
      title: t('columns.url'),
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
      title: t('columns.credentialSecret'),
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
      title: t('columns.pollInterval'),
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
      title: t('columns.status'),
      dataIndex: 'available',
      key: 'available',
      width: 90,
      sorter: (a, b) => a.available - b.available,
      render: (text, record = {}) => {
        return (
          <div className={style.statusWrapper}>
            <div className={`${style.status} ${text === true ? 'healthy' : 'error'}`}>
              {text === true ? t('backupTargetList.status.available') : t('backupTargetList.status.error')}
            </div>
            {record.message && (
              <Tooltip title={record.message}>
                <Icon type="info-circle" />
              </Tooltip>
            )}
          </div>
        )
      },
    }, {
      title: t('columns.operation'),
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
  t: PropTypes.func.isRequired,
}

export default withTranslation()(list)
