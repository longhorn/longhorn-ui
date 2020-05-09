import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Card, Modal, Alert } from 'antd'
import { routerRedux } from 'dva/router'
import queryString from 'query-string'
import moment from 'moment'
import VolumeActions from '../VolumeActions'
import VolumeInfo from './VolumeInfo'
import styles from './index.less'
import AttachHost from '../AttachHost'
import EngineUpgrade from '../EngineUpgrade'
import UpdateReplicaCount from '../UpdateReplicaCount'
import Snapshots from './Snapshots'
import RecurringList from './RecurringList'
import EventList from './EventList'
import CreatePVAndPVCSingle from '../CreatePVAndPVCSingle'
import ChangeVolumeModal from '../ChangeVolumeModal'
import ExpansionVolumeSizeModal from '../ExpansionVolumeSizeModal'
import Salvage from '../Salvage'
import { ReplicaList, ExpansionErrorDetail } from '../../../components'
import { genAttachHostModalProps, getEngineUpgradeModalProps, getUpdateReplicaCountModalProps } from '../helper'
import { addPrefix } from '../../../utils/pathnamePrefix'

const confirm = Modal.confirm

function VolumeDetail({ snapshotModal, dispatch, backup, engineimage, eventlog, host, volume, volumeId, loading }) {
  const { data, attachHostModalVisible, engineUpgradeModalVisible, salvageModalVisible, updateReplicaCountModalVisible, createPVAndPVCModalSingleKey, defaultPVName, defaultPVCName, pvNameDisabled, createPVAndPVCSingleVisible, selectPVCaction, nameSpaceDisabled, changeVolumeModalKey, changeVolumeActivate, changeVolumeModalVisible, previousChecked, expansionVolumeSizeModalVisible, expansionVolumeSizeModalKey } = volume
  const { backupStatus } = backup
  const { data: snapshotData, state: snapshotModalState } = snapshotModal
  const hosts = host.data
  const engineImages = engineimage.data
  const selectedVolume = data.find(item => item.id === volumeId)
  const hasReplica = (selected, name) => {
    if (selected && selected.replicas && selected.replicas.length > 0) {
      return selected.replicas.some((item) => {
        return item.name === name
      })
    }

    return false
  }
  const hasEngine = (selected, name) => {
    if (selected && selected.replicas && selected.replicas.length > 0) {
      return selected.controllers.some((item) => {
        return item.name === name
      })
    }

    return false
  }
  const eventData = eventlog && eventlog.data ? eventlog.data.filter((ele) => {
    if (ele.event && ele.event.involvedObject && ele.event.involvedObject.name && ele.event.involvedObject.kind && selectedVolume) {
      switch (ele.event.involvedObject.kind) {
        case 'Engine':
          return hasEngine(selectedVolume, ele.event.involvedObject.name)
        case 'Replica':
          return hasReplica(selectedVolume, ele.event.involvedObject.name)
        case 'Volume':
          return selectedVolume.id === ele.event.involvedObject.name
        default:
          return false
      }
    }

    return false
  }).map((ele, index) => {
    return {
      count: ele.event ? ele.event.count : '',
      firstTimestamp: ele.event && ele.event.firstTimestamp ? ele.event.firstTimestamp : '',
      lastTimestamp: ele.event && ele.event.lastTimestamp ? ele.event.lastTimestamp : '',
      timestamp: ele.event && ele.event.lastTimestamp ? Date.parse(ele.event.lastTimestamp) : 0,
      type: ele.event ? ele.event.type : '',
      reason: ele.event ? ele.event.reason : '',
      message: ele.event ? ele.event.message : '',
      source: ele.event && ele.event.source && ele.event.source.component ? ele.event.source.component : '',
      kind: ele.event && ele.event.involvedObject && ele.event.involvedObject.kind ? ele.event.involvedObject.kind : '',
      name: ele.event && ele.event.involvedObject && ele.event.involvedObject.name ? ele.event.involvedObject.name : '',
      id: index,
    }
  }) : []
  eventData.sort((a, b) => {
    return b.timestamp - a.timestamp
  })
  if (!selectedVolume) {
    return (<div></div>)
  }
  const found = hosts.find(h => selectedVolume.controller && h.id === selectedVolume.controller.hostId)
  if (found) {
    selectedVolume.host = found.name
  }
  selectedVolume.replicas.forEach(replica => { replica.volState = selectedVolume.state })
  const replicaListProps = {
    dataSource: selectedVolume.replicas || [],
    purgeStatus: selectedVolume.purgeStatus || [],
    restoreStatus: selectedVolume.restoreStatus || [],
    rebuildStatus: selectedVolume.rebuildStatus || [],
    hosts,
    deleteReplicas(replicas) {
      replicas.forEach(replica => { replica.removeUrl = selectedVolume.actions.replicaRemove })
      if (selectedVolume.actions.replicaRemove) {
        dispatch({
          type: 'volume/deleteReplicas',
          replicas,
        })
      }
    },
    loading,
  }

  const backupStatusProps = {
    selectedVolume,
    backupStatus,
    snapshotData,
    snapshotModalState,
    engineImages,
    clearBackupStatus() {
      dispatch({
        type: 'backup/updateBackupStatus',
        payload: {
          backupStatus: {},
        },
      })
    },
    queryBackupStatus() {
      dispatch({
        type: 'backup/queryBackupStatus',
        payload: {
          url: selectedVolume.actions.latestBackupStatus,
        },
      })
    },
  }

  const volumeActionsProps = {
    engineImages,
    takeSnapshot(record) {
      dispatch({
        type: 'snapshotModal/snapshotAction',
        payload: {
          type: 'snapshotCreate',
          url: record.actions.snapshotCreate,
          params: {
            name: '',
          },
          querySnapShotUrl: record.actions.snapshotList,
        },
      })
    },
    showAttachHost(record) {
      dispatch({
        type: 'volume/showAttachHostModal',
        payload: {
          selected: record,
        },
      })
    },
    showSnapshots(record) {
      dispatch(routerRedux.push({
        pathname: addPrefix(`/volume/${record.name}/snapshots`),
      }))
    },
    showRecurring(record) {
      dispatch({
        type: 'volume/showRecurringModal',
        payload: {
          selected: record,
        },
      })
    },
    deleteVolume(record) {
      dispatch({
        type: 'volume/deleteAndRedirect',
        payload: record,
      })
    },
    detach(url) {
      dispatch({
        type: 'volume/detach',
        payload: {
          url,
        },
      })
    },
    showEngineUpgrade(record) {
      dispatch({
        type: 'volume/showEngineUpgradeModal',
        payload: {
          selected: record,
        },
      })
    },
    showBackups(record) {
      dispatch(routerRedux.push({
        pathname: addPrefix(`/backup/${record.name}`),
        search: queryString.stringify({
          field: 'volumeName',
          keyword: record.name,
        }),
        state: true,
      }))
    },
    showSalvage(record) {
      dispatch({
        type: 'volume/showSalvageModal',
        payload: {
          selected: record,
        },
      })
    },
    rollback(record) {
      dispatch({
        type: 'volume/rollback',
        payload: {
          image: record.currentImage,
          url: record.actions.engineUpgrade,
        },
      })
    },
    showUpdateReplicaCount(record) {
      dispatch({
        type: 'volume/showUpdateReplicaCountModal',
        payload: {
          selected: record,
        },
      })
    },
    createPVAndPVC(actions) {
      dispatch({
        type: 'volume/showCreatePVCAndPVSingleModal',
        payload: actions,
      })
    },
    changeVolume(record) {
      dispatch({
        type: 'volume/showChangeVolumeModal',
        payload: record.actions.activate,
      })
    },
    showExpansionVolumeSizeModal(record) {
      dispatch({
        type: 'volume/showExpansionVolumeSizeModal',
        payload: record,
      })
    },
    showCancelExpansionModal(record) {
      let message = ''
      let lastExpansionError = ''
      let lastExpansionFailedAt = ''

      if (record && record.kubernetesStatus) {
        if (record.kubernetesStatus.pvStatus) {
          message = (<div>
            <div>If the in-progress expansion you want to cancel is triggered by the PVC size update, this operation will not help revert the PVC. Since the PVC size can not shrink, users need to clean up then recreate the PVC and PV after the expansion canceling success:</div>
            <div>1. Update the field spec.persistentVolumeReclaimPolicy to Retain for the corresponding PV. </div>
            <div>2. Delete then recreate the related PVC and PV.</div></div>)
        }
      }

      if (record && record.controllers && record.controllers[0] && record.controllers[0].lastExpansionError && record.controllers[0].lastExpansionFailedAt) {
        lastExpansionError = record.controllers[0].lastExpansionError
        lastExpansionFailedAt = moment(record.controllers[0].lastExpansionFailedAt).fromNow()
      }

      let content = (<div>
        <div>This operation is used to cancel the expansion if the volume cannot complete the expansion and gets stuck there. Once the expansion is complete, it cannot be rolled back or canceled</div>
        {lastExpansionError ? <ExpansionErrorDetail content={lastExpansionError} lastExpansionFailedAt={lastExpansionFailedAt} /> : '' }
        {message ? <Alert style={{ marginTop: '5px' }} message={message} type="info" /> : ''}
        </div>)

      confirm({
        title: 'Are you sure to cancel expansion?',
        content,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        width: 800,
        onOk() {
          dispatch({
            type: 'volume/cancelExpansion',
            payload: record,
          })
        },
      })
    },
  }

  const attachHostModalProps = genAttachHostModalProps([selectedVolume], hosts, attachHostModalVisible, dispatch)

  const engineUpgradeModalProps = getEngineUpgradeModalProps([selectedVolume], engineImages, engineUpgradeModalVisible, dispatch)

  const recurringListProps = {
    selectedVolume,
    dataSourceReplicas: selectedVolume.replicas || [],
    dataSource: selectedVolume.recurringJobs || [],
    loading,
    onOk(recurring) {
      dispatch({
        type: 'volume/recurringUpdate',
        payload: {
          recurring,
          url: selectedVolume.actions.recurringUpdate,
        },
      })
    },
  }


  const EventListProps = {
    dataSource: eventData,
  }

  const snapshotsProp = {
    ...snapshotModal,
    volume: selectedVolume,
    volumeId,
    dispatch,
    volumeHead: snapshotData.find(d => d.name === 'volume-head'),
  }

  const salvageModalProps = {
    item: selectedVolume,
    visible: salvageModalVisible,
    hosts,
    onOk(replicaNames, url) {
      dispatch({
        type: 'volume/salvage',
        payload: {
          replicaNames,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideSalvageModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }

  const bodyStyle = {
    bodyStyle: {
      height: 360,
      background: '#fff',
      overflowY: 'auto',
    },
  }

  const updateReplicaCountModalProps = getUpdateReplicaCountModalProps(selectedVolume, updateReplicaCountModalVisible, dispatch)

  const createPVAndPVCSingleProps = {
    item: {
      defaultPVName,
      defaultPVCName,
      pvNameDisabled,
    },
    selected: selectedVolume.kubernetesStatus ? selectedVolume.kubernetesStatus : {},
    visible: createPVAndPVCSingleVisible,
    nameSpaceDisabled,
    previousChecked,
    onOk(params) {
      dispatch({
        type: 'volume/createPVAndPVCSingle',
        payload: {
          action: selectPVCaction,
          params,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideCreatePVCAndPVSingleModal',
      })
    },
    onChange() {
      dispatch({
        type: 'volume/changeCheckbox',
      })
    },
    setPreviousChange(checked) {
      dispatch({
        type: 'volume/setPreviousChange',
        payload: checked,
      })
    },
  }

  const expansionVolumeSizeModalProps = {
    item: {
      size: 20,
    },
    hosts,
    visible: expansionVolumeSizeModalVisible,
    selected: selectedVolume,
    onOk(params) {
      dispatch({
        type: 'volume/expandVolume',
        payload: {
          params,
          selected: selectedVolume,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideExpansionVolumeSizeModal',
      })
    },
  }

  const changeVolumeModalProps = {
    item: {
      frontend: 'iscsi',
    },
    hosts,
    visible: changeVolumeModalVisible,
    onOk(newVolume) {
      let volumeData = Object.assign(newVolume, { url: changeVolumeActivate })
      dispatch({
        type: 'volume/volumeActivate',
        payload: volumeData,
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideChangeVolumeModal',
      })
    },
  }

  return (
    <div style={{ overflowY: 'auto', overflowX: 'hidden', height: '100%' }}>
      <Row gutter={24}>
        <Col md={{ offset: 16, span: 8 }} style={{ marginBottom: 16, textAlign: 'right' }}>
          <VolumeActions {...volumeActionsProps} selected={selectedVolume} />
        </Col>
        <Col md={8} xs={24} className={styles.col}>
          <Card title="Volume Details" bordered={false} {...bodyStyle}>
            <VolumeInfo {...backupStatusProps} />
          </Card>
        </Col>
        <Col md={16} xs={24} style={{ marginBottom: 16 }}>
          <Card title="Replicas" bordered={false} {...bodyStyle}>
            <ReplicaList {...replicaListProps} />
          </Card>
        </Col>
        <Col xs={24} style={{ marginBottom: 16 }}>
          <Snapshots {...snapshotsProp} />
        </Col>
        <Col xs={24} style={{ marginBottom: 16 }}>
          <RecurringList {...recurringListProps} />
        </Col>
        <Col xs={24}>
          <EventList {...EventListProps} />
        </Col>
      </Row>
      {attachHostModalVisible && <AttachHost {...attachHostModalProps} />}
      {engineUpgradeModalVisible && <EngineUpgrade {...engineUpgradeModalProps} />}
      {updateReplicaCountModalVisible && <UpdateReplicaCount {...updateReplicaCountModalProps} />}
      {expansionVolumeSizeModalVisible ? <ExpansionVolumeSizeModal key={expansionVolumeSizeModalKey} {...expansionVolumeSizeModalProps}></ExpansionVolumeSizeModal> : ''}
      {salvageModalVisible ? <Salvage {...salvageModalProps} /> : ''}
      {changeVolumeModalVisible ? <ChangeVolumeModal key={changeVolumeModalKey} {...changeVolumeModalProps} /> : ''}
      {createPVAndPVCSingleVisible ? <CreatePVAndPVCSingle key={createPVAndPVCModalSingleKey} {...createPVAndPVCSingleProps} /> : ''}
    </div>
  )
}

VolumeDetail.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  backup: PropTypes.object,
  host: PropTypes.object,
  engineimage: PropTypes.object,
  volumeId: PropTypes.string,
  loading: PropTypes.bool,
  snapshotModal: PropTypes.object,
  eventlog: PropTypes.object,
}

export default connect(({ snapshotModal, backup, host, engineimage, volume, loading, eventlog }, { match }) => ({ snapshotModal, backup, host, volume, engineimage, loading: loading.models.volume, volumeId: match.params.id, eventlog }))(VolumeDetail)
