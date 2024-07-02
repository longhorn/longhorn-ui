import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import queryString from 'query-string'
import { Modal } from 'antd'
import RestoreBackupModal from './RestoreBackupModal'
import { DropOption } from '../../components'
import BackupList from './BackupList'
import { sortBackups } from '../../utils/sort'
import ShowBackupLabels from './ShowBackupLabels'
import CreateStandbyVolumeModal from './CreateStandbyVolumeModal'
import WorkloadDetailModal from '../volume/WorkloadDetailModal'

const { confirm } = Modal

function Backup({ backup, volume, setting, backingImage, loading, location, dispatch }) {
  const { backupVolumes, backupData, restoreBackupModalVisible, restoreBackupModalKey, currentItem, sorter, showBackupLabelsModalKey, backupLabel, showBackuplabelsModalVisible, createVolumeStandModalKey, createVolumeStandModalVisible, baseImage, size, lastBackupUrl, workloadDetailModalVisible, workloadDetailModalItem, workloadDetailModalKey, previousChecked, tagsLoading, nodeTags, diskTags } = backup
  console.log('🚀 ~ Backup details ~ backupData:', backupData)
  const volumeList = volume.data
  const settings = setting.data
  const backingImages = backingImage.data
  const defaultReplicaCountSetting = settings.find(s => s.id === 'default-replica-count')
  const defaultNumberOfReplicas = defaultReplicaCountSetting !== undefined ? parseInt(defaultReplicaCountSetting.value, 10) : 3
  const volumeName = queryString.parse(location.search).keyword
  const currentBackUp = backupVolumes.find((item) => { return item.id === volumeName })
  const v1DataEngineEnabledSetting = settings.find(s => s.id === 'v1-data-engine')
  const v2DataEngineEnabledSetting = settings.find(s => s.id === 'v2-data-engine')
  const v1DataEngineEnabled = v1DataEngineEnabledSetting?.value === 'true'
  const v2DataEngineEnabled = v2DataEngineEnabledSetting?.value === 'true'
  sortBackups(backupData)

  const backupProps = {
    backup: backupData,
    volumeList,
    loading,
    dispatch,
    onSorterChange(s) {
      dispatch({
        type: 'backup/updateSorter',
        payload: { field: s.field, order: s.order, columnKey: s.columnKey },
      })
    },
    sorter,
    showRestoreBackup(record) {
      let currentVolume = volumeList.find((item) => record.volumeName === item.name)
      dispatch({
        type: 'backup/beforeShowRestoreBackupModal',
        payload: {
          currentItem: {
            backupName: record.id,
            fromBackup: record.url,
            numberOfReplicas: defaultNumberOfReplicas,
            volumeName: record.volumeName,
            accessMode: currentVolume && currentVolume.accessMode ? currentVolume.accessMode : 'rwo',
            backingImage: currentBackUp.backingImageName,
          },
        },
      })
    },
    deleteBackup(record, listUrl) {
      dispatch({
        type: 'backup/delete',
        payload: {
          volumeName,
          name: record.id,
          listUrl,
          ...queryString.parse(location.search),
        },
      })
    },
    showBackupLabels(record) {
      if (record) {
        dispatch({ type: 'backup/showBackuplabelsModalVisible', payload: record })
      }
    },
    showWorkloadsStatusDetail(record) {
      dispatch({
        type: 'backup/showWorkloadDetailModal',
        payload: record,
      })
    },
  }

  const restoreBackupModalProps = {
    item: currentItem,
    previousChecked,
    tagsLoading,
    nodeTags,
    diskTags,
    backupVolumes,
    backingImages,
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

  const showBackupLabelsModalProps = {
    item: backupLabel,
    visible: showBackuplabelsModalVisible,
    onOk() {
      dispatch({
        type: 'backup/hideBackuplabelsModalVisible',
      })
    },
    onCancel() {
      dispatch({
        type: 'backup/hideBackuplabelsModalVisible',
      })
    },
  }

  const showDeleteConfirm = () => {
    confirm({
      title: 'Are you sure delete all the backups?',
      content: 'If there is backup restore process in progress using the backups of this volume (including DR volumes), deleting the backup volume will result in restore failure and the volume in the restore process will become FAULTED. Are you sure you want to delete this backup volume?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        dispatch({
          type: 'backup/deleteAllBackups',
          payload: volumeName,
        })
      },
    })
  }

  const createVolumeStandModalProps = {
    item: {
      numberOfReplicas: defaultNumberOfReplicas,
      size,
      iops: 1000,
      baseImage,
      fromBackup: lastBackupUrl,
      backingImage: currentBackUp ? currentBackUp.backingImageName : '',
    },
    nodeTags,
    diskTags,
    tagsLoading,
    visible: createVolumeStandModalVisible,
    backingImages,
    v1DataEngineEnabled,
    v2DataEngineEnabled,
    onOk(newVolume) {
      let obj = Object.assign(newVolume, { standby: true, frontend: '' })
      obj.size = obj.size.replace(/\s/ig, '')
      dispatch({
        type: 'backup/createVolume',
        payload: obj,
      })
    },
    onCancel() {
      dispatch({
        type: 'backup/hideCreateVolumeStandModalVisible',
      })
    },
  }

  const handleMenuClick = (record, e) => {
    if (e.key === 'recovery') {
      dispatch({
        type: 'backup/CreateStandVolume',
        payload: record,
      })
    } else if (e.key === 'deleteAll') {
      showDeleteConfirm(record)
    }
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
      <div style={{ position: 'absolute', top: '-50px', right: '20px', display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
        <DropOption
          menuOptions={[
            { key: 'recovery', name: 'Create Disaster Recovery Volume', disabled: currentBackUp && !currentBackUp.lastBackupName },
            { key: 'deleteAll', name: 'Delete All Backups' },
          ]}
          onMenuClick={e => handleMenuClick(currentBackUp, e)}
        />
      </div>
      <BackupList {...backupProps} />
      { restoreBackupModalVisible ? <RestoreBackupModal key={restoreBackupModalKey} {...restoreBackupModalProps} /> : ''}
      { showBackuplabelsModalVisible ? <ShowBackupLabels key={showBackupLabelsModalKey} {...showBackupLabelsModalProps} /> : ''}
      { createVolumeStandModalVisible ? <CreateStandbyVolumeModal key={createVolumeStandModalKey} {...createVolumeStandModalProps} /> : ''}
      { workloadDetailModalVisible ? <WorkloadDetailModal key={workloadDetailModalKey} {...workloadDetailModalProps} /> : ''}
    </div>
  )
}

Backup.propTypes = {
  backup: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  setting: PropTypes.object,
  volume: PropTypes.object,
  backingImage: PropTypes.object,
}

export default connect(({
  backup, setting, loading, volume, backingImage,
}) => ({
  backup, setting, loading: loading.models.backup, volume, backingImage,
}))(Backup)
