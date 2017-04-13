import React, { PropTypes } from 'react'
import { Table, Modal } from 'antd'
import { DropOption } from '../../components'
import { formatMib } from '../../utils/formater'
import moment from 'moment'
const confirm = Modal.confirm

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
        default:
      }
    }

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      }, {
        title: 'Volume',
        dataIndex: 'volumeName',
        key: 'volumeName',
      }, {
        title: 'Snaphost Name',
        dataIndex: 'snapshotName',
        key: 'snapshotName',
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
        title: 'Timestamp',
        dataIndex: 'snapshotCreated',
        key: 'snapshotCreated',
        render: (text) => {
          return (
            <div>
              {moment(new Date(text)).fromNow()}
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
      }, {
        title: '',
        key: 'operation',
        width: 100,
        render: (text, record) => {
          return (
            <DropOption menuOptions={[
              { key: 'delete', name: 'Delete' },
              { key: 'restore', name: 'Restore' },
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
