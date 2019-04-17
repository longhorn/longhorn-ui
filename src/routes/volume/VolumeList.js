import React, { PropTypes } from 'react'
import { Table, Icon, Tooltip } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { LinkTo, EngineImageUpgradeTooltip, ReplicaHATooltip } from '../../components'
import { formatMib, utcStrToDate } from '../../utils/formater'
import VolumeActions from './VolumeActions'
import { isSchedulingFailure, getHealthState, needToWaitDone, extractImageVersion } from './helper/index'
import { sortTable, sortTableByUTCDate } from '../../utils/sort'
import { setSortOrder } from '../../utils/store'
import style from './VolumeList.less'
import { isVolumeImageUpgradable, isVolumeReplicaNotRedundancy, isVolumeRelicaLimited } from '../../utils/filter'
import IconNoRelation from '../../components/Icon/IconNoRelation'
import IconRelation from '../../components/Icon/IconRelation'
import IconPassRelation from '../../components/Icon/IconPassRelation'

function list({ loading, dataSource, engineImages, showAttachHost, showEngineUpgrade, showRecurring, showSnapshots, detach, deleteVolume, showBackups, takeSnapshot, showSalvage, showUpdateReplicaCount, rollback, rowSelection, sorter, createPVAndPVC, showWorkloadsStatusDetail, onSorterChange = f => f }) {
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
  }
  /**
   *add dataSource kubernetesStatus fields
   */
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
      width: 130,
      sorter: (a, b) => sortTable(a, b, 'state'),
      render: (text, record) => {
        let upgrade = null
        if (isVolumeImageUpgradable(record, defaultImage)) {
          const currentVersion = extractImageVersion(record.currentImage)
          const latestVersion = extractImageVersion(defaultImage.image)
          upgrade = (<EngineImageUpgradeTooltip currentVersion={currentVersion} latestVersion={latestVersion} />)
        }
        return (
          <div className={classnames({ [text.toLowerCase()]: true, capitalize: true }, style.volumeState)}>
            {upgrade} {text.hyphenToHump()} {needToWaitDone(text, record.replicas) ? <Icon type="loading" /> : null}
          </div>
        )
      },
    }, {
      title: 'Health',
      dataIndex: 'robustness',
      key: 'robustness',
      width: 140,
      sorter: (a, b) => sortTable(a, b, 'robustness'),
      render: (text, record) => {
        const state = getHealthState(text)
        let ha = null
        if (isVolumeReplicaNotRedundancy(record)) {
          ha = (<ReplicaHATooltip type="danger" />)
        } else if (isVolumeRelicaLimited(record)) {
          ha = (<ReplicaHATooltip type="warning" />)
        }

        return (
          <div className={classnames({ [text.toLowerCase()]: true, capitalize: true }, style.volumeState)}>
            {ha} {state}
          </div>
        )
      },
    }, {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      sorter: (a, b) => sortTable(a, b, 'WorloadName'),
      render: (text, record) => {
        return (
          <div style={{ minWidth: '58px', maxWidth: '200px' }}>
            <LinkTo to={`/volume/${text}`}>
              {isSchedulingFailure(record) ? <Tooltip title={'The volume cannot be scheduled'}><Icon type="exclamation-circle-o" className={'error'} /></Tooltip> : null} {text}
            </LinkTo>
          </div>
        )
      },
    },
    {
      title: 'Attached Node',
      key: 'host',
      width: 150,
      render: (text, record) => {
        return (<div style={{ minWidth: '106px' }}>
          {record.controllers.map(item => <div style={{ fontFamily: 'monospace', margin: '2px 0px', minHeight: '22px' }} key={item.hostId}>{item.hostId ? <span>{item.hostId}</span> : <span>&nbsp;</span>}</div>)}
        </div>)
      },
    },
    {
      title: 'Workload/Pod',
      dataIndex: 'WorloadNameAndPodName',
      key: 'WorloadNameAndPodName',
      sorter: (a, b) => sortTable(a, b, 'id'),
      width: 260,
      render: (text) => {
        const title = text.lastPodRefAt ? <div><div>Last time used: {moment(new Date(text.lastPodRefAt)).fromNow()}</div><div>Click for details</div></div> : 'Click for details'
        const ele = text.podList.length ? text.podList.map((item, index) => {
          return <div key={index}>{item.podName}</div>
        }) : ''
        return (
          <Tooltip placement="top" title={title} >
            <a onClick={() => { showWorkloadsStatusDetail(text) }} className={style.workloadContainer} style={text.lastPodRefAt && ele ? { background: 'rgba(241, 196, 15, 0.1)', padding: '5px' } : {}}>
              {ele}
            </a>
          </Tooltip>
        )
      },
    },
    {
      title: 'PV/PVC',
      dataIndex: 'kubernetesStatus',
      key: 'kubernetesStatus',
      width: 120,
      render: (text) => {
        let title = (<div>
          <div style={{ display: 'flex' }}><div>PV Name</div><div style={{ margin: '0px 4px' }}> : </div><div >{text.pvName}</div></div>
          <div style={{ display: 'flex' }}><div>PV Status</div><div style={{ margin: '0px 4px' }}> : </div><div >{text.pvStatus}</div></div>
          { text.lastPVCRefAt ? <div style={{ display: 'flex' }}><div >Last time bound with PVC</div><div style={{ margin: '0px 4px' }}> : </div><div >{moment(new Date(text.lastPVCRefAt)).fromNow()}</div></div> : ''}
          { text.namespace ? <div style={{ display: 'flex' }}><div>{ text.lastPVCRefAt ? 'Last' : ''} Namespace</div><div style={{ margin: '0px 4px' }}> : </div><div >{text.namespace}</div></div> : ''}
          { text.pvcName ? <div style={{ display: 'flex' }}><div>{ text.lastPVCRefAt ? 'Last' : ''} PVC Name</div><div style={{ margin: '0px 4px' }}> : </div><div >{text.pvcName}</div></div> : ''}
        </div>)
        let content = (() => {
          if (!text.pvName) {
            return ''
          }
          if (text.pvName && !text.pvcName && !text.namespace) {
            return <IconNoRelation width={30} height={30} />
          }
          if (text.pvName && text.pvcName && text.namespace && !text.lastPVCRefAt) {
            return <IconRelation width={30} height={30} />
          }
          if (text.pvName && text.pvcName && text.namespace && text.lastPVCRefAt) {
            return <IconPassRelation width={30} height={30} />
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
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      sorter: (a, b) => sortTable(a, b, 'size'),
      render: (text) => {
        return (
          <div style={{ minWidth: '46px' }}>
            {formatMib(text)}
          </div>
        )
      },
    }, {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      width: 200,
      sorter: (a, b) => sortTableByUTCDate(a, b, 'created'),
      render: (text) => {
        return (
          <div style={{ minWidth: '80px' }}>
            {moment(utcStrToDate(text)).fromNow()}
          </div>
        )
      },
    }, {
      title: '',
      key: 'operation',
      width: 62,
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
    <div>
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
}

export default list
