import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { Row, Col, Modal } from 'antd'
import queryString from 'query-string'
import BackupVolumeList from './BackupVolumeList'
import { addPrefix } from '../../utils/pathnamePrefix'
import CreateStandbyVolume from './CreateStandbyVolume'
import { Filter } from '../../components/index'

const { confirm } = Modal

function Backup({ backup, loading, setting, dispatch, location }) {
  location.search = location.search ? location.search : {}
  const { backupVolumes, sorter, restoreBackupFilterKey, createVolumeStandModalKey, createVolumeStandModalVisible, lastBackupUrl, baseImage, size } = backup
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
    loading,
    onSorterChange(s) {
      dispatch({
        type: 'backup/updateSorter',
        payload: { field: s.field, order: s.order, columnKey: s.columnKey },
      })
    },
    linkToBackup(id) {
      dispatch(
        routerRedux.push(
          {
            pathname: addPrefix(`/backup/${id}`),
            search: queryString.stringify({
              ...queryString.parse(location.search),
              field: 'volumeName',
              keyword: id,
            }),
            state: true,
          }
        )
      )
    },
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
    sorter,
  }

  const volumeFilterProps = {
    location,
    fieldOption: [
      { value: 'name', name: 'Name' },
      { value: 'baseImage', name: 'Base Image' },
    ],
    onSearch(filter) {
      dispatch({
        type: 'backup/filterBackupVolumes',
        payload: filter,
      })
    },
  }

  const settings = setting.data
  const defaultReplicaCountSetting = settings.find(s => s.id === 'default-replica-count')
  const defaultNumberOfReplicas = defaultReplicaCountSetting !== undefined ? parseInt(defaultReplicaCountSetting.value, 10) : 3
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
        <Col lg={18} md={16} sm={24} xs={24}></Col>
        <Col lg={6} md={8} sm={24} xs={24} style={{ marginBottom: 16 }}>
          <Filter key={restoreBackupFilterKey} {...volumeFilterProps} />
        </Col>
      </Row>
      <BackupVolumeList {...backupVolumesProps} />
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
