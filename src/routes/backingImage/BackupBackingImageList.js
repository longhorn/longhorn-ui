import React from 'react'
import PropTypes from 'prop-types'
import { Table, message } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import BackupBackingImageActions from './BackupBackingImageActions'
import { pagination } from '../../utils/page'
import { formatMib } from '../../utils/formatter'
import { formatDate } from '../../utils/formatDate'

function list({ loading, dataSource, deleteBackupBackingImage, restoreBackingImage, rowSelection, height }) {
  const actionsProps = {
    deleteBackupBackingImage,
    restoreBackingImage,
  }

  const onCopy = (_text, copySuccess) => {
    if (copySuccess) {
      message.success('Copied', 1.5)
    } else {
      message.error('Copy failed', 1.5)
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => {
        return (<div>{text}</div>)
      },
    }, {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 80,
      sorter: (a, b) => a.state.localeCompare(b.state),
      render: (text) => {
        return (
          <div>{text}</div>
        )
      },
    }, {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 80,
      sorter: (a, b) => parseInt(a.size, 10) - parseInt(b.size, 10),
      render: (text) => {
        return (
          <div>
            {formatMib(text)}
          </div>
        )
      },
    }, {
      title: 'URL',
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
      title: 'Created Time',
      dataIndex: 'created',
      key: 'created',
      width: 80,
      sorter: (a, b) => a.created.localeCompare(b.created),
      render: (text) => {
        return (
          <div>
            {text ? formatDate(text) : ''}
          </div>
        )
      },
    }, {
      title: 'Operation',
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
      className="common-table-class"
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

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  deleteBackupBackingImage: PropTypes.func,
  restoreBackingImage: PropTypes.func,
  rowSelection: PropTypes.object,
  height: PropTypes.number,
}

export default list
