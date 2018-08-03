import React, { PropTypes } from 'react'
import { Table, Modal, Icon, message } from 'antd'
import { DropOption } from '../../components'
import { formatMib } from '../../utils/formater'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { sortTable } from '../../utils/sort'

import moment from 'moment'
const confirm = Modal.confirm

const BackupUrl = ({ url = '' }) => {
  const onCopy = (text, copySuccess) => { // eslint-disable-line no-unused-vars
    if (copySuccess) {
      message.success('Copyed', 1.5)
    } else {
      message.error('Copy failed', 1.5)
    }
  }

  return (
    <div>
      <h3> Backup URL: </h3>
      <p style={{ marginTop: 20, marginLeft: -40, fontSize: '1.2em' }}>
        {url}
        {
          url ?
          <CopyToClipboard onCopy={onCopy} text={url}>
              <Icon
                className="color-link"
                style={{ marginLeft: 5, fontSize: '1.2em', cursor: 'pointer' }}
                type="copy"
              />
          </CopyToClipboard> : 'URL no available'
        }
      </p>
    </div>
  )
}

BackupUrl.propTypes = {
  url: PropTypes.string,
}

class List extends React.Component {
  render() {
    const { backup, loading, showRestoreBackup, deleteBackup } = this.props
    const dataSource = backup || []
    const handleMenuClick = (record, event) => {
      switch (event.key) {
        case 'restore':
          showRestoreBackup(record)
          break
        case 'delete':
          confirm({
            title: `Are you sure you want to delete backup ${record.name} ?`,
            onOk() {
              deleteBackup(record)
            },
          })
          break
        case 'getUrl':
          Modal.info({
            width: '600',
            content: <BackupUrl url={record.url} />,
          })
          break
        default:
      }
    }

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        sorter: (a, b) => sortTable(a, b, 'id'),
      }, {
        title: 'Volume',
        dataIndex: 'volumeName',
        key: 'volumeName',
      }, {
        title: 'Snaphost Name',
        dataIndex: 'snapshotName',
        key: 'snapshotName',
        sorter: (a, b) => sortTable(a, b, 'snapshotName'),
      }, {
        title: 'Base Image',
        dataIndex: 'labels.ranchervm-base-image',
        key: 'baseImage',
      }, {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
        sorter: (a, b) => sortTable(a, b, 'size'),
        render: (text) => {
          return (
            <div>
              {formatMib(text)}
            </div>
          )
        },
      }, {
        title: 'SnapshotCreated',
        dataIndex: 'snapshotCreated',
        key: 'snapshotCreated',
        sorter: (a, b) => sortTable(a, b, 'snapshotCreated'),
        render: (text) => {
          return (
            <div>
              {moment(new Date(text)).fromNow()}
            </div>
          )
        },
      }, {
        title: '',
        key: 'operation',
        width: 100,
        render: (text, record) => {
          return (
            <DropOption menuOptions={[
              { key: 'delete', name: 'Delete' },
              { key: 'restore', name: 'Restore' },
              { key: 'getUrl', name: 'Get URL' },
            ]} onMenuClick={e => handleMenuClick(record, e)}
            />
          )
        },
      },
    ]

    const pagination = false

    const locale = {
      emptyText: backup ? 'No Data' : 'Please select a volume first',
    }

    return (
      <div>
        <Table
          locale={locale}
          bordered={false}
          columns={columns}
          loading={loading}
          dataSource={dataSource}
          simple
          pagination={pagination}
          rowKey={record => record.id}
        />
      </div>
    )
  }
}

List.propTypes = {
  backup: PropTypes.array,
  showRestoreBackup: PropTypes.func,
  deleteBackup: PropTypes.func,
  loading: PropTypes.bool,
}

export default List
