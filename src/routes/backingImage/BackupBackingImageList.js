import React from 'react'
import PropTypes from 'prop-types'
import { Table, message, Icon, Tooltip } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import BackupBackingImageActions from './BackupBackingImageActions'
import { pagination } from '../../utils/page'
import { formatMib } from '../../utils/formatter'
import { formatDate } from '../../utils/formatDate'
import { sortTable } from '../../utils/sort'
import styles from './BackupBackingImageList.less'
import { withTranslation } from 'react-i18next'

function BackupBackingImageList({ loading, dataSource, deleteBackupBackingImage, restoreBackingImage, rowSelection, height, t }) {
  const actionsProps = {
    deleteBackupBackingImage,
    restoreBackingImage,
  }

  const onCopy = (_text, copySuccess) => {
    if (copySuccess) {
      message.success(t('backupBackingImageList.copySuccess'), 1.5)
    } else {
      message.error(t('backupBackingImageList.copyFailed'), 1.5)
    }
  }

  const columns = [
    {
      title: t('columns.name'),
      dataIndex: 'backingImageName',
      key: 'backingImageName',
      width: 120,
      sorter: (a, b) => a.backingImageName.localeCompare(b.backingImageName),
      render: (text, record) => {
        const isEncrypted = Boolean(record.secret || record.secretNamespace)
        return (
          <>
            {isEncrypted && (
              <Tooltip title={t('backupBackingImageList.tooltips.encryptedBackingImage')}>
                <Icon className="color-warning" type="lock" />
              </Tooltip>
            )}
            <span className={styles.encryptedBackup}>{text}</span>
          </>
        )
      },
    }, {
      title: t('columns.state'),
      dataIndex: 'state',
      key: 'state',
      width: 120,
      sorter: (a, b) => a.state.localeCompare(b.state),
      render: (text) => {
        return (
          <div>{text}</div>
        )
      },
    }, {
      title: t('columns.backupTarget'),
      dataIndex: 'backupTargetName',
      key: 'backupTargetName',
      width: 180,
      sorter: (a, b) => sortTable(a, b, 'backupTargetName'),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    }, {
      title: t('columns.size'),
      dataIndex: 'size',
      key: 'size',
      width: 120,
      sorter: (a, b) => parseInt(a.size, 10) - parseInt(b.size, 10),
      render: (text) => {
        return (
          <div>
            {formatMib(text)}
          </div>
        )
      },
    }, {
      title: t('columns.url'),
      dataIndex: 'url',
      key: 'url',
      width: 240,
      sorter: (a, b) => a.url.localeCompare(b.url),
      render: (text) => {
        return (
          <div>
            <CopyToClipboard onCopy={onCopy} text={text}>
              <p style={{ color: '#108ee9', cursor: 'pointer', margin: 'auto' }}>{text}</p>
            </CopyToClipboard>
          </div>
        )
      },
    },
    {
      title: t('columns.createdTime'),
      dataIndex: 'created',
      key: 'created',
      width: 180,
      sorter: (a, b) => a.created.localeCompare(b.created),
      render: (text) => {
        return (
          <div>
            {text ? formatDate(text) : ''}
          </div>
        )
      },
    }, {
      title: t('columns.operation'),
      key: 'operation',
      width: 120,
      render: (_text, record) => {
        return (
          <BackupBackingImageActions {...actionsProps} selected={record} />
        )
      },
    },
  ]

  return (
    <Table
      bordered={false}
      columns={columns}
      rowSelection={rowSelection}
      dataSource={dataSource}
      loading={loading}
      simple
      pagination={pagination('backupBackingImage')}
      rowKey={record => record.id}
      scroll={{ x: 970, y: dataSource.length > 0 ? height : 1 }}
    />
  )
}

BackupBackingImageList.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  deleteBackupBackingImage: PropTypes.func,
  restoreBackingImage: PropTypes.func,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(BackupBackingImageList)
