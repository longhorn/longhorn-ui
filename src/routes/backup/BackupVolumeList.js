import React from 'react'
import PropTypes from 'prop-types'
import { Table, Icon, Tooltip } from 'antd'
import moment from 'moment'
import { Link } from 'dva/router'
import { formatMib } from '../../utils/formater'
import { DropOption } from '../../components'
import { sortTable } from '../../utils/sort'
import { setSortOrder } from '../../utils/store'
import { addPrefix } from '../../utils/pathnamePrefix'
import queryString from 'query-string'


class List extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      commandKeyDown: false,
    }
  }

  componentDidMount() {
    let height = document.getElementById('backTable').offsetHeight - 109
    this.setState({
      height,
    })
    window.onresize = () => {
      height = document.getElementById('backTable').offsetHeight - 109
      this.setState({
        height,
      })
      this.props.dispatch({ type: 'app/changeNavbar' })
    }
    window.addEventListener('keydown', this.onkeydown)
    window.addEventListener('keyup', this.onkeyup)
  }

  componentWillUnmount() {
    window.onresize = () => {
      this.props.dispatch({ type: 'app/changeNavbar' })
    }
    window.removeEventListener('keydown', this.onkeydown)
    window.removeEventListener('keyup', this.onkeyup)
  }

  onkeyup = () => {
    this.setState({
      ...this.state,
      commandKeyDown: false,
    })
  }

  onkeydown = (e) => {
    if ((e.keyCode === 91 || e.keyCode === 17) && !this.state.commandKeyDown) {
      this.setState({
        ...this.state,
        commandKeyDown: true,
      })
    }
  }

  handleMenuClick = (record, e) => {
    if (e.key === 'recovery') {
      this.props.Create(record)
    } else if (e.key === 'deleteAll') {
      this.props.DeleteAllBackups(record)
    } else if (e.key === 'restoreLatestBackup') {
      this.props.restoreLatestBackup(record)
    }
  }

  render() {
    const { backup, loading, sorter, rowSelection, onSorterChange, onRowClick = f => f } = this.props
    const dataSource = backup || []

    const columns = [
      {
        title: 'Name',
        dataIndex: 'id',
        key: 'id',
        width: 200,
        sorter: (a, b) => sortTable(a, b, 'id'),
        render: (id, record) => {
          let errorMessage = record.messages && record.messages.error ? record.messages.error : ''
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Tooltip title={errorMessage}>
                {errorMessage ? <Icon type="warning" style={{ marginRight: 10, color: '#f5222d' }} /> : ''}
                <Link
                  to={{
                    pathname: addPrefix(`/backup/${id}`),
                    search: queryString.stringify({
                      ...queryString.parse(this.props.search),
                      field: 'volumeName',
                      keyword: id,
                      state: true,
                    }),
                  }}>
                  {id}
                </Link>
              </Tooltip>
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
      },
      {
        title: 'Operation',
        key: 'operation',
        width: 120,
        render: (text, record) => {
          return (
            <DropOption menuOptions={[
              { key: 'recovery', name: 'Create Disaster Recovery Volume', disabled: !record.lastBackupName || (record.messages && record.messages.error) },
              { key: 'restoreLatestBackup', name: 'Restore Latest Backup', disabled: !record.lastBackupName || (record.messages && record.messages.error) },
              { key: 'deleteAll', name: 'Delete All Backups' },
            ]}
              onMenuClick={e => this.handleMenuClick(record, e)}
            />
          )
        },
      },
    ]

    const pagination = true
    const onChange = (p, f, s) => {
      onSorterChange(s)
    }
    setSortOrder(columns, sorter)
    const locale = {
      emptyText: backup ? 'No Data' : 'Please select a volume first',
    }

    return (
      <div id="backTable" style={{ overflow: 'hidden', flex: 1 }}>
        <Table
          className="back-table-class"
          rowSelection={rowSelection}
          locale={locale}
          bordered={false}
          columns={columns}
          onChange={onChange}
          onRow={record => {
            return {
              onClick: () => {
                onRowClick(record, this.state.commandKeyDown)
              },
            }
          }}
          loading={loading}
          dataSource={dataSource}
          simple
          pagination={pagination}
          rowKey={record => record.id}
          scroll={{ x: 1020, y: this.state.height }}
        />
      </div>
    )
  }
}

List.propTypes = {
  backup: PropTypes.array,
  rowSelection: PropTypes.object,
  loading: PropTypes.bool,
  sorter: PropTypes.object,
  search: PropTypes.object,
  onSorterChange: PropTypes.func,
  Create: PropTypes.func,
  onRowClick: PropTypes.func,
  DeleteAllBackups: PropTypes.func,
  dispatch: PropTypes.func,
  restoreLatestBackup: PropTypes.func,
}

export default List
