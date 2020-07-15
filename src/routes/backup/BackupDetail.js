import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import queryString from 'query-string'
import { Modal } from 'antd'
import RestoreBackup from './RestoreBackup'
import { DropOption } from '../../components'
import BackupList from './BackupList'
import ShowBackupLabels from './ShowBackupLabels'
import CreateStandbyVolume from './CreateStandbyVolume'
import WorkloadDetailModal from '../volume/WorkloadDetailModal'

const { confirm } = Modal

function Backup({ host, backup, volume, setting, loading, location, dispatch }) {
  const { backupVolumes, data, restoreBackupModalVisible, restoreBackupModalKey, currentItem, sorter, showBackupLabelsModalKey, backupLabel, showBackuplabelsModalVisible, createVolumeStandModalKey, createVolumeStandModalVisible, baseImage, size, lastBackupUrl, WorkloadDetailModalVisible, WorkloadDetailModalItem, WorkloadDetailModalKey, previousChecked, tagsLoading, nodeTags, diskTags } = backup
  const hosts = host.data
  const volumeList = volume.data
  const settings = setting.data
  const defaultReplicaCountSetting = settings.find(s => s.id === 'default-replica-count')
  const defaultNumberOfReplicas = defaultReplicaCountSetting !== undefined ? parseInt(defaultReplicaCountSetting.value, 10) : 3
  const currentBackUp = backupVolumes.filter((item) => { return item.id === queryString.parse(location.search).keyword })
  const backupVolumesProps = {
    backup: data,
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
    queryBackups(name, url) {
      dispatch({
        type: 'backup/query',
        payload: {
          url,
          name,
        },
      })
    },
    showRestoreBackup(record) {
      dispatch({
        type: 'backup/beforeShowRestoreBackupModal',
        payload: {
          currentItem: {
            backupName: record.name,
            fromBackup: record.url,
            numberOfReplicas: defaultNumberOfReplicas,
            volumeName: record.volumeName,
          },
        },
      })
    },
    deleteBackup(record, listUrl) {
      dispatch({
        type: 'backup/delete',
        payload: {
          volumeName: record.volumeName,
          name: record.name,
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
    hosts,
    previousChecked,
    tagsLoading,
    nodeTags,
    diskTags,
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
          payload: record.name,
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
    },
    nodeTags,
    diskTags,
    tagsLoading,
    visible: createVolumeStandModalVisible,
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

  const WorkloadDetailModalProps = {
    visible: WorkloadDetailModalVisible,
    item: WorkloadDetailModalItem,
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
            { key: 'recovery', name: 'Create Disaster Recovery Volume', disabled: currentBackUp.length > 0 && !currentBackUp[0].lastBackupName },
            { key: 'deleteAll', name: 'Delete All Backups' },
          ]}
          onMenuClick={e => handleMenuClick(currentBackUp[0], e)}
        />
      </div>
      <BackupList {...backupVolumesProps} />
      { restoreBackupModalVisible ? <RestoreBackup key={restoreBackupModalKey} {...restoreBackupModalProps} /> : ''}
      <ShowBackupLabels key={showBackupLabelsModalKey} {...showBackupLabelsModalProps} />
      <CreateStandbyVolume key={createVolumeStandModalKey} {...createVolumeStandModalProps} />
      <WorkloadDetailModal key={WorkloadDetailModalKey} {...WorkloadDetailModalProps} />
    </div>
  )
}

Backup.propTypes = {
  backup: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  host: PropTypes.object,
  setting: PropTypes.object,
  volume: PropTypes.object,
}

export default connect(({
  host, backup, setting, loading, volume,
}) => ({
  host, backup, setting, loading: loading.models.backup, volume,
}))(Backup)
