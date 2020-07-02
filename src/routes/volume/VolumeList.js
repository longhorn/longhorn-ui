import React from 'react'
import PropTypes from 'prop-types'
import { Table, Icon, Tooltip, Progress } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { LinkTo, EngineImageUpgradeTooltip, ReplicaHATooltip } from '../../components'
import { formatMib, utcStrToDate } from '../../utils/formater'
import VolumeActions from './VolumeActions'
import { isSchedulingFailure, getHealthState, needToWaitDone, extractImageVersion } from './helper/index'
import { sortTable, sortTableObject, sortTableByUTCDate, sortTableByISODate, sortTableByPVC } from '../../utils/sort'
import { setSortOrder } from '../../utils/store'
import style from './VolumeList.less'
import { isVolumeImageUpgradable, isVolumeReplicaNotRedundancy, isVolumeRelicaLimited } from '../../utils/filter'
import IconBackup from '../../components/Icon/IconBackup'
import IconStandBackup from '../../components/Icon/IconStandBackup'

function list({ loading, dataSource, engineImages, hosts, showAttachHost, showEngineUpgrade, showRecurring, showSnapshots, detach, deleteVolume, changeVolume, showBackups, takeSnapshot, showSalvage, showUpdateReplicaCount, rollback, rowSelection, sorter, createPVAndPVC, showWorkloadsStatusDetail, showExpansionVolumeSizeModal, showCancelExpansionModal, showSnapshotDetail, onSorterChange, height, confirmDetachWithWorkload, commandKeyDown, replicaSoftAntiAffinitySettingValue, onRowClick = f => f }) {
  const volumeActionsProps = {
    engineImages,
    showAttachHost,
    showEngineUpgrade,
    showRecurring,
    showSnapshots,
    detach,
    showBackups,
    deleteVolume,
    takeSnapshot,
    showSalvage,
    rollback,
    showUpdateReplicaCount,
    createPVAndPVC,
    showWorkloadsStatusDetail,
    showSnapshotDetail,
    showExpansionVolumeSizeModal,
    showCancelExpansionModal,
    changeVolume,
    height,
    confirmDetachWithWorkload,
    commandKeyDown,
    replicaSoftAntiAffinitySettingValue,
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
  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: '190px',
      sorter: (a, b) => sortTable(a, b, 'state'),
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
        let attchedNodeIsDown = record.state === 'attached' && record.robustness === 'unknown' && hosts.some((host) => {
          return record.controllers && record.controllers[0] && host.id === record.controllers[0].hostId && host.conditions && host.conditions.Ready && host.conditions.Ready.status === 'False'
        })
        let statusForWorkloadMessage = `Not ready for workload. ${record.robustness === 'faulted' ? 'Volume Faulted' : 'Volume may be under maintenance or in the restore process.'} `
        let statusForWorkload = <Tooltip title={statusForWorkloadMessage}><Icon type="exclamation-circle" className="faulted" style={{ marginLeft: '5px' }} /></Tooltip>
        let stateText = (() => {
          if (text.hyphenToHump() === 'attached' && record.robustness === 'healthy') {
            return <div className={classnames({ [record.robustness.toLowerCase()]: true, capitalize: true })} style={{ display: 'flex', alignItems: 'center' }}>{ha}{state}{ !record.ready ? statusForWorkload : '' }</div>
          } else if (text.hyphenToHump() === 'attached' && record.robustness === 'degraded') {
            return <div className={classnames({ [record.robustness.toLowerCase()]: true, capitalize: true })} style={{ display: 'flex', alignItems: 'center' }}>{ha}{state}{ !record.ready ? statusForWorkload : '' }</div>
          } else if (text.hyphenToHump() === 'detached' && record.robustness === 'faulted') {
            return <div className={classnames({ [record.robustness.toLowerCase()]: true, capitalize: true })} style={{ display: 'flex', alignItems: 'center' }}>{ha}{state}{ !record.ready ? statusForWorkload : '' }</div>
          }
          return text.hyphenToHump()
        })()

        let restoreProgress = statusProgress(record.restoreStatus, 'isRestoring')
        let rebuildProgress = statusProgress(record.rebuildStatus, 'isRebuilding')
        // if (record.restoreStatus && record.restoreStatus.length > 0) {
        //   let total = 0
        //   let restoreErrorMsg = ''
        //   let isRestoring = false
        //   record.restoreStatus.forEach((ele) => {
        //     if (ele.error) {
        //       restoreErrorMsg = ele.error
        //     }
        //     if (ele.isRestoring) {
        //       isRestoring = ele.isRestoring
        //     }
        //     total += ele.progress
        //   })
        //   let progress = Math.floor(total / record.restoreStatus.length)

        //   if (!isRestoring && !restoreErrorMsg) {
        //     restoreProgress = ''
        //   } else if (isRestoring && !restoreErrorMsg) {
        //     restoreProgress = <Tooltip title={`Restoring: ${progress}%`}><Progress showInfo={false} percent={progress} /></Tooltip>
        //   } else {
        //     restoreProgress = <Tooltip title={restoreErrorMsg}><Progress status="exception" showInfo={false} percent={progress} /></Tooltip>
        //   }
        // }

        return (
          <div className={classnames({ [text.toLowerCase()]: true, capitalize: true }, style.volumeState)} style={{ position: 'relative' }}>
            <div style={{ width: '100%', position: 'absolute', top: '-25px' }}>
              {restoreProgress}
              {rebuildProgress}
            </div>
            {upgrade} {attchedNodeIsDown ? <Tooltip title={'The attached node is down'}><Icon className="faulted" style={{ transform: 'rotate(45deg)', marginRight: 5 }} type="api" /></Tooltip> : ''} {stateText} {needToWaitDone(text, record.replicas) ? <Icon type="loading" /> : null}
          </div>
        )
      },
    },
    {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
      width: '11.2%',
      sorter: (a, b) => sortTable(a, b, 'id'),
      render: (text, record) => {
        return (
          <div style={{ maxWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LinkTo style={{ display: 'flex', alignItems: 'center' }} to={{ pathname: `/volume/${text}`, state: false }}>
              {record.standby ? <Tooltip title={volumeRestoring(record) ? 'Disaster Recovery Volume restore in progress' : 'Disaster Recovery Volume'}><div style={{ marginRight: '5px', display: 'flex', alignItems: 'center' }}><IconStandBackup fill={volumeRestoring(record) ? 'rgba(0, 0, 0, 0.25)' : '#00C1DE'} /></div></Tooltip> : ''}{isSchedulingFailure(record) ? <Tooltip title={'The volume cannot be scheduled'}><Icon type="exclamation-circle-o" className={'error'} /></Tooltip> : null} {text}
            </LinkTo>
          </div>
        )
      },
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: '6.25%',
      sorter: (a, b) => sortTable(a, b, 'size'),
      render: (text, record) => {
        let oldSize = record && record.controllers && record.controllers[0] && record.controllers[0].size ? record.controllers[0].size : ''
        let isExpanding = (text !== oldSize && record.state === 'attached')
        let message = `The volume is in expansion progress from size ${formatMib(oldSize)} to size ${formatMib(text)}`

        return (
          <div>
            {isExpanding ? <Tooltip title={message}>
              <div style={{ position: 'relative', color: 'rgb(16, 142, 233)' }}>
                <div className={style.expendVolumeIcon}>
                  <Icon type="loading" />
                </div>
                <div style={{ fontSize: '20px' }}>
                  <Icon type="arrows-alt" style={{ transform: 'rotate(45deg)' }} />
                </div>
              </div>
            </Tooltip> : <div>{formatMib(text)}</div>}
          </div>
        )
      },
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      width: '9.72%',
      sorter: (a, b) => sortTableByUTCDate(a, b, 'created'),
      render: (text) => {
        return (
          <div>
            {moment(utcStrToDate(text)).fromNow()}
          </div>
        )
      },
    },
    {
      title: <div>PV/PVC</div>,
      dataIndex: 'kubernetesStatus',
      key: 'kubernetesStatus',
      sorter: (a, b) => sortTableByPVC(a, b, 'kubernetesStatus'),
      width: '7.63%',
      render: (text) => {
        let title = (<div>
          <div><span>PV Name</span><span>: </span><span>{text.pvName}</span></div>
          <div><span>PV Status</span><span>: </span><span>{text.pvStatus}</span></div>
          { text.lastPVCRefAt ? <div><span>Last time bound with PVC</span><span> : </span><span>{moment(new Date(text.lastPVCRefAt)).fromNow()}</span></div> : ''}
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
      width: '9.72%',
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
      width: '12.5%',
      sorter: (a, b) => sortTable(a, b, 'WorkloadName'),
      render: (text, record) => {
        const title = text.lastPodRefAt ? <div><div>Last time used: {moment(new Date(text.lastPodRefAt)).fromNow()}</div></div> : ''
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
      title: <div><div>Schedule</div></div>,
      key: 'recurringJobs',
      render: (text, record) => {
        let title = text.recurringJobs && text.recurringJobs.length ? 'Only recurring snapshot scheduled' : 'No recurring backup scheduled'
        let fill = text.recurringJobs && text.recurringJobs.length ? 'rgb(241, 196, 15)' : 'rgba(0, 0, 0, 0.25)'
        if (text.recurringJobs && text.recurringJobs.length) {
          text.recurringJobs.forEach((ele) => {
            if (ele.task === 'backup') {
              fill = '#00C1DE'
              title = 'Recurring backup scheduled'
            }
          })
        }
        return (
          <Tooltip placement="top" title={title}>
            <div onClick={() => { showSnapshotDetail(record) }} style={{ width: '100%', cursor: 'pointer' }}>
              <IconBackup fill={fill} width={30} height={30} />
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: 'Last Backup At',
      dataIndex: 'lastBackupAt',
      key: 'lastBackupAt',
      width: 200,
      sorter: (a, b) => sortTableByISODate(a, b, 'lastBackupAt'),
      render: (text) => {
        let lastTime = text ? moment(text).fromNow() : ''
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
      width: '110px',
      fixed: 'right',
      render: (text, record) => {
        return (
          <VolumeActions {...volumeActionsProps} selected={record} />
        )
      },
    },
  ]

  const pagination = true
  const onChange = (p, f, s) => {
    onSorterChange(s)
  }
  setSortOrder(columns, sorter)

  return (
    <div id="volumeTable" style={{ flex: 1, height: '1px', overflow: 'hidden' }}>
      <Table
        className="volume-table-class"
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
        pagination={pagination}
        rowKey={record => record.id}
        height={`${height}px`}
        scroll={{ x: 1540, y: height }}
      />
    </div>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  engineImages: PropTypes.array,
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
  showUpdateReplicaCount: PropTypes.func,
  rollback: PropTypes.func,
  rowSelection: PropTypes.object,
  sorter: PropTypes.object,
  onSorterChange: PropTypes.func,
  onRowClick: PropTypes.func,
  createPVAndPVC: PropTypes.func,
  showWorkloadsStatusDetail: PropTypes.func,
  showSnapshotDetail: PropTypes.func,
  height: PropTypes.number,
  changeVolume: PropTypes.func,
  commandKeyDown: PropTypes.bool,
  confirmDetachWithWorkload: PropTypes.func,
  showExpansionVolumeSizeModal: PropTypes.func,
  showCancelExpansionModal: PropTypes.func,
  replicaSoftAntiAffinitySettingValue: PropTypes.bool,
}

export default list
