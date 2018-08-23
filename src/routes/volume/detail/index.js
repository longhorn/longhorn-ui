import React, { PropTypes } from 'react'
import { connect } from 'dva'
import VolumeInfo from './VolumeInfo'
import { Row, Col, Card } from 'antd'
import { routerRedux } from 'dva/router'
import VolumeActions from '../VolumeActions'
import styles from './index.less'
import AttachHost from '../AttachHost'
import EngineUpgrade from '../EngineUpgrade'
import Snapshots from '../detail/Snapshots'
import RecurringList from '../detail/RecurringList'
import Salvage from '../Salvage'
import { ReplicaList } from '../../../components'
import { genAttachHostModalProps, getEngineUpgradeModalProps } from '../helper'

function VolumeDetail({ snapshotModal, dispatch, backup, engineimage, host, volume, volumeId, loading }) {
  const { data, attachHostModalVisible, engineUpgradeModalVisible, salvageModalVisible } = volume
  const { backupStatus } = backup
  const hosts = host.data
  const engineImages = engineimage.data
  const selectedVolume = data.find(item => item.id === volumeId)
  if (!selectedVolume) {
    return (<div></div>)
  }
  const found = hosts.find(h => selectedVolume.controller && h.id === selectedVolume.controller.hostId)
  if (found) {
    selectedVolume.host = found.name
  }
  const replicasListProps = {
    dataSource: selectedVolume.replicas || [],
    hosts,
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
    snapshotModal,
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
    engineImages,
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
    showEngineUpgrade(record) {
      dispatch({
        type: 'volume/showEngineUpgradeModal',
        payload: {
          selected: record,
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
    showSalvage(record) {
      dispatch({
        type: 'volume/showSalvageModal',
        payload: {
          selected: record,
        },
      })
    },
    rollback(record) {
      dispatch({
        type: 'volume/rollback',
        payload: {
          image: record.currentImage,
          url: record.actions.engineUpgrade,
        },
      })
    },
  }

  const attachHostModalProps = genAttachHostModalProps([selectedVolume], hosts, attachHostModalVisible, dispatch)

  const engineUpgradeModalProps = getEngineUpgradeModalProps([selectedVolume], engineImages, engineUpgradeModalVisible, dispatch)

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
    volume: selectedVolume,
    volumeId,
    dispatch,
  }

  const salvageModalProps = {
    item: selectedVolume,
    visible: salvageModalVisible,
    hosts,
    onOk(replicaNames, url) {
      dispatch({
        type: 'volume/salvage',
        payload: {
          replicaNames,
          url,
        },
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideSalvageModal',
      })
      dispatch({
        type: 'app/changeBlur',
        payload: false,
      })
    },
  }

  const bodyStyle = {
    bodyStyle: {
      height: 360,
      background: '#fff',
      overflowY: 'auto',
    },
  }

  return (
    <div >
      <Row gutter={24}>
        <Col md={{ offset: 16, span: 8 }} style={{ marginBottom: 16, textAlign: 'right' }}>
          <VolumeActions {...volumeActionsProps} selected={selectedVolume} />
        </Col>
        <Col md={8} xs={24} className={styles.col}>
          <Card title="Volume Details" bordered={false} {...bodyStyle}>
            <VolumeInfo {...backupStatusProps} />
          </Card>
        </Col>
        <Col md={16} xs={24} style={{ marginBottom: 16 }}>
          <Card title="Replicas" bordered={false} {...bodyStyle}>
            <ReplicaList {...replicasListProps} />
          </Card>
        </Col>
        <Col xs={24} style={{ marginBottom: 16 }}>
          <Snapshots {...snapshotsProp} />
        </Col>
        <Col xs={24}>
          <RecurringList {...recurringListProps} />
        </Col>
      </Row>
      {attachHostModalVisible && <AttachHost {...attachHostModalProps} />}
      {engineUpgradeModalVisible && <EngineUpgrade {...engineUpgradeModalProps} />}
      <Salvage {...salvageModalProps} />
    </div >
  )
}

VolumeDetail.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  backup: PropTypes.object,
  host: PropTypes.object,
  engineimage: PropTypes.object,
  volumeId: PropTypes.string,
  loading: PropTypes.bool,
  snapshotModal: PropTypes.object,
}

export default connect(({ snapshotModal, backup, host, engineimage, volume, loading }, { params }) => ({ snapshotModal, backup, host, volume, engineimage, loading: loading.models.volume, volumeId: params.id }))(VolumeDetail)
