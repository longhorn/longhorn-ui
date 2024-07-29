import React from 'react'
import PropTypes from 'prop-types'
import { Table, Icon, Tooltip, Progress } from 'antd'
import { formatDate } from '../../utils/formatDate'
import classnames from 'classnames'
import { LinkTo, EngineImageUpgradeTooltip, ReplicaHATooltip } from '../../components'
import { formatMib } from '../../utils/formatter'
import VolumeActions from './VolumeActions'
import { isSchedulingFailure, getHealthState, needToWaitDone, extractImageVersion } from './helper/index'
import { sortTable, sortTableObject, sortTableByUTCDate, sortTableByPVC, sortTableActualSize, sortTableState, sortTableByTimestamp } from '../../utils/sort'
import { setSortOrder } from '../../utils/store'
import { statusUpgradingEngine } from '../../utils/status'
import { pagination } from '../../utils/page'
import style from './VolumeList.less'
import { isVolumeImageUpgradable, isVolumeReplicaNotRedundancy, isVolumeRelicaLimited } from '../../utils/filter'
import IconBackup from '../../components/Icon/IconBackup'
import IconStandBackup from '../../components/Icon/IconStandBackup'

function list({
  loading,
  dataSource,
  engineImages,
  hosts,
  showAttachHost,
  showEngineUpgrade,
  showRecurring,
  showSnapshots,
  showDetachHost,
  deleteVolume,
  changeVolume,
  showBackups,
  takeSnapshot,
  showSalvage,
  showVolumeCloneModal,
  showUpdateReplicaCount,
  rollback,
  rowSelection,
  sorter,
  createPVAndPVC,
  showWorkloadsStatusDetail,
  showExpansionVolumeSizeModal,
  showCancelExpansionModal,
  showRecurringJobModal,
  onSorterChange,
  height,
  showUpdateDataLocality,
  showUpdateAccessMode,
  showUpdateReplicaAutoBalanceModal,
  showUnmapMarkSnapChainRemovedModal,
  trimFilesystem,
  commandKeyDown,
  replicaSoftAntiAffinitySettingValue,
  engineUpgradePerNodeLimit,
  customColumnList,
  showUpdateSnapshotDataIntegrityModal,
  updateSnapshotMaxCount,
  updateSnapshotMaxSize,
  showUpdateReplicaSoftAntiAffinityModal,
  showUpdateReplicaZoneSoftAntiAffinityModal,
  showUpdateReplicaDiskSoftAntiAffinityModal,
  showUpdateFreezeFilesystemForSnapshotModal,
  onRowClick = f => f,
}) {
  const volumeActionsProps = {
    engineImages,
    showAttachHost,
    showEngineUpgrade,
    showRecurring,
    showSnapshots,
    showDetachHost,
    showBackups,
    deleteVolume,
    takeSnapshot,
    showSalvage,
    rollback,
    showVolumeCloneModal,
    showUpdateReplicaCount,
    createPVAndPVC,
    showWorkloadsStatusDetail,
    showRecurringJobModal,
    showExpansionVolumeSizeModal,
    showCancelExpansionModal,
    changeVolume,
    height,
    commandKeyDown,
    replicaSoftAntiAffinitySettingValue,
    engineUpgradePerNodeLimit,
    customColumnList,
    showUpdateDataLocality,
    showUpdateAccessMode,
    showUpdateReplicaAutoBalanceModal,
    showUnmapMarkSnapChainRemovedModal,
    trimFilesystem,
    showUpdateSnapshotDataIntegrityModal,
    updateSnapshotMaxCount,
    updateSnapshotMaxSize,
    showUpdateReplicaSoftAntiAffinityModal,
    showUpdateReplicaZoneSoftAntiAffinityModal,
    showUpdateReplicaDiskSoftAntiAffinityModal,
    showUpdateFreezeFilesystemForSnapshotModal,
    onRowClick,
  }
  /**
   *add dataSource kubernetesStatus fields
   */
  const volumeRestoring = (volume) => {
    if (volume.controllers && volume.controllers[0]) {
      return volume.standby === true && ((volume.lastBackup !== '' && volume.lastBackup !== volume.controllers[0].lastRestoredBackup) || (volume.lastBackup === '' && volume.controllers[0].requestedBackupRestore !== volume.controllers[0].lastRestoredBackup))
    }
  }

  dataSource.forEach((ele) => {
    ele.WorkloadNameAndPodName = {
      podList: ele.kubernetesStatus.workloadsStatus ? ele.kubernetesStatus.workloadsStatus : [],
      lastPodRefAt: ele.kubernetesStatus.lastPodRefAt ? ele.kubernetesStatus.lastPodRefAt : '',
    }
    ele.WorkloadName = ele.WorkloadNameAndPodName.podList[0] ? ele.WorkloadNameAndPodName.podList[0].workloadName : ''
  })

  const statusProgress = (currentStatusArr, key) => {
    if (currentStatusArr && currentStatusArr.length > 0) {
      let total = 0
      let restoreErrorMsg = ''
      let isRestoring = false
      currentStatusArr.forEach((ele) => {
        if (ele.error) {
          restoreErrorMsg = ele.error
        }
        if (ele[key]) {
          isRestoring = ele[key]
        }
        total += ele.progress
      })
      let progress = Math.floor(total / currentStatusArr.length)

      if (!isRestoring && !restoreErrorMsg) {
        return ''
      } else if (isRestoring && !restoreErrorMsg) {
        return <Tooltip title={`${key === 'isRestoring' ? 'Restoring' : 'Rebuilding'}: ${progress}%`}><Progress showInfo={false} percent={progress} /></Tooltip>
      } else {
        return <Tooltip title={restoreErrorMsg}><Progress status="active" showInfo={false} percent={progress} /></Tooltip>
      }
    }
  }

  const defaultImage = engineImages.find(image => image.default === true)
  let columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 160,
      sorter: (a, b) => sortTableState(a, b),
      render: (text, record) => {
        let upgrade = null
        const state = getHealthState(record.robustness)
        if (isVolumeImageUpgradable(record, defaultImage)) {
          const currentVersion = extractImageVersion(record.currentImage)
          const latestVersion = extractImageVersion(defaultImage.image)
          upgrade = (<EngineImageUpgradeTooltip currentVersion={currentVersion} latestVersion={latestVersion} />)
        }
        let ha = null
        if (isVolumeReplicaNotRedundancy(record) && replicaSoftAntiAffinitySettingValue) {
          ha = (<ReplicaHATooltip type="danger" />)
        } else if (isVolumeRelicaLimited(record) && replicaSoftAntiAffinitySettingValue) {
          ha = (<ReplicaHATooltip type="warning" />)
        }
        let attachedNodeIsDown = record.state === 'attached' && record.robustness === 'unknown' && hosts.some((host) => {
          return record.controllers && record.controllers[0] && host.id === record.controllers[0].hostId && host.conditions && host.conditions.Ready && host.conditions.Ready.status === 'False'
        })
        let dataLocalityWarn = record.dataLocality === 'best-effort' && record.state === 'attached' && record.replicas && record.replicas.every((item) => {
          let attachedNode = record.controllers && record.controllers[0] && record.controllers[0].hostId ? record.controllers[0].hostId : ''
          return item.hostId !== attachedNode
        })
        let statusForWorkloadMessage = `Not ready for workload. ${record.robustness === 'faulted' ? 'Volume Faulted' : 'Volume may be under maintenance or in the restore process.'} `
        let statusForWorkload = <Tooltip title={statusForWorkloadMessage}><Icon type="exclamation-circle" className="faulted" style={{ marginLeft: 5 }} /></Tooltip>
        let stateText = (() => {
          if (text.hyphenToHump() === 'attached' && record.robustness === 'healthy') {
            return (<div
              className={classnames({ [record.robustness.toLowerCase()]: true, capitalize: true })}
              style={{ display: 'flex', alignItems: 'center' }}
              >
                {ha}{state}{ !record.ready ? statusForWorkload : '' }
              </div>)
          } else if (text.hyphenToHump() === 'attached' && record.robustness === 'degraded') {
            return (
              <div
                className={classnames({ [record.robustness.toLowerCase()]: true, capitalize: true })}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {ha}{state}{ !record.ready ? statusForWorkload : '' }
              </div>
            )
          } else if (text.hyphenToHump() === 'detached' && record.robustness === 'faulted') {
            return (<div
              className={classnames({ [record.robustness.toLowerCase()]: true, capitalize: true })}
              style={{ display: 'flex', alignItems: 'center' }}
              >
                {ha}{state}{ !record.ready ? statusForWorkload : '' }
            </div>)
          }
          return text.hyphenToHump()
        })()

        let restoreProgress = statusProgress(record.restoreStatus, 'isRestoring')
        let rebuildProgress = statusProgress(record.rebuildStatus, 'isRebuilding')
        let isEncrypted = record && record.encrypted

        return (
          <div className={classnames({ [text.toLowerCase()]: true, capitalize: true }, style.volumeState)} style={{ position: 'relative' }}>
            <div style={{ width: '100%', position: 'absolute', top: '-25px' }}>
              {restoreProgress}
              {rebuildProgress}
            </div>
            {isEncrypted ? <Tooltip title={'Encrypted Volume'}><Icon className="color-warning" style={{ marginLeft: 5, marginRight: 5, marginBottom: 2 }} type="lock" /></Tooltip> : null}
            {statusUpgradingEngine(record)}
            { upgrade }
            {attachedNodeIsDown && (
              <Tooltip title={'The attached node is down'}>
                <Icon className="faulted" style={{ transform: 'rotate(45deg)', marginRight: 5, marginLeft: 5 }} type="api" />
              </Tooltip>
            )}
            {stateText}
            {dataLocalityWarn && (
              <Tooltip title={'Volume does not have data locality! There is no healthy replica on the same node as the engine'}>
                <Icon style={{ fontSize: '16px', marginLeft: 10 }} className="color-warning" type="warning" />
              </Tooltip>
            )}
            {needToWaitDone(text, record.replicas) ? <Icon type="loading" style={{ marginLeft: 5 }} /> : null}
          </div>
        )
      },
    },
    {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      sorter: (a, b) => sortTable(a, b, 'id'),
      render: (text, record) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {record.standby ? <Tooltip title={volumeRestoring(record) ? 'Disaster Recovery Volume restore in progress' : 'Disaster Recovery Volume'}>
              <div style={{ marginRight: '5px', display: 'flex', alignItems: 'center' }}>
                <IconStandBackup fill={volumeRestoring(record) ? 'rgba(0, 0, 0, 0.25)' : '#00C1DE'} />
              </div>
            </Tooltip> : ''}
            {isSchedulingFailure(record) ? <Tooltip title={'The volume cannot be scheduled'}>
              <Icon style={{ marginRight: 5 }} type="exclamation-circle-o" className={'error'} />
            </Tooltip> : null}
            <LinkTo style={{ display: 'flex', alignItems: 'center', wordBreak: 'break-all' }} to={{ pathname: `/volume/${text}` }}>
              {text}
            </LinkTo>
          </div>
        )
      },
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      sorter: (a, b) => sortTable(a, b, 'size'),
      render: (expectedSize, record) => {
        let currentSize = record?.controllers[0]?.size ?? ''
        let isExpanding = record?.controllers[0] && parseInt(expectedSize, 10) !== parseInt(currentSize, 10) && record.state === 'attached' && parseInt(currentSize, 10) !== 0
        // The expected size of engine should not be smaller than the current size.
        let expandingFailed = isExpanding && record?.controllers[0]?.lastExpansionError !== ''
        let message = ''
        if (expandingFailed) {
          message = (<div>
            <div>Expansion Error: {record.controllers[0].lastExpansionError}</div>
            <div>Note: You can cancel the expansion to avoid volume crash</div>
          </div>)
        } else if (isExpanding) {
          message = `The volume is in expansion progress from size ${formatMib(currentSize)} to size ${formatMib(expectedSize)}`
        }

        return (
          <span>
            {isExpanding && !expandingFailed ? <Tooltip title={message}>
              <div style={{ position: 'relative', color: 'rgb(16, 142, 233)' }}>
                <div className={style.expendVolumeIcon}>
                  <Icon type="loading" />
                </div>
                <div style={{ fontSize: '20px' }}>
                  <Icon type="arrows-alt" style={{ transform: 'rotate(45deg)' }} />
                </div>
              </div>
            </Tooltip> : <Tooltip title={message}>
              <div className={expandingFailed ? 'error' : ''}>
                {expandingFailed ? <div>
                  <Icon style={{ fontSize: '20px', marginRight: 5 }} type="info-circle" />
                  <div className={'error'} style={{ position: 'relative', display: 'inline-block' }}>
                    <div className={style.expendVolumeIcon}>
                      <Icon type="loading" />
                    </div>
                    <div style={{ fontSize: '20px', marginLeft: '8px' }}>
                      <Icon type="arrows-alt" style={{ transform: 'rotate(45deg)' }} />
                    </div>
                  </div>
                </div> : formatMib(expectedSize)}
              </div>
            </Tooltip>}
          </span>
        )
      },
    },
    {
      title: 'Actual Size',
      dataIndex: 'actualSize',
      key: 'actualSize',
      width: 140,
      sorter: (a, b) => sortTableActualSize(a, b),
      render: (text, record) => {
        let size = record?.controllers && record.controllers[0] && record.controllers[0].actualSize ? parseInt(record.controllers[0].actualSize, 10) : 0
        return (
          <div>
            <div>{formatMib(size)}</div>
          </div>
        )
      },
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      width: 120,
      sorter: (a, b) => sortTableByUTCDate(a, b, 'created'),
      render: (text) => {
        return (
          <div>
            {formatDate(text)}
          </div>
        )
      },
    },
    {
      title: 'Data Engine',
      dataIndex: 'dataEngine',
      key: 'dataEngine',
      width: 220,
      sorter: (a, b) => sortTable(a, b, 'dataEngine'),
      render: (text) => {
        return (
          <div>
            {text}
          </div>
        )
      },
    },
    {
      title: 'PV/PVC',
      dataIndex: 'kubernetesStatus',
      key: 'kubernetesStatus',
      sorter: (a, b) => sortTableByPVC(a, b, 'kubernetesStatus'),
      width: 120,
      render: (text) => {
        let title = (<div>
          <div><span>PV Name</span><span>: </span><span>{text.pvName}</span></div>
          <div><span>PV Status</span><span>: </span><span>{text.pvStatus}</span></div>
          { text.lastPVCRefAt ? <div><span>Last time bound with PVC</span><span> : </span><span>{formatDate(text.lastPVCRefAt)}</span></div> : ''}
          { text.pvcName ? <div><span>{ text.lastPVCRefAt ? 'Last Bounded' : ''} PVC Name</span><span>: </span><span>{text.pvcName}</span></div> : ''}
        </div>)
        let content = (() => {
          if (!text.pvName) {
            return ''
          }
          if (text.pvName && !text.pvcName && !text.namespace) {
            return <div>Available</div>
          }
          if (text.pvName && text.pvcName && text.namespace && !text.lastPVCRefAt) {
            return <div>Bound</div>
          }
          if (text.pvName && text.pvcName && text.namespace && text.lastPVCRefAt) {
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
      title: 'Namespace',
      dataIndex: 'kubernetesStatus',
      key: 'namespace',
      width: 140,
      sorter: (a, b) => sortTableObject(a, b, 'kubernetesStatus', 'namespace'),
      render: (text) => {
        return (
          <Tooltip placement="top" title={text.lastPVCRefAt ? 'Last Namespace' : ''}>
            <div style={text.lastPVCRefAt ? { background: 'rgba(241, 196, 15, 0.1)', minWidth: 100 } : { minWidth: 100 }}>
              <div>{ text.namespace }</div>
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: 'Attached To',
      dataIndex: 'WorkloadNameAndPodName',
      key: 'WorkloadNameAndPodName',
      width: 240,
      sorter: (a, b) => sortTable(a, b, 'WorkloadName'),
      render: (text, record) => {
        const title = text.lastPodRefAt ? <div><div>Last time used: {formatDate(text.lastPodRefAt)}</div></div> : ''
        const ele = text.podList.length ? text.podList.map((item, index) => {
          return <div key={index}>{item.podName}</div>
        }) : ''
        return (
          <Tooltip placement="top" title={title}>
            <a onClick={() => { showWorkloadsStatusDetail(text) }} className={style.workloadContainer} style={{ margin: 0 }}>
              <div style={text.lastPodRefAt && ele ? { background: 'rgba(241, 196, 15, 0.1)', padding: '5px' } : {}}>
                {ele}
              </div>
              <div>{record.controllers ? record.controllers.map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px' }} key={item.hostId}>{item.hostId ? <span>on {item.hostId}</span> : <span></span>}</div>) : ''}</div>
            </a>
          </Tooltip>
        )
      },
    },
    {
      title: 'Schedule',
      key: 'recurringJobs',
      width: 100,
      render: (text, record) => {
        return (
          <div onClick={() => { showRecurringJobModal(record) }} style={{ width: '100%', cursor: 'pointer' }}>
            <IconBackup fill={'rgb(241, 196, 15)'} width={30} height={30} />
          </div>
        )
      },
    },
    {
      title: 'Data Locality',
      dataIndex: 'dataLocality',
      key: 'dataLocality',
      width: 220,
      render: (text, record) => {
        return (
          <div>
            {record.dataLocality}
          </div>
        )
      },
    },
    {
      title: 'Replicas',
      dataIndex: 'replicas',
      key: 'replicas',
      width: 100,
      render: (text, record) => {
        return (
          <div>
            {record.numberOfReplicas}
          </div>
        )
      },
    },
    {
      title: 'Access Mode',
      dataIndex: 'accessMode',
      key: 'accessMode',
      width: 200,
      render: (text) => {
        const accessModeObject = {
          rwo: 'ReadWriteOnce',
          rwx: 'ReadWriteMany',
        }
        return (
          <div>
            {accessModeObject[text] ? accessModeObject[text] : ''}
          </div>
        )
      },
    },
    {
      title: 'Last Backup At',
      dataIndex: 'lastBackupAt',
      key: 'lastBackupAt',
      width: 200,
      sorter: (a, b) => sortTableByTimestamp(a, b, 'lastBackupAt'),
      render: (text) => {
        let lastTime = text ? formatDate(text) : ''
        return (
          <div>
            {lastTime}
          </div>
        )
      },
    },
    {
      title: 'Operation',
      key: 'operation',
      width: 110,
      fixed: 'right',
      render: (text, record) => {
        return (
          <VolumeActions {...volumeActionsProps} selected={record} />
        )
      },
    },
  ]

  // dynamic column width
  let columnWidth = 0

  if (customColumnList) {
    columns = columns.filter((ele) => {
      return customColumnList.indexOf(ele.key) > -1 || ele.key === 'operation'
    })
  }

  columns.forEach((ele) => {
    columnWidth += ele.width
  })

  const onChange = (p, f, s) => {
    onSorterChange(s)
  }
  setSortOrder(columns, sorter)

  return (
    <div id="volumeTable" style={{ flex: 1, height: '1px', overflow: 'hidden' }}>
      <Table
        className="common-table-class"
        rowSelection={rowSelection}
        bordered={false}
        columns={columns}
        onChange={onChange}
        dataSource={dataSource}
        loading={loading}
        onRow={record => {
          return {
            onClick: () => {
              onRowClick(record, commandKeyDown)
            },
          }
        }}
        simple
        pagination={pagination('volumePageSize')}
        rowKey={record => record.id}
        height={`${dataSource.length > 0 ? height : 1}px`}
        scroll={{ x: columnWidth, y: dataSource.length > 0 ? height : 1 }}
      />
    </div>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  engineImages: PropTypes.array,
  customColumnList: PropTypes.array,
  hosts: PropTypes.array,
  detach: PropTypes.func,
  deleteVolume: PropTypes.func,
  showAttachHost: PropTypes.func,
  showEngineUpgrade: PropTypes.func,
  showRecurring: PropTypes.func,
  showSnapshots: PropTypes.func,
  showBackups: PropTypes.func,
  takeSnapshot: PropTypes.func,
  showSalvage: PropTypes.func,
  showCloneVolume: PropTypes.func,
  showUpdateReplicaCount: PropTypes.func,
  rollback: PropTypes.func,
  rowSelection: PropTypes.object,
  sorter: PropTypes.object,
  onSorterChange: PropTypes.func,
  onRowClick: PropTypes.func,
  createPVAndPVC: PropTypes.func,
  showWorkloadsStatusDetail: PropTypes.func,
  showRecurringJobModal: PropTypes.func,
  height: PropTypes.number,
  changeVolume: PropTypes.func,
  commandKeyDown: PropTypes.bool,
  showExpansionVolumeSizeModal: PropTypes.func,
  showCancelExpansionModal: PropTypes.func,
  showUpdateDataLocality: PropTypes.func,
  showUpdateAccessMode: PropTypes.func,
  showUpdateReplicaAutoBalanceModal: PropTypes.func,
  showUnmapMarkSnapChainRemovedModal: PropTypes.func,
  showUpdateSnapshotDataIntegrityModal: PropTypes.func,
  replicaSoftAntiAffinitySettingValue: PropTypes.bool,
  engineUpgradePerNodeLimit: PropTypes.object,
  showUpdateFreezeFilesystemForSnapshotModal: PropTypes.func,
}

export default list
