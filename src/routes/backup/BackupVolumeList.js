import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import { formatMib } from '../../utils/formater'
import { DropOption } from '../../components'
import { sortTable } from '../../utils/sort'
import { setSortOrder } from '../../utils/store'
import moment from 'moment'


class List extends React.Component {

  handleMenuClick = (record, e) => {
    if(e.key === 'recovery') {
      this.props.Create(record)
    }
  }

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
        dataIndex: 'baseImage',
        key: 'baseImage',
        width: 200,
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          )
        },
      }, {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
        width: 100,
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
        width: 200,
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
        align: 'center',
        width: 200,
        sorter: (a, b) => sortTable(a, b, 'created'),
        render: (text) => {
          return (
            <div>
              {moment(new Date(text)).fromNow()}
            </div>
          )
        },
      },{
        title: 'Operation',
        key: 'operation',
        width: 120,
        render: (text, record) => {
          return (
            <DropOption menuOptions={[
              { key: 'recovery', name: !record.lastBackupName ? 'No last backup' : 'Create Disaster Recovery Volume', disabled: !record.lastBackupName },
            ]} onMenuClick={e => this.handleMenuClick(record, e)}
            />
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
          scroll={{x: 1020, y: 570 }}
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
  Create: PropTypes.func,
}

export default List
