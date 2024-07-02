import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { Row, Col, Modal, Descriptions } from 'antd'
import BackupVolumeList from './BackupVolumeList'
import queryString from 'query-string'
import RestoreBackupModal from './RestoreBackupModal'
import BulkRestoreBackupModal from './BulkRestoreBackupModal'
import CreateStandbyVolumeModal from './CreateStandbyVolumeModal'
import BulkCreateStandbyVolumeModal from './BulkCreateStandbyVolumeModal'

import { Filter } from '../../components/index'
import BackupBulkActions from './BackupBulkActions'
import WorkloadDetailModal from '../volume/WorkloadDetailModal'

const { confirm, info } = Modal

function Backup({ backup, loading, setting, backingImage, dispatch, location }) {
  location.search = location.search ? location.search : ''
  // currentItem || currentBackupVolume. The currentItem was a wrong decision at the beginning of the design. It was originally to simplify the transfer of attributes without complete assignment.
  // When backup supports ws, currentItem will be refactored to currentBackupVolume
  const { backupVolumes, sorter, backupFilterKey, currentItem, restoreBackupModalKey, createVolumeStandModalKey, bulkCreateVolumeStandModalKey, createVolumeStandModalVisible, bulkCreateVolumeStandModalVisible, lastBackupUrl, size, restoreBackupModalVisible, selectedRows, previousChecked, tagsLoading, nodeTags, diskTags, volumeName, backupVolumesForBulkCreate, workloadDetailModalVisible, WorkloadDetailModalKey, workloadDetailModalItem, currentBackupVolume } = backup
  console.log('🚀 ~ Backup ~ backupVolumes:', backupVolumes)

  const settings = setting.data
  const backingImages = backingImage.data
  const defaultReplicaCountSetting = settings.find(s => s.id === 'default-replica-count')
  const defaultNumberOfReplicas = defaultReplicaCountSetting !== undefined ? parseInt(defaultReplicaCountSetting.value, 10) : 3
  const v1DataEngineEnabledSetting = settings.find(s => s.id === 'v1-data-engine')
  const v2DataEngineEnabledSetting = settings.find(s => s.id === 'v2-data-engine')
  const v1DataEngineEnabled = v1DataEngineEnabledSetting?.value === 'true'
  const v2DataEngineEnabled = v2DataEngineEnabledSetting?.value === 'true'
  const showDeleteConfirm = (record) => {
    confirm({
      title: 'Are you sure delete all the backups?',
      content: 'If there is backup restore process in progress using the backups of this volume (including DR volumes), deleting the backup volume will result in restore failure and the volume in the restore process will become FAULTED. Are you sure you want to delete this backup volume?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        dispatch({
          type: 'backup/deleteAllBackups',
          payload: record.id,
        })
      },
    })
  }
  const showBackingImageInfo = (record) => {
    let content = record.backingImageName || record.backingImageURL ? (<Descriptions title="" bordered>
      <Descriptions.Item label={<div style={{ width: '150px' }}>Backing Image Name</div>} span={3}><div style={{ width: '280px' }}>{record.backingImageName}</div></Descriptions.Item>
      <Descriptions.Item label={<div style={{ width: '150px' }}>Backing Image Checksum</div>} span={3}><div style={{ width: '280px' }}>{record.backingImageChecksum}</div></Descriptions.Item>
    </Descriptions>) : (<div style={{ textAlign: 'center' }}>No Data</div>)
    info({
      title: 'Backing Image Info',
      content,
      okText: 'OK',
      width: 860,
    })
  }
  const backupVolumesProps = {
    backup: backupVolumes,
    search: location.search,
    loading,
    dispatch,
    onSorterChange(s) {
      dispatch({
        type: 'backup/updateSorter',
        payload: { field: s.field, order: s.order, columnKey: s.columnKey },
      })
    },
    Create(record) { // to create DR volume
      dispatch({
        type: 'backup/CreateStandVolume',
        payload: record,
      })
    },
    DeleteAllBackups(record) {
      // dispatch({
      //   type: 'backup/CreateStandVolume',
      //   payload: record,
      // })
      showDeleteConfirm(record)
    },
    showBackingImageInfo(record) {
      showBackingImageInfo(record)
    },
    syncBackupVolume(record) {
      dispatch({
        type: 'backup/syncBackupVolume',
        payload: record,
      })
    },
    restoreLatestBackup(record) {
      dispatch({
        type: 'backup/restoreLatestBackup',
        payload: {
          url: record.actions.backupList,
          lastBackupName: record.lastBackupName,
          numberOfReplicas: defaultNumberOfReplicas,
          backingImage: record.backingImageName,
        },
      })
    },
    showWorkloadsStatusDetail(record) {
      dispatch({
        type: 'backup/showWorkloadDetailModal',
        payload: record,
      })
    },
    onRowClick(record, flag) {
      let selectedRowByClick = [record]
      if (flag) {
        selectedRows.forEach((item) => {
          if (selectedRowByClick.every((ele) => {
            return ele.id !== item.id
          })) {
            selectedRowByClick.push(item)
          } else {
            selectedRowByClick = selectedRowByClick.filter((ele) => {
              return ele.id !== item.id
            })
          }
        })
      }

      dispatch({
        type: 'backup/changeSelection',
        payload: {
          selectedRows: selectedRowByClick,
        },
      })
    },
    rowSelection: {
      selectedRowKeys: selectedRows.map(item => item.id),
      onChange(_, records) {
        dispatch({
          type: 'backup/changeSelection',
          payload: {
            selectedRows: records,
          },
        })
      },
    },
    sorter,
  }

  const volumeFilterProps = {
    location,
    fieldOption: [
      { value: 'name', name: 'Name' },
    ],
    onSearch(filter) {
      const { field: filterField, value: filterValue } = filter
      filter && filterField && filterValue ? dispatch(routerRedux.push({
        pathname: '/backup',
        search: queryString.stringify({
          ...queryString.parse(location.search),
          field: filterField,
          value: filterValue,
        }),
      })) : dispatch(routerRedux.push({
        pathname: '/backup',
        search: queryString.stringify({}),
      }))
    },
  }

  const bulkRestoreBackupModalProps = {
    items: currentItem,
    tagsLoading,
    nodeTags,
    diskTags,
    backingImages,
    backupVolumes,
    v1DataEngineEnabled,
    v2DataEngineEnabled,
    visible: restoreBackupModalVisible,
    onOk(selectedBackupConfigs) {
      dispatch({
        type: 'backup/restoreBulkBackup',
        payload: selectedBackupConfigs,
      })
    },
    onCancel() {
      dispatch({
        type: 'backup/hideRestoreBackupModal',
      })
    },
  }

  const restoreBackupModalProps = {
    item: currentItem[0] || {},
    tagsLoading,
    nodeTags,
    diskTags,
    backingImages,
    previousChecked,
    backupVolumes,
    v1DataEngineEnabled,
    v2DataEngineEnabled,
    visible: restoreBackupModalVisible,
    onOk(selectedBackup) {
      dispatch({
        type: 'backup/restore',
        payload: selectedBackup,
      })
    },
    setPreviousChange(checked) {
      dispatch({
        type: 'backup/setPreviousChange',
        payload: checked,
      })
    },
    onCancel() {
      dispatch({
        type: 'backup/hideRestoreBackupModal',
      })
    },
  }

  const backupBulkActionsProps = {
    selectedRows,
    backupVolumes,
    restoreLatestBackup() {
      dispatch({
        type: 'backup/queryBackupDetailBulkData',
        payload: {
          selectedRows,
          numberOfReplicas: defaultNumberOfReplicas,
        },
      })
    },
    showBulkCreateDisasterRecoveryVolume() {
      dispatch({
        type: 'backup/BulkCreateStandVolume',
        payload: {
          backupVolume: selectedRows,
        },
      })
    },
    syncAllBackupVolumes() {
      dispatch({
        type: 'backup/syncAllBackupVolumes',
      })
    },
  }

  const createVolumeStandModalProps = {
    item: {
      numberOfReplicas: defaultNumberOfReplicas,
      size,
      fromBackup: lastBackupUrl,
      name: volumeName,
      backingImage: currentBackupVolume?.backingImageName || '',
    },
    visible: createVolumeStandModalVisible,
    nodeTags,
    diskTags,
    tagsLoading,
    backingImages,
    backupVolumes,
    v1DataEngineEnabled,
    v2DataEngineEnabled,
    onOk(newVolume) {
      let data = Object.assign(newVolume, { standby: true, frontend: '' })
      data.size = data.size.replace(/\s/ig, '')
      dispatch({
        type: 'backup/createVolume',
        payload: data,
      })
    },
    onCancel() {
      dispatch({
        type: 'backup/hideCreateVolumeStandModalVisible',
      })
    },
  }

  const bulkCreateVolumeStandModalProps = {
    items: backupVolumesForBulkCreate.map((item) => ({
      size: item.size,
      fromBackup: item.lastBackupUrl,
      volumeName: item.volumeName,
      backingImage: item.backingImage,
    })),
    numberOfReplicas: defaultNumberOfReplicas,
    visible: bulkCreateVolumeStandModalVisible,
    nodeTags,
    diskTags,
    tagsLoading,
    backupVolumes,
    backingImages,
    v1DataEngineEnabled,
    v2DataEngineEnabled,
    onOk(drVolumeConfigs) {
      dispatch({
        type: 'backup/bulkCreateVolume',
        payload: drVolumeConfigs,
      })
    },
    onCancel() {
      dispatch({
        type: 'backup/hideBulkCreateVolumeStandModalVisible',
      })
    },
  }

  const workloadDetailModalProps = {
    visible: workloadDetailModalVisible,
    item: workloadDetailModalItem,
    onOk() {
      dispatch({ type: 'backup/hideWorkloadDetailModal' })
    },
    onCancel() {
      dispatch({ type: 'backup/hideWorkloadDetailModal' })
    },
  }

  return (
    <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
      <Row gutter={24}>
        <Col lg={18} md={16} sm={24} xs={24}>
          <BackupBulkActions {...backupBulkActionsProps} />
        </Col>
        <Col lg={6} md={8} sm={24} xs={24}>
          <Filter key={backupFilterKey} {...volumeFilterProps} />
        </Col>
      </Row>
      <BackupVolumeList {...backupVolumesProps} />
      { restoreBackupModalVisible && currentItem.length === 1 && <RestoreBackupModal key={restoreBackupModalKey} {...restoreBackupModalProps} />}
      { restoreBackupModalVisible && currentItem.length > 1 && <BulkRestoreBackupModal key={restoreBackupModalKey} {...bulkRestoreBackupModalProps} />}
      { createVolumeStandModalVisible ? <CreateStandbyVolumeModal key={createVolumeStandModalKey} {...createVolumeStandModalProps} /> : ''}
      { bulkCreateVolumeStandModalVisible ? <BulkCreateStandbyVolumeModal key={bulkCreateVolumeStandModalKey} {...bulkCreateVolumeStandModalProps} /> : ''}
      { workloadDetailModalVisible ? <WorkloadDetailModal key={WorkloadDetailModalKey} {...workloadDetailModalProps} /> : ''}
    </div>
  )
}

Backup.propTypes = {
  backup: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  setting: PropTypes.object,
  backingImage: PropTypes.object,
  nodeTags: PropTypes.array,
  diskTags: PropTypes.array,
  tagsLoading: PropTypes.bool,
}

export default connect(({ backup, setting, backingImage, loading }) => ({ backup, setting, backingImage, loading: loading.models.backup }))(Backup)
