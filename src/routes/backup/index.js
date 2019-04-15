import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import BackupVolumeList from './BackupVolumeList'
import { addPrefix } from '../../utils/pathnamePrefix'
import { Filter } from '../../components/index'
import { Row, Col } from 'antd'

function Backup({ backup, loading, dispatch, location }) {
  const { backupVolumes, sorter, restoreBackupFilterKey } = backup
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
            query: {
              ...location.query,
              field: 'volumeName',
              keyword: id,
            },
          }
        )
      )
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

  return (
    <div className="content-inner" >
      <Row gutter={24}>
        <Col lg={18} md={16} sm={24} xs={24}></Col>
        <Col lg={6} md={8} sm={24} xs={24} style={{ marginBottom: 16 }}>
          <Filter key={restoreBackupFilterKey} {...volumeFilterProps} />
        </Col>
      </Row>
      <BackupVolumeList {...backupVolumesProps} />
    </div >
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
