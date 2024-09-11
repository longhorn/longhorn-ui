import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import moment from 'moment'
import { Row, Col, Button, Modal, Alert } from 'antd'
import queryString from 'query-string'
import VolumeList from './VolumeList'
import BulkCloneVolumeModal from './BulkCloneVolumeModal'
import BulkChangeVolumeModal from './BulkChangeVolumeModal'
import ChangeVolumeModal from './ChangeVolumeModal'
import CreateVolume from './CreateVolume'
import CloneVolume from './CloneVolume'
import CustomColumn from './CustomColumn'
import CreatePVAndPVC from './CreatePVAndPVC'
import CreatePVAndPVCSingle from './CreatePVAndPVCSingle'
import CreateBackupModal from './detail/CreateBackupModal'
import CommonModal from './components/CommonModal'
import ExpansionVolumeSizeModal from './ExpansionVolumeSizeModal'
import WorkloadDetailModal from './WorkloadDetailModal'
import RecurringJobModal from './RecurringJobModal'
import AttachHost from './AttachHost'
import DetachHost from './DetachHost'
import EngineUgrade from './EngineUpgrade'
import UpdateReplicaCount from './UpdateReplicaCount'
import UpdateBulkReplicaCount from './UpdateBulkReplicaCount'
import UpdateDataLocality from './UpdateDataLocality'
import UpdateSnapshotMaxCountModal from './UpdateSnapshotMaxCountModal.js'
import UpdateSnapshotMaxSizeModal from './UpdateSnapshotMaxSizeModal.js'
import UpdateUnmapMarkSnapChainRemovedModal from './UpdateUnmapMarkSnapChainRemovedModal'
import UpdateBulkUnmapMarkSnapChainRemovedModal from './UpdateBulkUnmapMarkSnapChainRemovedModal'
import UpdateSnapshotDataIntegrityModal from './UpdateSnapshotDataIntegrityModal'
import UpdateBulkSnapshotDataIntegrityModal from './UpdateBulkSnapshotDataIntegrityModal'
import UpdateFreezeFilesystemForSnapshotModal from './UpdateFreezeFilesystemForSnapshotModal'
import UpdateBulkFreezeFilesystemForSnapshotModal from './UpdateBulkFreezeFilesystemForSnapshotModal'
import UpdateAccessMode from './UpdateAccessMode'
import UpdateBulkAccessMode from './UpdateBulkAccessMode'
import UpdateReplicaAutoBalanceModal from './UpdateReplicaAutoBalanceModal'
import UpdateBulkDataLocality from './UpdateBulkDataLocality'
import Salvage from './Salvage'
import { Filter, ExpansionErrorDetail } from '../../components/index'
import { isRestoring } from './helper'
import VolumeBulkActions from './VolumeBulkActions'
import {
  getAttachHostModalProps,
  getEngineUpgradeModalProps,
  getBulkEngineUpgradeModalProps,
  getUpdateReplicaCountModalProps,
  getUpdateBulkReplicaCountModalProps,
  getUpdateDataLocalityModalProps,
  getUpdateBulkDataLocalityModalProps,
  getUpdateAccessModeModalProps,
  getUpdateBulkAccessModeModalProps,
  getUpdateReplicaAutoBalanceModalProps,
  getUnmapMarkSnapChainRemovedModalProps,
  getBulkUnmapMarkSnapChainRemovedModalProps,
  getUpdateBulkSnapshotDataIntegrityModalProps,
  getUpdateSnapshotDataIntegrityProps,
  getUpdateReplicaSoftAntiAffinityModalProps,
  getDetachHostModalProps,
  getUpdateSnapshotMaxCountModalProps,
  getUpdateSnapshotMaxSizeModalProps,
  getUpdateFreezeFilesystemForSnapshotModalProps,
  getUpdateBulkFreezeFilesystemForSnapshotModalProps,
} from './helper'
import { healthyVolume, inProgressVolume, degradedVolume, detachedVolume, faultedVolume, filterVolume, isVolumeImageUpgradable, isVolumeSchedule } from '../../utils/filter'
import C from '../../utils/constants'
import { hasReadyBackingDisk } from '../../utils/status'

const confirm = Modal.confirm

class Volume extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      height: 300,
      createBackModalKey: Math.random(),
      createBackModalVisible: false,
      selectedRows: [],
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
    const height = document.getElementById('volumeTable').offsetHeight - C.ContainerMarginHeight
    this.setState({
      height,
    })
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

  render() {
    const me = this
    const { dispatch, loading, location } = this.props
    const {
      selected,
      snapshotsOptions,
      cloneVolumeType,
      selectedRows,
      data,
      createPVAndPVCVisible,
      createPVAndPVCSingleVisible,
      createVolumeModalVisible,
      WorkloadDetailModalVisible,
      recurringJobModalVisible,
      WorkloadDetailModalItem,
      createPVAndPVCModalKey,
      createPVAndPVCModalSingleKey,
      createVolumeModalKey,
      WorkloadDetailModalKey,
      recurringJobModalKey,
      attachHostModalVisible,
      attachHostModalKey,
      detachHostModalVisible,
      detachHostModalKey,
      bulkAttachHostModalVisible,
      bulkAttachHostModalKey,
      engineUpgradeModalVisible,
      engineUpgradeModaKey,
      bulkEngineUpgradeModalVisible,
      bulkEngineUpgradeModalKey,
      salvageModalVisible,
      updateReplicaCountModalVisible,
      updateReplicaCountModalKey,
      sorter,
      defaultPVName,
      defaultPVCName,
      pvNameDisabled,
      defaultNamespace,
      nameSpaceDisabled,
      changeVolumeModalKey,
      bulkChangeVolumeModalKey,
      changeVolumeModalVisible,
      bulkChangeVolumeModalVisible,
      changeVolumeActivate,
      nodeTags,
      diskTags,
      tagsLoading,
      previousChecked,
      previousNamespace,
      expansionVolumeSizeModalVisible,
      expansionVolumeSizeModalKey,
      bulkCloneVolumeVisible,
      bulkExpandVolumeModalVisible,
      bulkExpandVolumeModalKey,
      updateBulkReplicaCountModalVisible,
      updateBulkReplicaCountModalKey,
      customColumnKey,
      customColumnVisible,
      customColumnList,
      volumeCloneModalVisible,
      volumeCloneModalKey,
      updateDataLocalityModalVisible,
      updateDataLocalityModalKey,
      updateBulkDataLocalityModalVisible,
      updateBulkDataLocalityModalKey,
      updateAccessModeModalVisible,
      updateAccessModeModalKey,
      updateBulkAccessModeModalVisible,
      updateBulkAccessModeModalKey,
      updateReplicaAutoBalanceModalVisible,
      updateReplicaAutoBalanceModalKey,
      volumeRecurringJobs,
      unmapMarkSnapChainRemovedModalVisible,
      unmapMarkSnapChainRemovedModalKey,
      bulkUnmapMarkSnapChainRemovedModalVisible,
      bulkUnmapMarkSnapChainRemovedModalKey,
      updateBulkSnapshotDataIntegrityModalVisible,
      updateBulkSnapshotDataIntegrityModalKey,
      updateSnapshotDataIntegrityModalVisible,
      updateSnapshotDataIntegrityModalKey,
      softAntiAffinityKey,
      updateReplicaSoftAntiAffinityVisible,
      updateReplicaSoftAntiAffinityModalKey,
      isBulkDetach,
      updateSnapshotMaxCountModalVisible,
      updateSnapshotMaxSizeModalVisible,
      updateFreezeFilesystemForSnapshotModalVisible,
      updateFreezeFilesystemForSnapshotModalKey,
      updateBulkFreezeFilesystemForSnapshotModalVisible,
      updateBulkFreezeFilesystemForSnapshotModalKey,
    } = this.props.volume
    const hosts = this.props.host.data
    const backingImages = this.props.backingImage.data
    const engineImages = this.props.engineimage.data
    const { backupTargetAvailable, backupTargetMessage } = this.props.backup
    const recurringJobData = this.props.recurringJob.data
    const { field, value, stateValue, nodeRedundancyValue, engineImageUpgradableValue, scheduleValue, pvStatusValue, revisionCounterValue } = queryString.parse(this.props.location.search)
    const settings = this.props.setting.data
    const defaultReplicaCountSetting = settings.find(s => s.id === 'default-replica-count')
    const defaultDataLocalitySetting = settings.find(s => s.id === 'default-data-locality')
    const defaultSnapshotDataIntegritySetting = settings.find(s => s.id === 'snapshot-data-integrity')
    const defaultRevisionCounterSetting = settings.find(s => s.id === 'disable-revision-counter')
    const defaultNumberOfReplicas = defaultReplicaCountSetting !== undefined ? parseInt(defaultReplicaCountSetting.value, 10) : 3
    const replicaSoftAntiAffinitySetting = settings.find(s => s.id === 'replica-soft-anti-affinity')
    const engineUpgradePerNodeLimit = settings.find(s => s.id === 'concurrent-automatic-engine-upgrade-per-node-limit')
    const v1DataEngineEnabledSetting = settings.find(s => s.id === 'v1-data-engine')
    const v2DataEngineEnabledSetting = settings.find(s => s.id === 'v2-data-engine')
    let replicaSoftAntiAffinitySettingValue = false
    if (replicaSoftAntiAffinitySetting) {
      replicaSoftAntiAffinitySettingValue = replicaSoftAntiAffinitySetting?.value.toLowerCase() === 'true'
    }
    const defaultDataLocalityOption = defaultDataLocalitySetting?.definition?.options || []
    const defaultDataLocalityValue = defaultDataLocalitySetting?.value || 'disabled'
    const defaultRevisionCounterValue = defaultRevisionCounterSetting?.value === 'true'
    const defaultSnapshotDataIntegrityOption = defaultSnapshotDataIntegritySetting?.definition?.options.map((item) => ({ key: item.toLowerCase(), value: item })) || []
    if (defaultSnapshotDataIntegrityOption.length > 0) {
      defaultSnapshotDataIntegrityOption.push({ key: 'ignored (follow the global setting)', value: 'ignored' })
    }

    const backingImageOptions = backingImages?.filter(image => hasReadyBackingDisk(image)) || []
    const v1DataEngineEnabled = v1DataEngineEnabledSetting?.value === 'true'
    const v2DataEngineEnabled = v2DataEngineEnabledSetting?.value === 'true'

    const volumeFilterMap = {
      healthy: healthyVolume,
      inProgress: inProgressVolume,
      degraded: degradedVolume,
      detached: detachedVolume,
      faulted: faultedVolume,
    }
    let volumes = data
    // TODO: extract these filter functions to a separate file
    if (field && field === 'status' && volumeFilterMap[stateValue]) {
      volumes = volumeFilterMap[stateValue](volumes)
    } else if (field && field === 'engineImageUpgradable') {
      const defaultImage = engineImages.find(image => image.default === true)
      if (engineImageUpgradableValue === 'yes') {
        volumes = volumes.filter(item => isVolumeImageUpgradable(item, defaultImage))
      } else if (engineImageUpgradableValue === 'no') {
        volumes = volumes.filter(item => !isVolumeImageUpgradable(item, defaultImage))
      }
    } else if (field && field === 'schedule') {
      if (scheduleValue === 'yes') {
        volumes = volumes.filter(item => isVolumeSchedule(item))
      } else if (scheduleValue === 'no') {
        volumes = volumes.filter(item => !isVolumeSchedule(item))
      }
    } else if (field && field === 'pvStatus') {
      if (pvStatusValue === 'available') {
        volumes = volumes.filter(item => item.kubernetesStatus && item.kubernetesStatus.pvStatus === 'Available')
      } else if (pvStatusValue === 'none') {
        volumes = volumes.filter(item => item.kubernetesStatus && item.kubernetesStatus.pvStatus === '')
      } else if (pvStatusValue === 'bound') {
        volumes = volumes.filter(item => item.kubernetesStatus && item.kubernetesStatus.pvStatus === 'Bound')
      } else if (pvStatusValue === 'released') {
        volumes = volumes.filter(item => item.kubernetesStatus && item.kubernetesStatus.pvStatus === 'Released')
      }
    } else if (field && field === 'namespace' && value) {
      volumes = filterVolume(volumes, field, value)
    } else if (field && field === 'replicaNodeRedundancy' && nodeRedundancyValue) {
      volumes = filterVolume(volumes, field, nodeRedundancyValue)
    } else if (field && value && field !== 'status' && field !== 'engineImageUpgradable' && field !== 'replicaNodeRedundancy') {
      volumes = filterVolume(volumes, field, value)
    } else if (field && field === 'revisionCounter') {
      volumes = volumes.filter(item => {
        // Using string comparison is convenient for uploading values in url
        let flag = item.revisionCounterDisabled ? 'True' : 'False'
        return flag === revisionCounterValue
      })
    }

    const volumeListProps = {
      dataSource: volumes,
      loading,
      engineImages,
      height: this.state.height,
      commandKeyDown: this.state.commandKeyDown,
      replicaSoftAntiAffinitySettingValue,
      engineUpgradePerNodeLimit,
      customColumnList,
      hosts,
      onSorterChange(s) {
        dispatch({
          type: 'volume/updateSorter',
          payload: { field: s.field, order: s.order, columnKey: s.columnKey },
        })
      },
      sorter,
      takeSnapshot(record) {
        dispatch({
          type: 'volume/actions',
          payload: {
            url: record.actions.snapshotCreate,
            params: {
              name: '',
            },
          },
        })
      },
      showVolumeCloneModal(record) {
        dispatch({
          type: 'volume/showCloneVolumeModalBefore',
          payload: {
            selected: record,
            cloneVolumeType: 'volume',
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
      showAttachHost(record) {
        dispatch({
          type: 'volume/showAttachHostModal',
          payload: {
            selected: record,
          },
        })
      },
      showSnapshots: (record) => {
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
          type: 'volume/delete',
          payload: record,
        })
      },
      showDetachHost(record) {
        dispatch({
          type: 'volume/showDetachHostModal',
          payload: {
            selected: record,
            isBulkDetach: false,
          },
        })
      },
      showBackups(record) {
        dispatch(routerRedux.push({
          pathname: `/backup/${record.name}`,
          search: queryString.stringify({
            ...queryString.parse(location.search),
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
      updateSnapshotMaxCount(record) {
        dispatch({
          type: 'volume/showUpdateSnapshotMaxCountModal',
          payload: {
            selected: record,
          },
        })
      },
      updateSnapshotMaxSize(record) {
        dispatch({
          type: 'volume/showUpdateSnapshotMaxSizeModal',
          payload: {
            selected: record,
          },
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
      showUpdateReplicaAutoBalanceModal(record) {
        if (record) {
          dispatch({
            type: 'volume/showUpdateReplicaAutoBalanceModal',
            payload: {
              selectedRows: [record],
            },
          })
        }
      },
      showUpdateFreezeFilesystemForSnapshotModal(record) {
        dispatch({
          type: 'volume/showUpdateFreezeFilesystemForSnapshotModal',
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
      createPVAndPVC(actions) {
        dispatch({
          type: 'volume/showCreatePVCAndPVSingleModal',
          payload: actions,
        })
      },
      showWorkloadsStatusDetail(record) {
        dispatch({
          type: 'volume/showWorkloadDetailModal',
          payload: record,
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
      showRecurringJobModal(record) {
        if (record) {
          dispatch({
            type: 'volume/showRecurringJobModal',
            payload: record,
          })
        }
      },
      changeVolume(record) {
        dispatch({
          type: 'volume/showChangeVolumeModal',
          payload: record.actions.activate,
        })
      },
      onRowClick(record, flag) {
        let selecteRowByClick = [record]

        if (flag) {
          selectedRows.forEach((item) => {
            if (selecteRowByClick.every((ele) => {
              return ele.id !== item.id
            })) {
              selecteRowByClick.push(item)
            } else {
              selecteRowByClick = selecteRowByClick.filter((ele) => {
                return ele.id !== item.id
              })
            }
          })
        }

        dispatch({
          type: 'volume/changeSelection',
          payload: {
            selectedRows: selecteRowByClick,
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
      showUpdateReplicaSoftAntiAffinityModal(record) {
        dispatch({
          type: 'volume/showUpdateReplicaSoftAntiAffinityModal',
          payload: {
            volume: record,
            softAntiAffinityKey: 'updateReplicaSoftAntiAffinity',
          },
        })
      },
      showUpdateReplicaZoneSoftAntiAffinityModal(record) {
        dispatch({
          type: 'volume/showUpdateReplicaSoftAntiAffinityModal',
          payload: {
            volume: record,
            softAntiAffinityKey: 'updateReplicaZoneSoftAntiAffinity',
          },
        })
      },
      showUpdateReplicaDiskSoftAntiAffinityModal(record) {
        dispatch({
          type: 'volume/showUpdateReplicaSoftAntiAffinityModal',
          payload: {
            volume: record,
            softAntiAffinityKey: 'updateReplicaDiskSoftAntiAffinity',
          },
        })
      },
      rowSelection: {
        selectedRowKeys: selectedRows.map(item => item.id),
        onChange(_, records) {
          dispatch({
            type: 'volume/changeSelection',
            payload: {
              selectedRows: records,
            },
          })
        },
      },
    }

    const volumeFilterProps = {
      location,
      stateOption: [
        { value: 'healthy', name: 'Healthy' },
        { value: 'inProgress', name: 'In Progress' },
        { value: 'degraded', name: 'Degraded' },
        { value: 'faulted', name: 'Fault' },
        { value: 'detached', name: 'Detached' },
      ],
      replicaNodeRedundancyOption: [
        { value: 'yes', name: 'Yes' },
        { value: 'limited', name: 'Limited' },
        { value: 'no', name: 'No' },
      ],
      engineImageUpgradableOption: [
        { value: 'yes', name: 'Yes' },
        { value: 'no', name: 'No' },
      ],
      scheduleOption: [
        { value: 'yes', name: 'Yes' },
        { value: 'no', name: 'No' },
      ],
      pvStatusOption: [
        { value: 'none', name: 'None' },
        { value: 'available', name: 'Available' },
        { value: 'bound', name: 'Bound' },
        { value: 'released', name: 'Released' },
      ],
      fieldOption: [
        { value: 'name', name: 'Name' },
        { value: 'host', name: 'Node' },
        { value: 'status', name: 'Status' },
        { value: 'namespace', name: 'Namespace' },
        { value: 'replicaNodeRedundancy', name: 'Node redundancy' },
        { value: 'engineImageUpgradable', name: 'Engine image upgradable' },
        { value: 'pvName', name: 'PV Name' },
        { value: 'pvcName', name: 'PVC Name' },
        { value: 'pvStatus', name: 'PV Status' },
        { value: 'NodeTag', name: 'Node Tag' },
        { value: 'DiskTag', name: 'Disk Tag' },
        { value: 'schedule', name: 'Scheduled' },
        { value: 'revisionCounter', name: 'Revision Counter Disabled' },
      ],
      revisionCounterOption: [
        { value: 'True', name: 'True' },
        { value: 'False', name: 'False' },
      ],
      onSearch(filter) {
        const { field: filterField, value: filterValue, stateValue: filterStateValue, nodeRedundancyValue: redundancyValue, engineImageUpgradableValue: imageUpgradableValue, scheduleValue: schedulePropValue, pvStatusValue: pvStatusPropValue, revisionCounterValue: revisionCounterPropValue } = filter

        filterField && (filterValue || filterStateValue || redundancyValue || imageUpgradableValue || schedulePropValue || pvStatusPropValue || revisionCounterPropValue) ? dispatch(routerRedux.push({
          pathname: '/volume',
          search: queryString.stringify({
            ...queryString.parse(location.search),
            field: filterField,
            value: filterValue,
            stateValue: filterStateValue,
            nodeRedundancyValue: redundancyValue,
            engineImageUpgradableValue: imageUpgradableValue,
            scheduleValue: schedulePropValue,
            pvStatusValue: pvStatusPropValue,
            revisionCounterValue: revisionCounterPropValue,
          }),
        })) : dispatch(routerRedux.push({
          pathname: '/volume',
          search: queryString.stringify({}),
        }))
      },
    }

    const attachHostModalProps = getAttachHostModalProps(selected ? [selected] : [], hosts, attachHostModalVisible, dispatch)

    const bulkAttachHostModalProps = {
      items: selectedRows,
      visible: bulkAttachHostModalVisible,
      hosts,
      onOk(selectedHost, disableFrontend, urls) {
        dispatch({
          type: 'volume/bulkAttach',
          payload: {
            host: selectedHost,
            disableFrontend,
            urls,
          },
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideBulkAttachHostModal',
        })
        dispatch({
          type: 'app/changeBlur',
          payload: false,
        })
      },
    }

    const engineUpgradeModalProps = getEngineUpgradeModalProps(selected ? [selected] : [], engineImages, engineUpgradePerNodeLimit, engineUpgradeModalVisible, dispatch)

    const bulkEngineUpgradeModalProps = getBulkEngineUpgradeModalProps(selectedRows, engineImages, engineUpgradePerNodeLimit, bulkEngineUpgradeModalVisible, dispatch)

    const salvageModalProps = {
      item: selected,
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

    const WorkloadDetailModalProps = {
      visible: WorkloadDetailModalVisible,
      item: WorkloadDetailModalItem,
      onOk() {
        dispatch({ type: 'volume/hideWorkloadDetailModal' })
      },
      onCancel() {
        dispatch({ type: 'volume/hideWorkloadDetailModal' })
      },
    }

    const recurringJobModalProps = {
      visible: recurringJobModalVisible,
      selectedVolume: selected,
      volumeRecurringJobs,
      recurringJobData,
      loading,
      dispatch,
      onCancel() {
        dispatch({ type: 'volume/hideRecurringJobModal' })
      },
      onOk() {
        dispatch({ type: 'volume/hideRecurringJobModal' })
      },
    }

    const createVolumeModalProps = {
      item: {
        numberOfReplicas: defaultNumberOfReplicas,
        size: 20,
        iops: 1000,
        unit: 'Gi',
        frontend: 'iscsi',
        diskSelector: [],
        nodeSelector: [],
      },
      volumeOptions: volumes,
      snapshotsOptions,
      nodeTags,
      defaultDataLocalityOption,
      defaultDataLocalityValue,
      defaultRevisionCounterValue,
      defaultSnapshotDataIntegrityOption,
      v1DataEngineEnabled,
      v2DataEngineEnabled,
      diskTags,
      backingImageOptions,
      tagsLoading,
      hosts,
      visible: createVolumeModalVisible,
      getSnapshot: (volume) => {
        dispatch({
          type: 'volume/getSingleVolumeSnapshots',
          payload: volume,
        })
      },
      onOk(newVolume) {
        dispatch({
          type: 'volume/create',
          payload: newVolume,
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideCreateVolumeModal',
        })
        dispatch({
          type: 'app/changeBlur',
          payload: false,
        })
      },
    }

    const expansionVolumeSizeModalProps = {
      item: {
        unit: 'Gi',
      },
      hosts,
      visible: expansionVolumeSizeModalVisible,
      selected,
      onOk(params) {
        dispatch({
          type: 'volume/expandVolume',
          payload: {
            params,
            selected,
          },
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideExpansionVolumeSizeModal',
        })
      },
    }

    const bulkExpansionVolumeSizeModalProps = {
      item: {
        unit: 'Gi',
      },
      hosts,
      visible: bulkExpandVolumeModalVisible,
      selected: bulkExpandVolumeModalVisible && selectedRows && selectedRows.length > 0 ? selectedRows.reduce((p, v) => { return parseInt(p.size, 10) < parseInt(v.size, 10) ? v : p }) : '',
      onOk(params) {
        dispatch({
          type: 'volume/bulkExpandVolume',
          payload: {
            params,
            selectedRows,
          },
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideBulkExpansionVolumeSizeModal',
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

    const bulkChangeVolumeModalProps = {
      items: selectedRows,
      visible: bulkChangeVolumeModalVisible,
      onOk(newVolume, items) {
        let volumeData = items.map((item) => ({
          ...newVolume,
          url: item.actions.activate,
        }))
        dispatch({
          type: 'volume/bulkVolumeActivate',
          payload: volumeData,
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideBulkChangeVolumeModal',
        })
      },
    }
    const bulkCloneVolumeModalProps = {
      selectedRows: selectedRows.filter(item => !item.standby && !isRestoring(item)), // filter out standby and restoring volumes
      visible: bulkCloneVolumeVisible,
      diskTags,
      nodeTags,
      tagsLoading,
      v1DataEngineEnabled,
      v2DataEngineEnabled,
      defaultDataLocalityOption,
      defaultDataLocalityValue,
      backingImageOptions,
      onOk(params) {
        dispatch({
          type: 'volume/bulkCloneVolume',
          payload: params,
        })
      },
      onCancel() {
        dispatch({ type: 'volume/hideBulkCloneVolume' })
      },
    }

    const createPVAndPVCProps = {
      item: defaultNamespace,
      visible: createPVAndPVCVisible,
      nameSpaceDisabled,
      selectedRows,
      previousChecked,
      onOk(params) {
        dispatch({
          type: 'volume/createPVAndPVC',
          payload: {
            action: selectedRows,
            params,
          },
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideCreatePVAndPVCModal',
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

    const createPVAndPVCSingleProps = {
      item: {
        defaultPVName,
        defaultPVCName,
        previousNamespace,
        pvNameDisabled,
        accessMode: selected && selected.accessMode ? selected.accessMode : 'rwo',
        encrypted: selected && selected.encrypted,
      },
      selected: selected && selected.kubernetesStatus ? selected.kubernetesStatus : {},
      visible: createPVAndPVCSingleVisible,
      nameSpaceDisabled,
      previousChecked,
      onOk(params) {
        dispatch({
          type: 'volume/createPVAndPVCSingle',
          payload: {
            selectedVolume: selected,
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

    const volumeBulkActionsProps = {
      selectedRows,
      engineImages,
      engineUpgradePerNodeLimit,
      commandKeyDown: this.state.commandKeyDown,
      // For create backup
      backupTargetAvailable,
      backupTargetMessage,
      bulkDeleteVolume() {
        dispatch({
          type: 'volume/bulkDelete',
          payload: selectedRows,
        })
      },
      showBulkEngineUpgrade() {
        dispatch({
          type: 'volume/showBulkEngineUpgradeModal',
        })
      },
      showBulkChangeVolume() {
        dispatch({
          type: 'volume/showBulkChangeVolumeModal',
        })
      },
      showBulkAttachHost() {
        dispatch({
          type: 'volume/showBulkAttachHostModal',
        })
      },
      showBulkDetachHost() {
        dispatch({
          type: 'volume/showDetachHostModal',
          payload: {
            isBulkDetach: true,
          },
        })
      },
      bulkBackup(actions) {
        me.setState({
          ...me.state,
          createBackModalKey: Math.random(),
          createBackModalVisible: true,
          selectedRows: actions,
        })
      },
      showBulkCloneVolume(record) {
        dispatch({
          type: 'volume/showBulkCloneVolumeModalBefore',
          payload: {
            selectedRows: record,
          },
        })
      },
      bulkExpandVolume(actions) {
        dispatch({ type: 'volume/showBulkExpandVolumeModal', payload: actions })
      },
      createPVAndPVC(actions) {
        dispatch({
          type: 'volume/showCreatePVAndPVCModal',
          payload: actions,
        })
      },
      showUpdateBulkReplicaCount(record) {
        dispatch({
          type: 'volume/showUpdateBulkReplicaCountModal',
          payload: {
            selectedRows: record,
          },
        })
      },
      showUpdateBulkDataLocality(record) {
        dispatch({
          type: 'volume/showUpdateBulkDataLocalityModal',
          payload: {
            selectedRows: record,
          },
        })
      },
      showUpdateBulkSnapshotDataIntegrityModal(record) {
        dispatch({
          type: 'volume/showUpdateBulkSnapshotDataIntegrityModal',
          payload: {
            selectedRows: record,
          },
        })
      },
      showUpdateBulkAccessMode(record) {
        dispatch({
          type: 'volume/showUpdateBulkAccessModeModal',
          payload: {
            selectedRows: record,
          },
        })
      },
      showUpdateReplicaAutoBalanceModal(record) {
        dispatch({
          type: 'volume/showUpdateReplicaAutoBalanceModal',
          payload: {
            selectedRows: record,
          },
        })
      },
      showBulkUnmapMarkSnapChainRemovedModal(record) {
        dispatch({
          type: 'volume/showBulkUnmapMarkSnapChainRemovedModal',
          payload: {
            selectedRows: record,
          },
        })
      },
      showUpdateReplicaSoftAntiAffinityModal(record) {
        dispatch({
          type: 'volume/showBulkUpdateReplicaSoftAntiAffinityModal',
          payload: {
            volumes: record,
            softAntiAffinityKey: 'updateBulkReplicaSoftAntiAffinity',
          },
        })
      },
      showUpdateReplicaZoneSoftAntiAffinityModal(record) {
        dispatch({
          type: 'volume/showBulkUpdateReplicaSoftAntiAffinityModal',
          payload: {
            volumes: record,
            softAntiAffinityKey: 'updateBulkReplicaZoneSoftAntiAffinity',
          },
        })
      },
      showUpdateReplicaDiskSoftAntiAffinityModal(record) {
        dispatch({
          type: 'volume/showBulkUpdateReplicaSoftAntiAffinityModal',
          payload: {
            volumes: record,
            softAntiAffinityKey: 'updateBulkReplicaDiskSoftAntiAffinity',
          },
        })
      },
      trimBulkFilesystem(record) {
        if (record?.length > 0) {
          dispatch({
            type: 'volume/trimBulkFilesystem',
            payload: {
              urls: record.map((item) => item?.actions?.trimFilesystem),
            },
          })
        }
      },
      showUpdateBulkFreezeFilesystemForSnapshotModal(record) {
        dispatch({
          type: 'volume/showUpdateBulkFreezeFilesystemForSnapshotModal',
          payload: {
            selectedRows: record,
          },
        })
      },
    }

    const createBackModalProps = {
      item: {
        frontend: 'iscsi',
      },
      visible: me.state.createBackModalVisible,
      onOk(obj) {
        dispatch({
          type: 'volume/bulkBackup',
          payload: {
            actions: me.state.selectedRows.map(item => { return { snapshotCreateUrl: item.actions.snapshotCreate, snapshotBackupUrl: item.actions.snapshotBackup } }),
            ...obj,
          },
        })
        me.setState({
          ...me.state,
          createBackModalKey: Math.random(),
          createBackModalVisible: false,
        })
      },
      onCancel() {
        me.setState({
          ...me.state,
          createBackModalKey: Math.random(),
          createBackModalVisible: false,
        })
      },
    }

    const volumeCloneModalProps = {
      cloneType: cloneVolumeType,
      volume: selected,
      visible: volumeCloneModalVisible,
      diskTags,
      nodeTags,
      tagsLoading,
      v1DataEngineEnabled,
      v2DataEngineEnabled,
      defaultDataLocalityOption,
      defaultDataLocalityValue,
      backingImageOptions,
      onOk(volume) {
        if (volume) {
          dispatch({
            type: 'volume/createClonedVolume',
            payload: volume,
          })
        }
      },
      onCancel() {
        dispatch({
          type: 'volume/hideCloneVolumeModal',
        })
      },
    }

    const addVolume = () => {
      dispatch({
        type: 'volume/showCreateVolumeModalBefore',
        payload: volumes,
      })
    }

    const customColumn = () => {
      dispatch({
        type: 'volume/showCustomColumnModal',
      })
    }

    const customColumnModalProps = {
      columns: customColumnList,
      visible: customColumnVisible,
      engineImages,
      onOk(columns) {
        dispatch({
          type: 'volume/changeColumns',
          payload: columns,
        })
        dispatch({
          type: 'volume/hideCustomColumnModal',
        })
      },
      onCancel() {
        dispatch({
          type: 'volume/hideCustomColumnModal',
        })
      },
    }

    const updateReplicaSoftAntiAffinityModalProps = getUpdateReplicaSoftAntiAffinityModalProps(selected, selectedRows, updateReplicaSoftAntiAffinityVisible, softAntiAffinityKey, dispatch)
    const updateReplicaCountModalProps = getUpdateReplicaCountModalProps(selected, updateReplicaCountModalVisible, dispatch)
    const updateBulKReplicaCountModalProps = getUpdateBulkReplicaCountModalProps(selectedRows, updateBulkReplicaCountModalVisible, dispatch)
    const updateDataLocalityModalProps = getUpdateDataLocalityModalProps(selected, updateDataLocalityModalVisible, defaultDataLocalityOption, dispatch)
    const updateSnapshotMaxCountModalProps = getUpdateSnapshotMaxCountModalProps(selected, updateSnapshotMaxCountModalVisible, dispatch)
    const updateSnapshotMaxSizeModalProps = getUpdateSnapshotMaxSizeModalProps(selected, updateSnapshotMaxSizeModalVisible, dispatch)
    const updateSnapshotDataIntegrityModalProps = getUpdateSnapshotDataIntegrityProps(selected, updateSnapshotDataIntegrityModalVisible, defaultSnapshotDataIntegrityOption, dispatch)
    const updateBulkSnapshotDataIntegrityModalProps = getUpdateBulkSnapshotDataIntegrityModalProps(selectedRows, updateBulkSnapshotDataIntegrityModalVisible, defaultSnapshotDataIntegrityOption, dispatch)
    const updateBulkDataLocalityModalProps = getUpdateBulkDataLocalityModalProps(selectedRows, updateBulkDataLocalityModalVisible, defaultDataLocalityOption, dispatch)
    const updateAccessModeModalProps = getUpdateAccessModeModalProps(selected, updateAccessModeModalVisible, dispatch)
    const updateBulkAccessModeModalProps = getUpdateBulkAccessModeModalProps(selectedRows, updateBulkAccessModeModalVisible, dispatch)
    const updateReplicaAutoBalanceModalProps = getUpdateReplicaAutoBalanceModalProps(selectedRows, updateReplicaAutoBalanceModalVisible, dispatch)
    const unmapMarkSnapChainRemovedModalProps = getUnmapMarkSnapChainRemovedModalProps(selected, unmapMarkSnapChainRemovedModalVisible, dispatch)
    const bulkUnmapMarkSnapChainRemovedModalProps = getBulkUnmapMarkSnapChainRemovedModalProps(selectedRows, bulkUnmapMarkSnapChainRemovedModalVisible, dispatch)
    const updateFreezeFilesystemForSnapshotModalProps = getUpdateFreezeFilesystemForSnapshotModalProps(selected, updateFreezeFilesystemForSnapshotModalVisible, dispatch)
    const updateBulkFreezeFilesystemForSnapshotModalProps = getUpdateBulkFreezeFilesystemForSnapshotModalProps(selectedRows, updateBulkFreezeFilesystemForSnapshotModalVisible, dispatch)
    const detachHostModalProps = getDetachHostModalProps(!isBulkDetach && selected ? [selected] : selectedRows, detachHostModalVisible, dispatch)

    return (
      <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
        <Row gutter={24}>
          <Col lg={17} md={15} sm={24} xs={24}>
            <VolumeBulkActions {...volumeBulkActionsProps} />
          </Col>
          <Col lg={7} md={9} sm={24} xs={24}>
            <Filter {...volumeFilterProps} />
          </Col>
        </Row>
        <Button className="out-container-button" size="large" type="primary" onClick={addVolume}>Create Volume</Button>
        <Button style={{ position: 'absolute', top: '-46px', right: '150px' }} size="large" type="primary" onClick={customColumn}>Custom Column</Button>
        <VolumeList {...volumeListProps} />
        {WorkloadDetailModalVisible ? <WorkloadDetailModal key={WorkloadDetailModalKey} {...WorkloadDetailModalProps} /> : ''}
        {recurringJobModalVisible ? <RecurringJobModal key={recurringJobModalKey} {...recurringJobModalProps} /> : ''}
        {changeVolumeModalVisible ? <ChangeVolumeModal key={changeVolumeModalKey} {...changeVolumeModalProps} /> : ''}
        {bulkCloneVolumeVisible ? <BulkCloneVolumeModal {...bulkCloneVolumeModalProps} /> : ''}
        {bulkChangeVolumeModalVisible ? <BulkChangeVolumeModal key={bulkChangeVolumeModalKey} {...bulkChangeVolumeModalProps} /> : ''}
        {expansionVolumeSizeModalVisible ? <ExpansionVolumeSizeModal key={expansionVolumeSizeModalKey} {...expansionVolumeSizeModalProps} /> : ''}
        {bulkExpandVolumeModalVisible ? <ExpansionVolumeSizeModal key={bulkExpandVolumeModalKey} {...bulkExpansionVolumeSizeModalProps} /> : '' }
        {createVolumeModalVisible ? <CreateVolume key={createVolumeModalKey} {...createVolumeModalProps} /> : ''}
        {customColumnVisible ? <CustomColumn key={customColumnKey} {...customColumnModalProps} /> : ''}
        {createPVAndPVCVisible ? <CreatePVAndPVC key={createPVAndPVCModalKey} {...createPVAndPVCProps} /> : ''}
        {createPVAndPVCSingleVisible ? <CreatePVAndPVCSingle key={createPVAndPVCModalSingleKey} {...createPVAndPVCSingleProps} /> : ''}
        {attachHostModalVisible ? <AttachHost key={attachHostModalKey} {...attachHostModalProps} /> : ''}
        {bulkAttachHostModalVisible ? <AttachHost key={bulkAttachHostModalKey} {...bulkAttachHostModalProps} /> : ''}
        {detachHostModalVisible ? <DetachHost key={detachHostModalKey} {...detachHostModalProps} /> : ''}
        {engineUpgradeModalVisible ? <EngineUgrade key={engineUpgradeModaKey} {...engineUpgradeModalProps} /> : ''}
        {bulkEngineUpgradeModalVisible ? <EngineUgrade key={bulkEngineUpgradeModalKey} {...bulkEngineUpgradeModalProps} /> : ''}
        {volumeCloneModalVisible ? <CloneVolume key={volumeCloneModalKey} {...volumeCloneModalProps} /> : ''}
        {salvageModalVisible ? <Salvage {...salvageModalProps} /> : ''}
        {updateReplicaCountModalVisible ? <UpdateReplicaCount key={updateReplicaCountModalKey} {...updateReplicaCountModalProps} /> : ''}
        {updateBulkReplicaCountModalVisible ? <UpdateBulkReplicaCount key={updateBulkReplicaCountModalKey} {...updateBulKReplicaCountModalProps} /> : ''}
        {updateDataLocalityModalVisible ? <UpdateDataLocality key={updateDataLocalityModalKey} {...updateDataLocalityModalProps} /> : '' }
        {updateSnapshotMaxCountModalVisible ? <UpdateSnapshotMaxCountModal {...updateSnapshotMaxCountModalProps} /> : '' }
        {updateSnapshotMaxSizeModalVisible ? <UpdateSnapshotMaxSizeModal {...updateSnapshotMaxSizeModalProps} /> : '' }
        {updateBulkDataLocalityModalVisible ? <UpdateBulkDataLocality key={updateBulkDataLocalityModalKey} {...updateBulkDataLocalityModalProps} /> : ''}
        {updateAccessModeModalVisible ? <UpdateAccessMode key={updateAccessModeModalKey} {...updateAccessModeModalProps} /> : ''}
        {updateBulkAccessModeModalVisible ? <UpdateBulkAccessMode key={updateBulkAccessModeModalKey} {...updateBulkAccessModeModalProps} /> : ''}
        {updateReplicaAutoBalanceModalVisible ? <UpdateReplicaAutoBalanceModal key={updateReplicaAutoBalanceModalKey} {...updateReplicaAutoBalanceModalProps} /> : ''}
        {unmapMarkSnapChainRemovedModalVisible ? <UpdateUnmapMarkSnapChainRemovedModal key={unmapMarkSnapChainRemovedModalKey} {...unmapMarkSnapChainRemovedModalProps} /> : ''}
        {bulkUnmapMarkSnapChainRemovedModalVisible ? <UpdateBulkUnmapMarkSnapChainRemovedModal key={bulkUnmapMarkSnapChainRemovedModalKey} {...bulkUnmapMarkSnapChainRemovedModalProps} /> : ''}
        {updateSnapshotDataIntegrityModalVisible ? <UpdateSnapshotDataIntegrityModal key={updateSnapshotDataIntegrityModalKey} {...updateSnapshotDataIntegrityModalProps} /> : ''}
        {updateBulkSnapshotDataIntegrityModalVisible ? <UpdateBulkSnapshotDataIntegrityModal key={updateBulkSnapshotDataIntegrityModalKey} {...updateBulkSnapshotDataIntegrityModalProps} /> : ''}
        {updateReplicaSoftAntiAffinityVisible ? <CommonModal key={updateReplicaSoftAntiAffinityModalKey} {...updateReplicaSoftAntiAffinityModalProps} /> : ''}
        {updateFreezeFilesystemForSnapshotModalVisible ? <UpdateFreezeFilesystemForSnapshotModal key={updateFreezeFilesystemForSnapshotModalKey} {...updateFreezeFilesystemForSnapshotModalProps} /> : ''}
        {updateBulkFreezeFilesystemForSnapshotModalVisible ? <UpdateBulkFreezeFilesystemForSnapshotModal key={updateBulkFreezeFilesystemForSnapshotModalKey} {...updateBulkFreezeFilesystemForSnapshotModalProps} /> : ''}
        {me.state.createBackModalVisible ? <CreateBackupModal key={me.state.createBackModalKey} {...createBackModalProps} /> : ''}
      </div>
    )
  }
}

Volume.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  host: PropTypes.object,
  backup: PropTypes.object,
  engineimage: PropTypes.object,
  recurringJob: PropTypes.object,
  setting: PropTypes.object,
  backingImage: PropTypes.object,
  snapshotModal: PropTypes.object,
}

export default connect(({ snapshotModal, engineimage, host, volume, setting, backingImage, backup, recurringJob, loading }) => ({ snapshotModal, engineimage, host, volume, setting, backingImage, backup, recurringJob, loading: loading.models.volume }))(Volume)
