import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import queryString from 'query-string'
import RestoreBackup from './RestoreBackup'
import BackupList from './BackupList'
import ShowBackupLabels from './ShowBackupLabels'

function Backup({ host, backup, setting, loading, location, dispatch }) {
  const { data, restoreBackupModalVisible, restoreBackupModalKey, currentItem, sorter, showBackupLabelsModalKey, backupLabel, showBackuplabelsModalVisible } = backup
  const hosts = host.data
  const settings = setting.data
  const defaultReplicaCountSetting = settings.find(s => s.id === 'default-replica-count')
  const defaultNumberOfReplicas = defaultReplicaCountSetting !== undefined ? parseInt(defaultReplicaCountSetting.value, 10) : 3
  const backupVolumesProps = {
    backup: data,
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
      dispatch({ type: 'backup/showBackuplabelsModalVisible', payload: record })
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

  return (
    <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
      <BackupList {...backupVolumesProps} />
      <RestoreBackup key={restoreBackupModalKey} {...restoreBackupModalProps} />
      <ShowBackupLabels key={showBackupLabelsModalKey} {...showBackupLabelsModalProps} />
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
}

export default connect(({
  host, backup, setting, loading,
}) => ({
  host, backup, setting, loading: loading.models.backup,
}))(Backup)
