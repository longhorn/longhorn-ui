import React, { PropTypes } from 'react'
import { connect } from 'dva'
import VolumeInfo from './VolumeInfo'
import VolumeReplicas from './VolumeReplicas'
import { Row, Col } from 'antd'
import VolumeActions from '../VolumeActions'
import styles from './index.less'
import AttachHost from '../AttachHost'
import Recurring from '../Recurring'
import Snapshots from '../Snapshots'

function VolumeDetail({ dispatch, host, volume, volumeId, loading }) {
  const { data, attachHostModalVisible, snapshotsModalVisible, recurringModalVisible } = volume
  const hosts = host.data
  const selectedVolume = data.find(item => item.id === volumeId)
  if (!selectedVolume) {
    return (<div></div>)
  }
  const found = hosts.find(h => selectedVolume.controller && h.id === selectedVolume.controller.hostId)
  if (found) {
    selectedVolume.host = found.name
  }
  selectedVolume.replicas.forEach(replica => {
    replica.host = hosts.find(h => h.id === replica.hostId).name
  })
  const replicasListProps = {
    dataSource: selectedVolume.replicas || [],
    loading,
  }


  const volumeActionsProps = {
    showAttachHost(record) {
      dispatch({
        type: 'volume/showAttachHostModal',
        payload: {
          selected: record,
        },
      })
    },
    showSnapshots() {
      dispatch({
        type: 'volume/showSnapshotsModal',
      })
    },
    showRecurring() {
      dispatch({
        type: 'volume/showRecurringModal',
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
  }

  const recurringModalProps = {
    item: {
    },
    visible: recurringModalVisible,
    onOk(recurring) {
      dispatch({
        type: 'volume/recurring',
        payload: recurring,
      })
    },
    onCancel() {
      dispatch({
        type: 'volume/hideRecurringModal',
      })
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

  const snapshotsModalProps = {
    item: {
    },
    visible: snapshotsModalVisible,
    onCancel() {
      dispatch({
        type: 'volume/hideSnapshotsModal',
      })
    },
  }

  const RecurringGen = () =>
    <Recurring {...recurringModalProps} />

  const SnapshotsGen = () =>
    <Snapshots {...snapshotsModalProps} />


  return (
    <div>
      <Row gutter={24}>
        <Col md={{ offset: 16, span: 8 }} style={{ marginBottom: 16, textAlign: 'right' }}>
          <VolumeActions {...volumeActionsProps} selected={selectedVolume} />
        </Col>
        <Col lg={8} md={24} className={styles.col}>
          <VolumeInfo selectedVolume={selectedVolume} />
        </Col>
        <Col lg={16} md={24}>
          <VolumeReplicas {...replicasListProps} />
        </Col>
      </Row>
      <AttachHost {...attachHostModalProps} />
      <RecurringGen />
      <SnapshotsGen />
    </div>
  )
}

VolumeDetail.propTypes = {
  volume: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  host: PropTypes.object,
  volumeId: PropTypes.string,
  loading: PropTypes.bool,
}

export default connect(({ host, volume, loading }, { params }) => ({ host, volume, loading: loading.models.volume, volumeId: params.id }))(VolumeDetail)
