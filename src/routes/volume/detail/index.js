import React, { PropTypes } from 'react'
import { connect } from 'dva'
import VolumeInfo from './VolumeInfo'
import VolumeReplicas from './VolumeReplicas'
import { Row, Col } from 'antd'
import { DropOption } from '../../../components'
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
  const replicasListProps = {
    dataSource: selectedVolume.replicas || [],
    loading,
  }

  const showAttachHost = () => {
    dispatch({
      type: 'volume/showAttachHostModal',
    })
  }

  const showRecurring = () => {
    dispatch({
      type: 'volume/showRecurringModal',
    })
  }

  const showSnapshots = () => {
    dispatch({
      type: 'volume/showSnapshotsModal',
    })
  }

  const handleMenuClick = (event) => {
    if (event.key === '2') {
      showAttachHost()
    } else if (event.key === '6') {
      showRecurring()
    } else if (event.key === '4') {
      showSnapshots()
    }
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
    item: {
    },
    visible: attachHostModalVisible,
    hosts,
    onOk(newVolume) {
      dispatch({
        type: 'volume/attachHost',
        payload: newVolume,
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

  const AttachHostGen = () =>
    <AttachHost {...attachHostModalProps} />

  const SnapshotsGen = () =>
    <Snapshots {...snapshotsModalProps} />


  return (
    <div>
      <Row gutter={24}>
        <Col md={{ offset: 16, span: 8 }} style={{ marginBottom: 16, textAlign: 'right' }}>
          <DropOption menuOptions={[
            { key: '1', name: 'Delete' },
            { key: '2', name: 'Attach' },
            { key: '3', name: 'Detach' },
            { key: '4', name: 'Snapshots' },
            { key: '5', name: 'Backups' },
            { key: '6', name: 'Recurring Snapshot and Backup' },
          ]} onMenuClick={handleMenuClick}
          />
        </Col>
        <Col lg={8} md={24} className={styles.col}>
          <VolumeInfo selectedVolume={selectedVolume} />
        </Col>
        <Col lg={16} md={24}>
          <VolumeReplicas {...replicasListProps} />
        </Col>
      </Row>
      <AttachHostGen />
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

function mapStateToProps(state, ownProps) {
  return {
    ...state,
    volumeId: ownProps.params.id,
    loading: state.loading.models.volume,
  }
}
export default connect(mapStateToProps)(VolumeDetail)
