import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Modal } from 'antd'
import BackupVolumeList from './BackupVolumeList'
import RestoreBackup from './RestoreBackup'
import CreateStandbyVolume from './CreateStandbyVolume'
import { Filter } from '../../components/index'
import BackupBulkActions from './BackupBulkActions'

const { confirm } = Modal

function Backup({ host, backup, loading, setting, dispatch, location }) {
  location.search = location.search ? location.search : {}
  const { backupVolumes, sorter, restoreBackupFilterKey, currentItem, restoreBackupModalKey, createVolumeStandModalKey, createVolumeStandModalVisible, lastBackupUrl, baseImage, size, restoreBackupModalVisible, selectedRows, isBulkRestore, bulkRestoreData, previousChecked } = backup
  const hosts = host.data
  const settings = setting.data
  const defaultReplicaCountSetting = settings.find(s => s.id === 'default-replica-count')
  const defaultNumberOfReplicas = defaultReplicaCountSetting !== undefined ? parseInt(defaultReplicaCountSetting.value, 10) : 3
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
  const backupVolumesProps = {
    backup: backupVolumes,
    search: location.search,
    loading,
    onSorterChange(s) {
      dispatch({
        type: 'backup/updateSorter',
        payload: { field: s.field, order: s.order, columnKey: s.columnKey },
      })
    },
    // linkToBackup(id) {
    //   dispatch(
    //     routerRedux.push(
    //       {
    //         pathname: addPrefix(`/backup/${id}`),
    //         search: queryString.stringify({
    //           ...queryString.parse(location.search),
    //           field: 'volumeName',
    //           keyword: id,
    //           state: true,
    //         }),
    //       }
    //     )
    //   )
    // },
    Create(record) {
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
    restoreLatestBackup(record) {
      dispatch({
        type: 'backup/queryBackupDetailData',
        payload: {
          url: record.actions.backupList,
          lastBackupName: record.lastBackupName,
          numberOfReplicas: defaultNumberOfReplicas,
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
      dispatch({
        type: 'backup/filterBackupVolumes',
        payload: filter,
      })
    },
  }

  const restoreBackupModalProps = {
    item: currentItem,
    hosts,
    previousChecked,
    isBulk: isBulkRestore,
    visible: restoreBackupModalVisible,
    onOk(selectedBackup) {
      if (isBulkRestore) {
        dispatch({
          type: 'backup/restoreBulkBackup',
          payload: {
            bulkRestoreData,
            selectedBackup,
          },
        })
      } else {
        dispatch({
          type: 'backup/restore',
          payload: selectedBackup,
        })
      }
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
    restoreLatestBackup() {
      dispatch({
        type: 'backup/queryBackupDetailBulkData',
        payload: {
          selectedRows,
          numberOfReplicas: defaultNumberOfReplicas,
        },
      })
    },
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

  return (
    <div className="content-inner" style={{ display: 'flex', flexDirection: 'column', overflow: 'visible !important' }}>
      <Row gutter={24}>
        <Col lg={18} md={16} sm={24} xs={24}>
          <BackupBulkActions {...backupBulkActionsProps} />
        </Col>
        <Col lg={6} md={8} sm={24} xs={24} style={{ marginBottom: 16 }}>
          <Filter key={restoreBackupFilterKey} {...volumeFilterProps} />
        </Col>
      </Row>
      <BackupVolumeList {...backupVolumesProps} />
      <RestoreBackup key={restoreBackupModalKey} {...restoreBackupModalProps} />
      <CreateStandbyVolume key={createVolumeStandModalKey} {...createVolumeStandModalProps} />
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

export default connect(({ host, backup, setting, loading }) => ({ host, backup, setting, loading: loading.models.backup }))(Backup)
