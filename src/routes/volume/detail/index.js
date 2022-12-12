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
import UpdateDataLocality from '../UpdateDataLocality'
import UpdateSnapshotDataIntegrityModal from '../UpdateSnapshotDataIntegrityModal'
import UpdateAccessMode from '../UpdateAccessMode'
import UpdateUnmapMarkSnapChainRemovedModal from '../UpdateUnmapMarkSnapChainRemovedModal'
import Snapshots from './Snapshots'
import RecurringJob from './RecurringJob'
import EventList from './EventList'
import SnapshotList from './SnapshotList'
import CreatePVAndPVCSingle from '../CreatePVAndPVCSingle'
import ChangeVolumeModal from '../ChangeVolumeModal'
import ExpansionVolumeSizeModal from '../ExpansionVolumeSizeModal'
import UpdateReplicaAutoBalanceModal from '../UpdateReplicaAutoBalanceModal'
import Salvage from '../Salvage'
import { ReplicaList, ExpansionErrorDetail } from '../../../components'
import ConfirmModalWithWorkload from '../ConfirmModalWithWorkload'
import { genAttachHostModalProps, getEngineUpgradeModalProps, getUpdateReplicaCountModalProps, getUpdateDataLocalityModalProps, getUpdateAccessModeModalProps, getUpdateReplicaAutoBalanceModalProps, getUnmapMarkSnapChainRemovedModalProps, getUpdateSnapshotDataIntegrityProps } from '../helper'

const confirm = Modal.confirm

function VolumeDetail({ snapshotModal, dispatch, backup, engineimage, eventlog, host, volume, volumeId, setting, loading, backingImage, recurringJob }) {
  const { data, attachHostModalVisible, engineUpgradeModalVisible, salvageModalVisible, updateReplicaCountModalVisible, createPVAndPVCModalSingleKey, defaultPVName, defaultPVCName, pvNameDisabled, previousNamespace, createPVAndPVCSingleVisible, nameSpaceDisabled, changeVolumeModalKey, changeVolumeActivate, changeVolumeModalVisible, previousChecked, expansionVolumeSizeModalVisible, expansionVolumeSizeModalKey, updateDataLocalityModalVisible, updateDataLocalityModalKey, updateAccessModeModalVisible, updateAccessModeModalKey, confirmModalWithWorkloadVisible, confirmModalWithWorkloadKey, updateReplicaAutoBalanceModalVisible, updateReplicaAutoBalanceModalKey, volumeRecurringJobs, unmapMarkSnapChainRemovedModalKey, unmapMarkSnapChainRemovedModalVisible, updateSnapshotDataIntegrityModalVisible, updateSnapshotDataIntegrityModalKey } = volume
  const { backupStatus, backupTargetAvailable, backupTargetMessage } = backup
  const { data: snapshotData, state: snapshotModalState } = snapshotModal
  const { data: recurringJobData } = recurringJob
  const hosts = host.data
  const engineImages = engineimage.data
  const selectedVolume = data.find(item => item.id === volumeId)
  const currentBackingImage = selectedVolume && selectedVolume.backingImage && backingImage.data ? backingImage.data.find(item => item.name === selectedVolume.backingImage) : null
  const settings = setting.data
  const defaultDataLocalitySetting = settings.find(s => s.id === 'default-data-locality')
  const defaultSnapshotDataIntegritySetting = settings.find(s => s.id === 'snapshot-data-integrity')
  const engineUpgradePerNodeLimit = settings.find(s => s.id === 'concurrent-automatic-engine-upgrade-per-node-limit')
  const defaultDataLocalityOption = defaultDataLocalitySetting && defaultDataLocalitySetting.definition && defaultDataLocalitySetting.definition.options ? defaultDataLocalitySetting.definition.options : []
  const defaultSnapshotDataIntegrityOption = defaultSnapshotDataIntegritySetting?.definition?.options ? defaultSnapshotDataIntegritySetting.definition.options.map((item) => { return { key: item.firstUpperCase(), value: item } }) : []
  if (defaultSnapshotDataIntegrityOption.length > 0) {
    defaultSnapshotDataIntegrityOption.push({ key: 'Ignored (Follow the global setting)', value: 'ignored' })
  }
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
    snapshotModalState,
    engineImages,
    currentBackingImage,
    hosts,
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
        pathname: `/volume/${record.name}/snapshots`,
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
        pathname: `/backup/${record.name}`,
        search: queryString.stringify({
          field: 'volumeName',
          keyword: record.name,
        }),
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
    showUpdateDataLocality(record) {
      dispatch({
        type: 'volume/showUpdateDataLocality',
        payload: {
          selected: record,
        },
      })
    },
    showUpdateSnapshotDataIntegrityModal(record) {
      dispatch({
        type: 'volume/showUpdateSnapshotDataIntegrityModal',
        payload: {
          selected: record,
        },
      })
    },
    showUpdateAccessMode(record) {
      dispatch({
        type: 'volume/showUpdateAccessMode',
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
    showUpdateReplicaAutoBalanceModal(record) {
      if (record) {
        dispatch({
          type: 'volume/showUpdateReplicaAutoBalanceModal',
          payload: {
            selected: record,
          },
        })
      }
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
    confirmDetachWithWorkload() {
      dispatch({
        type: 'volume/showConfirmDetachWithWorkload',
      })
    },
    showUnmapMarkSnapChainRemovedModal(record) {
      dispatch({
        type: 'volume/showUnmapMarkSnapChainRemovedModal',
        payload: {
          selected: record,
        },
      })
    },
    trimFilesystem(record) {
      if (record?.actions?.trimFilesystem) {
        dispatch({
          type: 'volume/trimFilesystem',
          payload: {
            params: record,
            url: record.actions.trimFilesystem,
          },
        })
      }
    },
  }

  const attachHostModalProps = genAttachHostModalProps([selectedVolume], hosts, attachHostModalVisible, dispatch)

  const engineUpgradeModalProps = getEngineUpgradeModalProps([selectedVolume], engineImages, engineUpgradePerNodeLimit, engineUpgradeModalVisible, dispatch)

  const updateReplicaAutoBalanceModalProps = getUpdateReplicaAutoBalanceModalProps([selectedVolume], updateReplicaAutoBalanceModalVisible, dispatch)

  const recurringJobProps = {
    dataSource: volumeRecurringJobs,
    recurringJobData,
    selectedVolume,
    loading,
    dispatch,
  }

  const snapshotListProps = {
    dataSource: snapshotModal.data,
    selectedVolume,
  }

  const eventListProps = {
    dataSource: eventData,
    dispatch,
  }

  const snapshotsProp = {
    ...snapshotModal,
    volume: selectedVolume,
    volumeId,
    dispatch,
    backupTargetAvailable,
    backupTargetMessage,
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
  const updateDataLocalityModalProps = getUpdateDataLocalityModalProps(selectedVolume, updateDataLocalityModalVisible, defaultDataLocalityOption, dispatch)
  const unmapMarkSnapChainRemovedModalProps = getUnmapMarkSnapChainRemovedModalProps(selectedVolume, unmapMarkSnapChainRemovedModalVisible, dispatch)
  const updateSnapshotDataIntegrityModalProps = getUpdateSnapshotDataIntegrityProps(selectedVolume, updateSnapshotDataIntegrityModalVisible, defaultSnapshotDataIntegrityOption, dispatch)
  const updateAccessModeModalProps = getUpdateAccessModeModalProps(selectedVolume, updateAccessModeModalVisible, dispatch)
  const createPVAndPVCSingleProps = {
    item: {
      defaultPVName,
      defaultPVCName,
      pvNameDisabled,
      previousNamespace,
      accessMode: selectedVolume && selectedVolume.accessMode ? selectedVolume.accessMode : 'rwo',
      encrypted: selectedVolume && selectedVolume.encrypted,
    },
    selected: selectedVolume && selectedVolume.kubernetesStatus ? selectedVolume.kubernetesStatus : {},
    visible: createPVAndPVCSingleVisible,
    nameSpaceDisabled,
    previousChecked,
    onOk(params) {
      dispatch({
        type: 'volume/createPVAndPVCSingle',
        payload: {
          selectedVolume,
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
      unit: 'Gi',
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

  const confirmModalWithWorkloadProps = {
    visible: confirmModalWithWorkloadVisible,
    title: `Detach volume ${selectedVolume.name}`,
    onOk() {
      if (selectedVolume.actions && selectedVolume.actions.detach) {
        dispatch({
          type: 'volume/detach',
          payload: {
            url: selectedVolume.actions.detach,
          },
        })
      }
      dispatch({
        type: 'volume/hideConfirmDetachWithWorkload',
      })
      dispatch({
        type: 'snapshotModal/stopPolling',
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideConfirmDetachWithWorkload',
      })
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div>
        <Col className="out-container-button" md={{ offset: 16, span: 8 }} style={{ marginBottom: 16, textAlign: 'right' }}>
          <VolumeActions {...volumeActionsProps} selected={selectedVolume} />
        </Col>
      </div>
      <div style={{ overflowY: 'auto', overflowX: 'hidden', height: '100%' }}>
        <Row gutter={24}>
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
            <RecurringJob {...recurringJobProps} />
          </Col>
          <Col style={{ marginBottom: 10 }} xs={24}>
            <SnapshotList {...snapshotListProps} />
          </Col>
          <Col xs={24}>
            <EventList {...eventListProps} />
          </Col>
        </Row>
        {attachHostModalVisible && <AttachHost {...attachHostModalProps} />}
        {engineUpgradeModalVisible && <EngineUpgrade {...engineUpgradeModalProps} />}
        {updateReplicaCountModalVisible && <UpdateReplicaCount {...updateReplicaCountModalProps} />}
        {updateDataLocalityModalVisible ? <UpdateDataLocality key={updateDataLocalityModalKey} {...updateDataLocalityModalProps} /> : ''}
        {unmapMarkSnapChainRemovedModalVisible ? <UpdateUnmapMarkSnapChainRemovedModal key={unmapMarkSnapChainRemovedModalKey} {...unmapMarkSnapChainRemovedModalProps} /> : ''}
        {updateSnapshotDataIntegrityModalVisible ? <UpdateSnapshotDataIntegrityModal key={updateSnapshotDataIntegrityModalKey} {...updateSnapshotDataIntegrityModalProps} /> : ''}
        {updateAccessModeModalVisible ? <UpdateAccessMode key={updateAccessModeModalKey} {...updateAccessModeModalProps} /> : ''}
        {expansionVolumeSizeModalVisible ? <ExpansionVolumeSizeModal key={expansionVolumeSizeModalKey} {...expansionVolumeSizeModalProps}></ExpansionVolumeSizeModal> : ''}
        {salvageModalVisible ? <Salvage {...salvageModalProps} /> : ''}
        {changeVolumeModalVisible ? <ChangeVolumeModal key={changeVolumeModalKey} {...changeVolumeModalProps} /> : ''}
        {createPVAndPVCSingleVisible ? <CreatePVAndPVCSingle key={createPVAndPVCModalSingleKey} {...createPVAndPVCSingleProps} /> : ''}
        {confirmModalWithWorkloadVisible ? <ConfirmModalWithWorkload key={confirmModalWithWorkloadKey} {...confirmModalWithWorkloadProps} /> : ''}
        {updateReplicaAutoBalanceModalVisible ? <UpdateReplicaAutoBalanceModal key={updateReplicaAutoBalanceModalKey} {...updateReplicaAutoBalanceModalProps} /> : ''}
      </div>
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
  setting: PropTypes.object,
  backingImage: PropTypes.object,
  recurringJob: PropTypes.object,
}

export default connect(({ snapshotModal, backup, host, engineimage, volume, loading, eventlog, setting, backingImage, recurringJob }, { match }) => ({ snapshotModal, backup, host, volume, engineimage, loading: loading.models.volume, volumeId: match.params.id, eventlog, setting, backingImage, recurringJob }))(VolumeDetail)
