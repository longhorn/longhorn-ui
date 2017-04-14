import React, { PropTypes } from 'react'
import { connect } from 'dva'
import VolumeInfo from './VolumeInfo'
import { Row, Col, Card } from 'antd'
import { routerRedux } from 'dva/router'
import VolumeActions from '../VolumeActions'
import styles from './index.less'
import AttachHost from '../AttachHost'
import Snapshots from '../Snapshots'
import RecurringList from '../RecurringList'
import { Replica } from '../../../components'

function VolumeDetail({ snapshotModal, dispatch, backup, host, volume, volumeId, loading }) {
  const { data, attachHostModalVisible } = volume
  const { backupStatus } = backup
  const hosts = host.data
  const selectedVolume = data.find(item => item.id === volumeId)
  if (!selectedVolume) {
    return (<div></div>)
  }
  const found = hosts.find(h => selectedVolume.controller && h.id === selectedVolume.controller.hostId)
  if (found) {
    selectedVolume.host = found.name
  }
  if (selectedVolume.replicas) {
    selectedVolume.replicas.forEach(replica => {
      const targetHost = hosts.find(h => h.id === replica.hostId)
      if (targetHost) {
        replica.host = targetHost.name
      }
    })
  }
  const replicasListProps = {
    dataSource: selectedVolume.replicas || [],
    deleteReplica(name) {
      dispatch({
        type: 'volume/deleteReplica',
        payload: {
          name,
          url: selectedVolume.actions.replicaRemove,
        },
      })
    },
    loading,
  }

  const backupStatusProps = {
    selectedVolume,
    backupStatus,
    clearBackupStatus() {
      dispatch({
        type: 'backup/updateBackupStatus',
        payload: {
          backupStatus: {},
        },
      })
    },
    queryBackupStatus() {
      dispatch({
        type: 'backup/queryBackupStatus',
        payload: {
          url: selectedVolume.actions.latestBackupStatus,
        },
      })
    },
  }

  const volumeActionsProps = {
    takeSnapshot(record) {
      dispatch({
        type: 'snapshotModal/snapshotAction',
        payload: {
          type: 'snapshotCreate',
          url: record.actions.snapshotCreate,
          params: {
            name: '',
          },
          querySnapShotUrl: record.actions.snapshotList,
        },
      })
    },
    showAttachHost(record) {
      dispatch({
        type: 'volume/showAttachHostModal',
        payload: {
          selected: record,
        },
      })
    },
    showSnapshots(record) {
      dispatch(routerRedux.push({
        pathname: `/volume/${record.name}/snapshots`,
      }))
    },
    showRecurring(record) {
      dispatch({
        type: 'volume/showRecurringModal',
        payload: {
          selected: record,
        },
      })
    },
    deleteVolume(record) {
      dispatch({
        type: 'volume/delete',
        payload: record,
      })
    },
    detach(url) {
      dispatch({
        type: 'volume/detach',
        payload: {
          url,
        },
      })
    },
    showBackups(record) {
      dispatch(routerRedux.push({
        pathname: '/backup',
        query: {
          field: 'volumeName',
          keyword: record.name,
        },
      }))
    },
  }

  const attachHostModalProps = {
    item: selectedVolume,
    visible: attachHostModalVisible,
    hosts,
    onOk(selectedHost, url) {
      dispatch({
        type: 'volume/attach',
        payload: {
          host: selectedHost,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideAttachHostModal',
      })
    },
  }

  const recurringListProps = {
    dataSource: selectedVolume.recurringJobs || [],
    loading,
    onOk(recurring) {
      dispatch({
        type: 'volume/recurringUpdate',
        payload: {
          recurring,
          url: selectedVolume.actions.recurringUpdate,
        },
      })
    },
  }

  const snapshotsProp = {
    ...snapshotModal,
    volumeId,
    dispatch,
  }

  const bodyStyle = {
    bodyStyle: {
      height: 320,
      background: '#fff',
    },
  }

  return (
    <div >
      <Row gutter={24}>
        <Col md={{ offset: 16, span: 8 }} style={{ marginBottom: 16, textAlign: 'right' }}>
          <VolumeActions {...volumeActionsProps} selected={selectedVolume} />
        </Col>
        <Col md={8} xs={24} className={styles.col}>
          <Card title="Volume Detail" bordered={false} {...bodyStyle}>
            <VolumeInfo {...backupStatusProps} />
          </Card>
        </Col>
        <Col md={16} xs={24} style={{ marginBottom: 16 }}>
          <Card title="Replica" bordered={false} {...bodyStyle}>
            <Replica {...replicasListProps} />
          </Card>
        </Col>
        <Col xs={24} style={{ marginBottom: 16 }}>
          <Card title="Snapshots" bordered={false}>
            <Snapshots {...snapshotsProp} />
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Recurring Snapshot and Backup" bordered={false}>
            <RecurringList {...recurringListProps} />
          </Card>
        </Col>
      </Row>
      {attachHostModalVisible && <AttachHost {...attachHostModalProps} />}
    </div >
  )
}

VolumeDetail.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  backup: PropTypes.object,
  host: PropTypes.object,
  volumeId: PropTypes.string,
  loading: PropTypes.bool,
  snapshotModal: PropTypes.object,
}

export default connect(({ snapshotModal, backup, host, volume, loading }, { params }) => ({ snapshotModal, backup, host, volume, loading: loading.models.volume, volumeId: params.id }))(VolumeDetail)
