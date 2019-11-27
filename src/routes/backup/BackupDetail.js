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
  const { backupVolumes, data, restoreBackupModalVisible, restoreBackupModalKey, currentItem, sorter, showBackupLabelsModalKey, backupLabel, showBackuplabelsModalVisible, createVolumeStandModalKey, createVolumeStandModalVisible, baseImage, size, lastBackupUrl, WorkloadDetailModalVisible, WorkloadDetailModalItem, WorkloadDetailModalKey } = backup
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
    showRestoreBackup(item) {
      dispatch({
        type: 'backup/showRestoreBackupModal',
        payload: {
          currentItem: {
            backupName: item.name,
            fromBackup: item.url,
            numberOfReplicas: defaultNumberOfReplicas,
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
    visible: restoreBackupModalVisible,
    onOk(selectedBackup) {
      dispatch({
        type: 'backup/restore',
        payload: selectedBackup,
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
      content: 'Delete all backups of the volume',
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
            { key: 'recovery', name: currentBackUp.length > 0 && !currentBackUp[0].lastBackupName ? 'No last backup' : 'Create Disaster Recovery Volume', disabled: currentBackUp.length > 0 && !currentBackUp[0].lastBackupName },
            { key: 'deleteAll', name: 'Delete All Backups' },
          ]}
          onMenuClick={e => handleMenuClick(currentBackUp[0], e)}
        />
      </div>
      <BackupList {...backupVolumesProps} />
      <RestoreBackup key={restoreBackupModalKey} {...restoreBackupModalProps} />
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
