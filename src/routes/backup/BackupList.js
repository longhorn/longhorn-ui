import React from 'react'
import PropTypes from 'prop-types'
import { Table, Modal, Icon, message, Tooltip, Progress, Input, Button } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { DropOption } from '../../components'
import { formatDate } from '../../utils/formatDate'
import { formatMib } from '../../utils/formatter'
import { sortTable } from '../../utils/sort'
import { setSortOrder } from '../../utils/store'
import { pagination } from '../../utils/page'
import style from './backupList.less'
import C from '../../utils/constants'

const confirm = Modal.confirm

const BackupUrl = ({ url = '' }) => {
  const onCopy = (_text, copySuccess) => {
    if (copySuccess) {
      message.success('Copied', 1.5)
    } else {
      message.error('Copy failed', 1.5)
    }
  }
  return (
    <div>
      <h3> Backup URL </h3>
      <div>
        <Input defaultValue={url} style={{ width: '95%' }} />
        <CopyToClipboard onCopy={onCopy} text={url}>
          <Button type="primary" icon="copy" />
        </CopyToClipboard>
      </div>
    </div>
  )
}

BackupUrl.propTypes = {
  url: PropTypes.string,
}

class List extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
    }
  }

  componentDidMount() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  onResize = () => {
    const height = document.getElementById('backDetailTable').offsetHeight - C.ContainerMarginHeight
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

  onCopy = (text, copySuccess) => { // eslint-disable-line no-unused-vars
    if (copySuccess) {
      message.success('Copied', 1.5)
    } else {
      message.error('Copy failed', 1.5)
    }
  }

  render() {
    const { backup, loading, showRestoreBackup, showBackupLabels, deleteBackup, sorter, onSorterChange, showWorkloadsStatusDetail = f => f } = this.props
    const dataSource = backup || []
    const handleMenuClick = (record, event) => {
      switch (event.key) {
        case 'restore':
          showRestoreBackup(record)
          break
        case 'delete':
          confirm({
            width: '800px',
            title: `Are you sure you want to delete backup ${record.name} ?`,
            content: 'If there is backup restore process in progress using this backup (including DR volumes), deleting the backup will result in restore failure and volume in the restore process will become FAULTED. Are you sure you want to delete this backup?',
            onOk() {
              deleteBackup(record)
            },
          })
          break
        case 'getUrl':
          Modal.info({
            width: '800px',
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
        width: '15%',
        sorter: (a, b) => sortTable(a, b, 'id'),
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          )
        },
      }, {
        title: 'Volume',
        dataIndex: 'volumeName',
        key: 'volumeName',
        width: '14%',
        render: (text, record) => {
          let errorMessage = record.messages && record.messages.error ? record.messages.error : ''
          return (
            <Tooltip title={errorMessage}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {errorMessage ? <Icon type="warning" style={{ marginRight: 10, color: '#f5222d' }} /> : ''}
                <CopyToClipboard onCopy={this.onCopy} text={text}>
                  <p style={{ color: '#108ee9', cursor: 'pointer', margin: '0px' }}>{text}</p>
                </CopyToClipboard>
              </div>
            </Tooltip>
          )
        },
      },
      {
        title: 'Creation State',
        dataIndex: 'state',
        key: 'state',
        width: 150,
        render: (text, record) => {
          if (record.state === 'InProgress') {
            return (
              <div style={{ paddingLeft: 15 }}>
                <Progress percent={record.progress} />
              </div>
            )
          }
          if (record.state === 'Error') {
            return (<div className="error">
              <Tooltip title={record.error}>
                <div>{text}</div>
              </Tooltip>
            </div>)
          }
          return (<div>{text}</div>)
        },
      },
      {
        title: 'Backup Mode',
        dataIndex: 'backupMode',
        key: 'backupMode',
        width: 150,
        render: (text) => {
          return (<div>{text || 'incremental'}</div>)
        },
      },
      {
        title: 'Snapshot Name',
        dataIndex: 'snapshotName',
        key: 'snapshotName',
        align: 'center',
        width: '16.72%',
        sorter: (a, b) => sortTable(a, b, 'snapshotName'),
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
        render: (text, record) => {
          return (
            <div>
              {record.state === 'Completed' && formatMib(text)}
            </div>
          )
        },
      }, {
        title: <div>PV/PVC</div>,
        dataIndex: 'labels',
        key: 'KubernetesStatus',
        width: '7.63%',
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
      }, {
        title: 'Workload/Pod',
        dataIndex: 'labels',
        key: 'WorkloadNameAndPodName',
        width: '12.5%',
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
          // let currentVolume = {}

          // if (volumeList) {
          //   volumeList.forEach((item) => {
          //     if (item.name === row.volumeName) {
          //       currentVolume = item
          //     }
          //   })
          // }

          return (
            <Tooltip placement="top" title={title}>
              <a onClick={() => { showWorkloadsStatusDetail(storageObj) }} className={style.workloadContainer} style={storageObj.lastPodRefAt && ele ? { background: 'rgba(241, 196, 15, 0.1)', padding: '5px' } : {}}>
                {ele}
                {/* <div>{ currentVolume.controllers ? currentVolume.controllers.map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px' }} key={item.hostId}>{item.hostId ? <span>on {item.hostId}</span> : <span></span>}</div>) : ''}</div> */}
              </a>
            </Tooltip>
          )
        },
      },
      {
        title: 'Snapshot Created',
        dataIndex: 'snapshotCreated',
        key: 'snapshotCreated',
        width: 220,
        sorter: (a, b) => sortTable(a, b, 'snapshotCreated'),
        render: (text) => {
          return (
            <div>
              {text ? formatDate(text) : ''}
            </div>
          )
        },
      }, {
        title: 'Labels',
        dataIndex: 'labels',
        key: 'labels',
        width: 100,
        render: (obj, record) => {
          if (obj && record.snapshotCreated) {
            obj.snapshotCreated = record.snapshotCreated
          }
          return (
            <div onClick={() => { showBackupLabels(obj) }}>
              <Icon style={{ fontSize: '18px', color: obj ? '#108eb9' : '#cccccc', cursor: 'pointer' }} type="tags" />
            </div>
          )
        },
      },
      {
        title: 'Operation',
        key: 'operation',
        width: 120,
        fixed: 'right',
        render: (text, record) => {
          return (
            <DropOption menuOptions={[
              { key: 'delete', name: 'Delete' },
              { key: 'restore', name: 'Restore', disabled: (record && record.messages && record.messages.error) || !record.url },
              { key: 'getUrl', name: 'Get URL', disabled: (record && record.messages && record.messages.error) || !record.url },
            ]}
              onMenuClick={e => handleMenuClick(record, e)}
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

    return (
      <div id="backDetailTable" style={{ overflow: 'hidden', flex: 1 }}>
        <Table
          className="common-table-class"
          locale={locale}
          bordered={false}
          columns={columns}
          onChange={onChange}
          loading={loading}
          dataSource={dataSource}
          simple
          pagination={pagination('backupPageSize')}
          rowKey={record => record.id}
          scroll={{ x: 1550, y: dataSource.length > 0 ? this.state.height : 1 }}
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
  sorter: PropTypes.object,
  onSorterChange: PropTypes.func,
  showBackupLabels: PropTypes.func,
  showWorkloadsStatusDetail: PropTypes.func,
  dispatch: PropTypes.func,
  volumeList: PropTypes.array,
}

export default List
