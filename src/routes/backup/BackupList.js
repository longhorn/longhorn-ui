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
import { withTranslation } from 'react-i18next'

const confirm = Modal.confirm

const BackupUrl = ({ url = '', t }) => {
  const onCopy = (_text, copySuccess) => {
    if (copySuccess) {
      message.success(t('backupList.backupUrl.copySuccess'), 1.5)
    } else {
      message.error(t('backupList.backupUrl.copyFailed'), 1.5)
    }
  }
  return (
    <div>
      <h3>{t('backupList.backupUrl.title')}</h3>
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
  t: PropTypes.func.isRequired,
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

  formatData = (data, key) => {
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

  onCopy = (_text, copySuccess) => {
    const { t } = this.props
    if (copySuccess) {
      message.success(t('backupList.copySuccess'), 1.5)
    } else {
      message.error(t('backupList.copyFailed'), 1.5)
    }
  }

  render() {
    const { backup, loading, showRestoreBackup, showBackupLabels, deleteBackup, sorter, onSorterChange, showWorkloadsStatusDetail = f => f, t } = this.props
    const dataSource = backup || []
    const handleMenuClick = (record, event) => {
      switch (event.key) {
        case 'restore':
          showRestoreBackup(record)
          break
        case 'delete':
          confirm({
            width: '800px',
            title: t('backupList.modal.delete.title', { backupName: record.name }),
            content: t('backupList.modal.delete.content'),
            onOk() {
              deleteBackup(record)
            },
          })
          break
        case 'getUrl':
          Modal.info({
            width: '800px',
            content: <BackupUrl url={record.url} t={t} />,
          })
          break
        default:
      }
    }

    const columns = [
      {
        title: t('columns.id'),
        dataIndex: 'id',
        key: 'id',
        width: 100,
        sorter: (a, b) => sortTable(a, b, 'id'),
        render: (text) => {
          return (
            <div>
              {text}
            </div>
          )
        },
      }, {
        title: t('columns.volume'),
        dataIndex: 'volumeName',
        key: 'volumeName',
        width: 120,
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
        title: t('columns.creationState'),
        dataIndex: 'state',
        key: 'state',
        width: 120,
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
        title: t('columns.backupMode'),
        dataIndex: 'backupMode',
        key: 'backupMode',
        width: 120,
        sorter: (a, b) => sortTable(a, b, 'backupMode'),
        render: (text) => {
          return (
            <div>
              {text || t('columns.backupModeDefault')}
            </div>
          )
        },
      },
      {
        title: t('columns.backupBlockSize'),
        dataIndex: 'blockSize',
        key: 'blockSize',
        width: 150,
        sorter: (a, b) => sortTable(a, b, 'blockSize'),
        render: (text, record) => {
          if (record.state === 'Completed') {
            if (String(text) === '-1') {
              return <span className="error">{t('columns.backupBlockSizeError')}</span>
            }
            return formatMib(text)
          }
          return null
        }
      },
      {
        title: t('columns.backupTarget'),
        dataIndex: 'backupTargetName',
        key: 'backupTargetName',
        width: 120,
        sorter: (a, b) => sortTable(a, b, 'backupTargetName'),
        render: (text) => {
          return (
            <div>{text}</div>
          )
        },
      },
      {
        title: t('columns.snapshotName'),
        dataIndex: 'snapshotName',
        key: 'snapshotName',
        align: 'center',
        width: 150,
        sorter: (a, b) => sortTable(a, b, 'snapshotName'),
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
        width: 90,
        sorter: (a, b) => sortTable(a, b, 'size'),
        render: (text, record) => {
          return (
            <div>
              {record.state === 'Completed' && formatMib(text)}
            </div>
          )
        },
      }, {
        title: t('columns.reUploadedDataSize'),
        dataIndex: 'reUploadedDataSize',
        key: 'reUploadedDataSize',
        width: 150,
        sorter: (a, b) => sortTable(a, b, 'reUploadedDataSize'),
        render: (text, record) => {
          return (
            <div>
              {record.state === 'Completed' && formatMib(text)}
            </div>
          )
        },
      }, {
        title: t('columns.newlyUploadedDataSize'),
        dataIndex: 'newlyUploadDataSize',
        key: 'newlyUploadDataSize',
        width: 150,
        sorter: (a, b) => sortTable(a, b, 'newlyUploadDataSize'),
        render: (text, record) => {
          return (
            <div>
              {record.state === 'Completed' && formatMib(text)}
            </div>
          )
        },
      }, {
        title: t('columns.pvPvc'),
        dataIndex: 'labels',
        key: 'KubernetesStatus',
        width: 90,
        render: (record) => {
          let storageObj = {}

          if (record) {
            storageObj = this.formatData(record.KubernetesStatus)
          }
          let title = (<div>
            <div><span>{t('backupList.tooltips.pvName')}</span><span>: </span><span>{storageObj.pvName}</span></div>
            <div><span>{t('backupList.tooltips.pvStatus')}</span><span>: </span><span>{storageObj.pvStatus}</span></div>
            { storageObj.lastPVCRefAt ? <div><span>{t('backupList.tooltips.lastTimeBoundWithPVC')}</span><span> : </span><span>{formatDate(storageObj.lastPVCRefAt)}</span></div> : ''}
            { storageObj.pvcName ? <div><span>{ storageObj.lastPVCRefAt ? t('backupList.tooltips.lastBounded') : ''} {t('backupList.tooltips.pvcName')}</span><span>: </span><span>{storageObj.pvcName}</span></div> : ''}
          </div>)
          let content = (() => {
            if (!storageObj.pvName) {
              return ''
            }
            if (storageObj.pvName && !storageObj.pvcName && !storageObj.namespace) {
              return <div>{t('backupList.pvStatuses.available')}</div>
            }
            if (storageObj.pvName && storageObj.pvcName && storageObj.namespace && !storageObj.lastPVCRefAt) {
              return <div>{t('backupList.pvStatuses.bound')}</div>
            }
            if (storageObj.pvName && storageObj.pvcName && storageObj.namespace && storageObj.lastPVCRefAt) {
              return <div>{t('backupList.pvStatuses.released')}</div>
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
        title: t('columns.workloadPod'),
        dataIndex: 'labels',
        key: 'WorkloadNameAndPodName',
        width: 150,
        render: (record) => {
          let storageObj = {}

          if (record) {
            storageObj = this.formatData(record.KubernetesStatus)
            storageObj.snapshotCreated = record.snapshotCreated ? record.snapshotCreated : ''
          }

          const title = storageObj.lastPodRefAt ? <div><div>{t('backupList.tooltips.lastTimeUsed')}: {formatDate(storageObj.lastPodRefAt)}</div></div> : ''
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
              </a>
            </Tooltip>
          )
        },
      },
      {
        title: t('columns.snapshotCreated'),
        dataIndex: 'snapshotCreated',
        key: 'snapshotCreated',
        width: 150,
        sorter: (a, b) => sortTable(a, b, 'snapshotCreated'),
        render: (text) => {
          return (
            <div>
              {text ? formatDate(text) : ''}
            </div>
          )
        },
      }, {
        title: t('columns.labels'),
        dataIndex: 'labels',
        key: 'labels',
        width: 80,
        render: (obj, record) => {
          if (obj && record.snapshotCreated) {
            obj.snapshotCreated = record.snapshotCreated
          }
          return (
            <div onClick={() => { showBackupLabels(obj) }}>
              <Icon style={{ fontSize: '18px', color: obj ? '#108ee9' : '#cccccc', cursor: 'pointer' }} type="tags" />
            </div>
          )
        },
      },
      {
        title: t('columns.operation'),
        key: 'operation',
        width: 120,
        fixed: 'right',
        render: (text, record) => {
          return (
            <DropOption menuOptions={[
              { key: 'delete', name: t('backupList.operationOptions.delete') },
              { key: 'restore', name: t('backupList.operationOptions.restore'), disabled: (record && record.messages && record.messages.error) || !record.url },
              { key: 'getUrl', name: t('backupList.operationOptions.getUrl'), disabled: (record && record.messages && record.messages.error) || !record.url },
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
      emptyText: backup ? t('backupList.table.emptyText') : t('backupList.table.noVolumeSelected'),
    }

    return (
      <div id="backDetailTable">
        <Table
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
  t: PropTypes.func.isRequired,
}

export default withTranslation()(List)
