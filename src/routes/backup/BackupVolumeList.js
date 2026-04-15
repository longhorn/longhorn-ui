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
import { withTranslation } from 'react-i18next'

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
      this.props.deleteAllBackups(record)
    } else if (e.key === 'restoreLatestBackup') {
      this.props.restoreLatestBackup(record)
    } else if (e.key === 'syncBackupVolume') {
      this.props.syncBackupVolume(record)
    } else if (e.key === 'backingImageInfo') {
      this.props.showBackingImageInfo(record)
    }
  }

  render() {
    const { backup, loading, sorter, rowSelection, onSorterChange, onRowClick, showWorkloadsStatusDetail = f => f, t } = this.props
    const dataSource = backup || []

    const columns = [
      {
        title: t('columns.name'),
        dataIndex: 'volumeName',
        key: 'volumeName',
        width: 200,
        sorter: (a, b) => sortTable(a, b, 'volumeName'),
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
                      field: 'name',
                      keyword: record.name,
                    }),
                  }}>
                  {id}
                </Link>
              </Tooltip>
            </div>
          )
        },
      }, {
        title: t('columns.size'),
        dataIndex: 'size',
        key: 'size',
        width: 80,
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
        title: t('columns.backupTarget'),
        dataIndex: 'backupTargetName',
        key: 'backupTargetName',
        width: 200,
        sorter: (a, b) => sortTable(a, b, 'backupTargetName'),
        render: (text) => {
          return (
            <div>{text}</div>
          )
        },
      },
      {
        title: t('columns.lastBackupAt'),
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
        title: t('columns.createdAt'),
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
        title: <div>{t('columns.pvPvc')}</div>,
        dataIndex: 'labels',
        key: 'KubernetesStatus',
        width: 120,
        render: (record) => {
          let storageObj = {}

          if (record) {
            storageObj = this.formatData(record.KubernetesStatus)
          }
          let title = (<div>
            <div><span>{t('backupVolumeList.tooltips.pvName')}</span><span>: </span><span>{storageObj.pvName}</span></div>
            <div><span>{t('backupVolumeList.tooltips.pvStatus')}</span><span>: </span><span>{storageObj.pvStatus}</span></div>
            { storageObj.lastPVCRefAt ? <div><span>{t('backupVolumeList.tooltips.lastTimeBoundWithPVC')}</span><span> : </span><span>{formatDate(storageObj.lastPVCRefAt)}</span></div> : ''}
            { storageObj.pvcName ? <div><span>{ storageObj.lastPVCRefAt ? t('backupVolumeList.tooltips.lastBounded') : ''} {t('backupVolumeList.tooltips.pvcName')}</span><span>: </span><span>{storageObj.pvcName}</span></div> : ''}
          </div>)
          let content = (() => {
            if (!storageObj.pvName) {
              return ''
            }
            if (storageObj.pvName && !storageObj.pvcName && !storageObj.namespace) {
              return <div>{t('backupVolumeList.pvStatuses.available')}</div>
            }
            if (storageObj.pvName && storageObj.pvcName && storageObj.namespace && !storageObj.lastPVCRefAt) {
              return <div>{t('backupVolumeList.pvStatuses.bound')}</div>
            }
            if (storageObj.pvName && storageObj.pvcName && storageObj.namespace && storageObj.lastPVCRefAt) {
              return <div>{t('backupVolumeList.pvStatuses.released')}</div>
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
        title: t('columns.workloadPod'),
        dataIndex: 'labels',
        key: 'WorkloadNameAndPodName',
        width: 230,
        render: (record) => {
          let storageObj = {}

          if (record) {
            storageObj = this.formatData(record.KubernetesStatus)
            storageObj.snapshotCreated = record.snapshotCreated ? record.snapshotCreated : ''
          }

          const title = storageObj.lastPodRefAt ? <div><div>{t('backupVolumeList.tooltips.lastTimeUsed')}: {formatDate(storageObj.lastPodRefAt)}</div></div> : ''
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
        title: t('columns.operation'),
        key: 'operation',
        width: 120,
        fixed: 'right',
        render: (text, record) => {
          let hasBackingImage = record.backingImageName || record.backingImageURL
          return (
            <DropOption menuOptions={[
              { key: 'recovery', name: t('backupVolumeList.operationOptions.createDisasterRecoveryVolume'), disabled: !record.lastBackupName || (record.messages && record.messages.error) },
              { key: 'restoreLatestBackup', name: t('backupVolumeList.operationOptions.restoreLatestBackup'), disabled: !record.lastBackupName || (record.messages && record.messages.error) },
              { key: 'syncBackupVolume', name: t('backupVolumeList.operationOptions.syncBackupVolume') },
              { key: 'deleteAll', name: t('backupVolumeList.operationOptions.deleteAllBackups') },
              { key: 'backingImageInfo', name: t('backupVolumeList.operationOptions.backingImageInfo'), disabled: !hasBackingImage, tooltip: hasBackingImage ? '' : t('backupVolumeList.operationOptions.noBackingImageTooltip') },
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
      emptyText: backup ? t('common.noData') : t('backupVolumeList.table.noVolumeSelected'),
    }

    // dynamic column width
    let columnWidth = 0

    columns.forEach((ele) => {
      columnWidth += ele.width
    })

    return (
      <div id="backTable">
        <Table
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
  deleteAllBackups: PropTypes.func,
  dispatch: PropTypes.func,
  restoreLatestBackup: PropTypes.func,
  syncBackupVolume: PropTypes.func,
  showBackingImageInfo: PropTypes.func,
  showWorkloadsStatusDetail: PropTypes.func,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(List)
