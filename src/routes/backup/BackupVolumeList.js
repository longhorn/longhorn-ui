import React from 'react'
import PropTypes from 'prop-types'
import { Table, Icon, Tooltip } from 'antd'
import { formatDate } from '../../utils/formatDate'
import { Link } from 'dva/router'
import { formatMib } from '../../utils/formatter'
import { DropOption } from '../../components'
import { sortTable } from '../../utils/sort'
import { setSortOrder } from '../../utils/store'
import { pagination } from '../../utils/page'
import queryString from 'query-string'
import style from './backupList.less'
import C from '../../utils/constants'

class List extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      commandKeyDown: false,
    }
  }

  componentDidMount() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('keydown', this.onkeydown)
    window.addEventListener('keyup', this.onkeyup)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('keydown', this.onkeydown)
    window.removeEventListener('keyup', this.onkeyup)
  }

  onResize = () => {
    const height = document.getElementById('backTable').offsetHeight - C.ContainerMarginHeight
    this.setState({
      height,
    })
  }

  fomartData = (data, key) => {
    if (this.isJson(data)) {
      let obj = JSON.parse(data)

      return key ? obj[key] : obj
    }
    return {}
  }

  isJson = (str) => {
    try {
      let obj = JSON.parse(str)

      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
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
    } else if (e.key === 'syncBackupVolume') {
      this.props.syncBackupVolume(record)
    } else if (e.key === 'backingImageInfo') {
      this.props.showBackingImageInfo(record)
    }
  }

  render() {
    const { backup, loading, sorter, rowSelection, onSorterChange, onRowClick, showWorkloadsStatusDetail = f => f } = this.props
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
                    pathname: `/backup/${id}`,
                    search: queryString.stringify({
                      field: 'volumeName',
                      keyword: id,
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
      },
      {
        title: 'Last Backup At',
        dataIndex: 'lastBackupAt',
        key: 'lastBackupAt',
        width: 200,
        sorter: (a, b) => sortTable(a, b, 'lastBackupAt'),
        render: (text) => {
          return (
            <div>
              {text ? formatDate(text) : ''}
            </div>
          )
        },
      },
      {
        title: 'Created At',
        dataIndex: 'created',
        key: 'created',
        align: 'center',
        width: 180,
        sorter: (a, b) => sortTable(a, b, 'created'),
        render: (text) => {
          return (
            <div>
              {text ? formatDate(text) : ''}
            </div>
          )
        },
      },
      {
        title: <div>PV/PVC</div>,
        dataIndex: 'labels',
        key: 'KubernetesStatus',
        width: 120,
        render: (record) => {
          let storageObj = {}

          if (record) {
            storageObj = this.fomartData(record.KubernetesStatus)
          }
          let title = (<div>
            <div><span>PV Name</span><span>: </span><span>{storageObj.pvName}</span></div>
            <div><span>PV Status</span><span>: </span><span>{storageObj.pvStatus}</span></div>
            { storageObj.lastPVCRefAt ? <div><span>Last time bound with PVC</span><span> : </span><span>{formatDate(storageObj.lastPVCRefAt)}</span></div> : ''}
            { storageObj.pvcName ? <div><span>{ storageObj.lastPVCRefAt ? 'Last Bounded' : ''} PVC Name</span><span>: </span><span>{storageObj.pvcName}</span></div> : ''}
          </div>)
          let content = (() => {
            if (!storageObj.pvName) {
              return ''
            }
            if (storageObj.pvName && !storageObj.pvcName && !storageObj.namespace) {
              return <div>Available</div>
            }
            if (storageObj.pvName && storageObj.pvcName && storageObj.namespace && !storageObj.lastPVCRefAt) {
              return <div>Bound</div>
            }
            if (storageObj.pvName && storageObj.pvcName && storageObj.namespace && storageObj.lastPVCRefAt) {
              return <div>Released</div>
            }
            return ''
          })()
          return (
            <Tooltip placement="top" title={title}>
              <div>
                {content}
              </div>
            </Tooltip>
          )
        },
      },
      {
        title: 'Workload/Pod',
        dataIndex: 'labels',
        key: 'WorkloadNameAndPodName',
        width: 230,
        render: (record) => {
          let storageObj = {}

          if (record) {
            storageObj = this.fomartData(record.KubernetesStatus)
            storageObj.snapshotCreated = record.snapshotCreated ? record.snapshotCreated : ''
          }

          const title = storageObj.lastPodRefAt ? <div><div>Last time used: {formatDate(storageObj.lastPodRefAt)}</div></div> : ''
          const ele = storageObj.workloadsStatus && storageObj.workloadsStatus.length ? storageObj.workloadsStatus.map((item, index) => {
            return <div key={index}>{item.podName}</div>
          }) : ''
          if (storageObj.workloadsStatus) {
            storageObj.podList = storageObj.workloadsStatus
          }

          return (
            <Tooltip placement="top" title={title}>
              <a onClick={() => { showWorkloadsStatusDetail(storageObj) }} className={style.workloadContainer} style={storageObj.lastPodRefAt && ele ? { background: 'rgba(241, 196, 15, 0.1)', padding: '5px' } : {}}>
                {ele}
              </a>
            </Tooltip>
          )
        },
      },
      {
        title: 'Operation',
        key: 'operation',
        width: 120,
        fixed: 'right',
        render: (text, record) => {
          let hasBackingImage = record.backingImageName || record.backingImageURL
          return (
            <DropOption menuOptions={[
              { key: 'recovery', name: 'Create Disaster Recovery Volume', disabled: !record.lastBackupName || (record.messages && record.messages.error) },
              { key: 'restoreLatestBackup', name: 'Restore Latest Backup', disabled: !record.lastBackupName || (record.messages && record.messages.error) },
              { key: 'syncBackupVolume', name: 'Sync Backup Volume' },
              { key: 'deleteAll', name: 'Delete All Backups' },
              { key: 'backingImageInfo', name: 'Backing Image Info', disabled: !hasBackingImage, tooltip: hasBackingImage ? '' : 'No backing image is used' },
            ]}
              onMenuClick={e => this.handleMenuClick(record, e)}
            />
          )
        },
      },
    ]

    const onChange = (p, f, s) => {
      onSorterChange(s)
    }
    setSortOrder(columns, sorter)
    const locale = {
      emptyText: backup ? 'No Data' : 'Please select a volume first',
    }

    // dynamic column width
    let columnWidth = 0

    columns.forEach((ele) => {
      columnWidth += ele.width
    })

    return (
      <div id="backTable" style={{ overflow: 'hidden', flex: 1 }}>
        <Table
          className="common-table-class"
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
          pagination={pagination('backupDetailPageSize')}
          rowKey={record => record.id}
          scroll={{ x: columnWidth, y: dataSource.length > 0 ? this.state.height : 1 }}
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
  search: PropTypes.string,
  onSorterChange: PropTypes.func,
  Create: PropTypes.func,
  onRowClick: PropTypes.func,
  DeleteAllBackups: PropTypes.func,
  dispatch: PropTypes.func,
  restoreLatestBackup: PropTypes.func,
  syncBackupVolume: PropTypes.func,
  showBackingImageInfo: PropTypes.func,
  showWorkloadsStatusDetail: PropTypes.func,
}

export default List
