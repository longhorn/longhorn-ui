import React, { PropTypes } from 'react'
import { connect } from 'dva'
import BackupList from './BackupList'
import BackupFilter from './BackupFilter'
import { routerRedux } from 'dva/router'
import RestoreBackup from './RestoreBackup'

function Backup({ host, backup, loading, location, dispatch }) {
  const { data, restoreBackupModalVisible, currentItem } = backup
  const { field, keyword } = location.query
  const hosts = host.data

  const backupListProps = {
    dataSource: data,
    loading,
    showRestoreBackup(item) {
      dispatch({
        type: 'backup/showRestoreBackupModal',
        payload: {
          currentItem: {
            ...item,
            iops: 100,
            replicaNum: 2,
            frontend: 'iscsi',
          },
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
    onOk(newVolume) {
      dispatch({
        type: 'backup/restoreBackup',
        payload: newVolume,
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
      <BackupList {...backupListProps} />
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
