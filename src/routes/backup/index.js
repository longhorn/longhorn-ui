import React, { PropTypes } from 'react'
import { connect } from 'dva'
import BackupFilter from './BackupFilter'
import { routerRedux } from 'dva/router'
import RestoreBackup from './RestoreBackup'
import BackupList from './BackupList'

function Backup({ host, backup, loading, location, dispatch }) {
  const { data, backupVolumes, restoreBackupModalVisible, restoreBackupModalKey, currentItem, sorter } = backup
  const { field, keyword } = location.query
  const hosts = host.data
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
            numberOfReplicas: 2,
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
          ...location.query,
        },
      })
    },
  }

  const backupFilterProps = {
    field,
    keyword,
    backupVolumes,
    value: location.query.keyword,
    onSearch(backupVolumeName) {
      dispatch(
        routerRedux.push(
          {
            pathname: '/backup',
            query: {
              ...location.query,
              field: 'volumeName',
              keyword: backupVolumeName,
            },
          }
        )
      )
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

  return (
    <div className="content-inner" >
      <BackupFilter {...backupFilterProps} />
      <BackupList {...backupVolumesProps} />
      <RestoreBackup key={restoreBackupModalKey} {...restoreBackupModalProps} />
    </div >
  )
}

Backup.propTypes = {
  backup: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.bool,
  host: PropTypes.object,
}

export default connect(({ host, backup, loading }) => ({ host, backup, loading: loading.models.backup }))(Backup)
