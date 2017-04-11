import React, { PropTypes } from 'react'
import { connect } from 'dva'
import BackupVolumes from './BackupVolumes'
import BackupFilter from './BackupFilter'
import { routerRedux } from 'dva/router'
import RestoreBackup from './RestoreBackup'

function Backup({ host, backup, loading, location, dispatch }) {
  const { data, backups, restoreBackupModalVisible, currentItem } = backup
  const { field, keyword } = location.query
  const hosts = host.data

  const backupVolumesProps = {
    dataSource: data,
    backups,
    loading,
    queryBackups(name, url) {
      dispatch({
        type: 'backup/queryBackupList',
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
        },
      })
    },
  }

  const backupFilterProps = {
    field,
    keyword,
    onSearch(fieldsValue) {
      fieldsValue.keyword.length ? dispatch(routerRedux.push({
        pathname: '/backup',
        query: {
          ...location.query,
          field: fieldsValue.field,
          keyword: fieldsValue.keyword,
        },
      })) : dispatch(routerRedux.push({
        pathname: '/backup',
      }))
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

  const RestoreBackupGen = () =>
    <RestoreBackup {...restoreBackupModalProps} />

  return (
    <div className="content-inner" >
      <BackupFilter {...backupFilterProps} />
      <BackupVolumes {...backupVolumesProps} />
      <RestoreBackupGen />
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
