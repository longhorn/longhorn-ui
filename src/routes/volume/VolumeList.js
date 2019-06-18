import React from 'react'
import PropTypes from 'prop-types'
import { Table, Icon, Tooltip } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { LinkTo, EngineImageUpgradeTooltip, ReplicaHATooltip } from '../../components'
import { formatMib, utcStrToDate } from '../../utils/formater'
import VolumeActions from './VolumeActions'
import { isSchedulingFailure, getHealthState, needToWaitDone, extractImageVersion } from './helper/index'
import { sortTable, sortTableObject, sortTableByUTCDate, sortTableByISODate } from '../../utils/sort'
import { setSortOrder } from '../../utils/store'
import style from './VolumeList.less'
import { isVolumeImageUpgradable, isVolumeReplicaNotRedundancy, isVolumeRelicaLimited } from '../../utils/filter'
import IconBackup from '../../components/Icon/IconBackup'
import IconStandBackup from '../../components/Icon/IconStandBackup'

function list({ loading, dataSource, engineImages, showAttachHost, showEngineUpgrade, showRecurring, showSnapshots, detach, deleteVolume, changeVolume, showBackups, takeSnapshot, showSalvage, showUpdateReplicaCount, rollback, rowSelection, sorter, createPVAndPVC, showWorkloadsStatusDetail, showSnapshotDetail, onSorterChange, height = f => f }) {
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
    changeVolume,
    height,
  }
  /**
   *add dataSource kubernetesStatus fields
   */
  const volumeRestoring = (volume) => {
    if(volume.controllers && volume.controllers[0]){
      return volume.standby === true && ((volume.lastBackup !== '' && volume.lastBackup !== volume.controllers[0].lastRestoredBackup) || (volume.lastBackup === '' && volume.controllers[0].requestedBackupRestore !== volume.controllers[0].lastRestoredBackup ))
    }
  }

  dataSource.forEach((ele) => {
    ele.WorloadNameAndPodName = {
      podList: ele.kubernetesStatus.workloadsStatus ? ele.kubernetesStatus.workloadsStatus : [],
      lastPodRefAt: ele.kubernetesStatus.lastPodRefAt ? ele.kubernetesStatus.lastPodRefAt : '',
    }
    ele.WorloadName = ele.WorloadNameAndPodName.podList[0] ? ele.WorloadNameAndPodName.podList[0].workloadName : ''
  })

  const defaultImage = engineImages.find(image => image.default === true)
  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: '130px',
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
        if (isVolumeReplicaNotRedundancy(record)) {
          ha = (<ReplicaHATooltip type="danger" />)
        } else if (isVolumeRelicaLimited(record)) {
          ha = (<ReplicaHATooltip type="warning" />)
        }
        let stateText = (() => {
          if(text.hyphenToHump() === 'attached' && record.robustness === 'healthy') {
            return <div className={classnames({ [record.robustness.toLowerCase()]: true, capitalize: true })} style={{display: 'flex'}}>{ha}{state}</div>
          } else if(text.hyphenToHump() === 'attached' && record.robustness === 'degraded') {
            return <div className={classnames({ [record.robustness.toLowerCase()]: true, capitalize: true })} style={{display: 'flex'}}>{ha}{state}</div>
          } else if(text.hyphenToHump() === 'detached' && record.robustness === 'faulted') {
            return <div className={classnames({ [record.robustness.toLowerCase()]: true, capitalize: true })} style={{display: 'flex'}}>{ha}{state}</div>
          }
          return text.hyphenToHump()
        })()
        return (
          <div className={classnames({ [text.toLowerCase()]: true, capitalize: true }, style.volumeState)}>
            {upgrade} {stateText} {needToWaitDone(text, record.replicas) ? <Icon type="loading" /> : null}
          </div>
        )
      },
    },
    {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
      width: '15.2%',
      sorter: (a, b) => sortTable(a, b, 'id'),
      render: (text, record) => {
        return (
          <div style={{ maxWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LinkTo style={{ display: 'flex', alignItems: 'center' }} to={`/volume/${text}`}>
              {record.standby ? <Tooltip title={volumeRestoring(record) ? 'Disaster Recovery Volume restore in progress' : 'Disaster Recovery Volume' }><div style={{marginRight: '5px', display: 'flex', alignItems: 'center'}}><IconStandBackup fill={ volumeRestoring(record) ? 'rgba(0, 0, 0, 0.25)' : '#00C1DE'}/></div></Tooltip> : ''}{isSchedulingFailure(record) ? <Tooltip title={'The volume cannot be scheduled'}><Icon type="exclamation-circle-o" className={'error'} /></Tooltip> : null} {text}
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
      render: (text) => {
        return (
          <div>
            {formatMib(text)}
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
      width: '7.63%',
      render: (text) => {
        let title = (<div>
          <div><span>PV Name</span><span>: </span><span >{text.pvName}</span></div>
          <div><span>PV Status</span><span>: </span><span >{text.pvStatus}</span></div>
          { text.lastPVCRefAt ? <div><span >Last time bound with PVC</span><span> : </span><span >{moment(new Date(text.lastPVCRefAt)).fromNow()}</span></div> : ''}
          { text.pvcName ? <div><span>{ text.lastPVCRefAt ? 'Last Bounded' : ''} PVC Name</span><span>: </span><span >{text.pvcName}</span></div> : ''}
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
          <Tooltip placement="top" title={ text.lastPVCRefAt ? 'Last Namespace' : ''}>
            <div style={text.lastPVCRefAt ? { background: 'rgba(241, 196, 15, 0.1)', minWidth: 100 } : { minWidth: 100 }}>
              <div>{ text.namespace }</div>
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: 'Attached To',
      dataIndex: 'WorloadNameAndPodName',
      key: 'WorloadNameAndPodName',
      width: '12.5%',
      sorter: (a, b) => sortTable(a, b, 'WorloadName'),
      render: (text, record) => {
        const title = text.lastPodRefAt ? <div><div>Last time used: {moment(new Date(text.lastPodRefAt)).fromNow()}</div></div> : ''
        const ele = text.podList.length ? text.podList.map((item, index) => {
          return <div key={index}>{item.podName}</div>
        }) : ''
        return (
          <Tooltip placement="top" title={title} >
            <a onClick={() => { showWorkloadsStatusDetail(text) }} className={style.workloadContainer} style={text.lastPodRefAt && ele ? { background: 'rgba(241, 196, 15, 0.1)', padding: '5px' } : {}}>
              {ele}
              <div>{record.controllers.map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px' }} key={item.hostId}>{item.hostId ? <span>on {item.hostId}</span> : <span></span>}</div>)}</div>
            </a>
          </Tooltip>
        )
      },
    },
    {
      title: <div><div>Schedule</div></div>,
      key: 'recurringJobs',
      width: '9.375%',
      render: (text) => {
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
          <Tooltip placement="top" title={title} >
            <div onClick={() => { showSnapshotDetail(text.recurringJobs) }} style={{ cursor: 'pointer' }}>
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

  const pagination = false
  const onChange = (p, f, s) => {
    onSorterChange(s)
  }
  setSortOrder(columns, sorter)

  return (
    <div id='volumeTable' style={{ flex: 1 , height: '1px', overflow: 'hidden'}}>
      <Table
        rowSelection={rowSelection}
        bordered={false}
        columns={columns}
        onChange={onChange}
        dataSource={dataSource}
        loading={loading}
        simple
        pagination={pagination}
        rowKey={record => record.id}
        height= {'100%'}
        scroll={{ x: 1440, y: height }}
      />
    </div>
  )
}

list.propTypes = {
  loading: PropTypes.bool,
  dataSource: PropTypes.array,
  engineImages: PropTypes.array,
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
  createPVAndPVC: PropTypes.func,
  showWorkloadsStatusDetail: PropTypes.func,
  showSnapshotDetail: PropTypes.func,
}

export default list
