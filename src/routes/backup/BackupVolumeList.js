import React, { PropTypes } from 'react'
import { Table } from 'antd'
import { formatMib } from '../../utils/formater'
import { sortTable } from '../../utils/sort'
import { setSortOrder } from '../../utils/store'
import moment from 'moment'


class List extends React.Component {
  render() {
    const { backup, loading, sorter, linkToBackup, onSorterChange = f => f } = this.props
    const dataSource = backup || []

    const columns = [
      {
        title: 'Name',
        dataIndex: 'id',
        key: 'id',
        width: 200,
        sorter: (a, b) => sortTable(a, b, 'id'),
        render: (text) => {
          return (
            <a onClick={() => linkToBackup(text)}>
              {text}
            </a>
          )
        },
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
        title: ' Last Backup At',
        dataIndex: 'lastBackupAt',
        key: 'lastBackupAt',
        sorter: (a, b) => sortTable(a, b, 'lastBackupAt'),
        render: (text) => {
          return (
            <div>
              {text ? moment(new Date(text)).fromNow() : ''}
            </div>
          )
        },
      },
      {
        title: 'Created At',
        dataIndex: 'created',
        key: 'created',
        sorter: (a, b) => sortTable(a, b, 'created'),
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
    const onChange = (p, f, s) => {
      onSorterChange(s)
    }
    setSortOrder(columns, sorter)
    const locale = {
      emptyText: backup ? 'No Data' : 'Please select a volume first',
    }

    return (
      <div>
        <Table
          locale={locale}
          bordered={false}
          columns={columns}
          onChange={onChange}
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
  loading: PropTypes.bool,
  sorter: PropTypes.object,
  onSorterChange: PropTypes.func,
  linkToBackup: PropTypes.func,
}

export default List
