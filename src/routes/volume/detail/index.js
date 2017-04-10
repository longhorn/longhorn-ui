import React, { PropTypes } from 'react'
import { connect } from 'dva'
import VolumeInfo from './VolumeInfo'
import VolumeReplicas from './VolumeReplicas'
import { Row, Col } from 'antd'
import { routerRedux } from 'dva/router'
import VolumeActions from '../VolumeActions'
import styles from './index.less'
import AttachHost from '../AttachHost'
import Recurring from '../Recurring'

const RecurringGen = (recurringModalProps) =>
  <Recurring {...recurringModalProps} />

function VolumeDetail({ dispatch, host, volume, volumeId, loading, history }) {
  const { data, attachHostModalVisible, recurringModalVisible } = volume
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
    showSnapshots(record) {
      history.push(`/volume/${record.name}/snapshot`)
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
          keyword: record.volumeName,
        },
      }))
    },
  }

  const recurringModalProps = {
    item: selectedVolume,
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
      <RecurringGen {...recurringModalProps} />
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
  history: PropTypes.object,
}

export default connect(({ host, volume, loading }, { params }) => ({ host, volume, loading: loading.models.volume, volumeId: params.id }))(VolumeDetail)
