import React, { PropTypes } from 'react'
import { connect } from 'dva'
import VolumeInfo from './VolumeInfo'
import VolumeReplicas from './VolumeReplicas'
import { Row, Col } from 'antd'
import styles from './index.less'

function VolumeDetail({ volume, volumeId, loading }) {
  const { data } = volume
  const selectedVolume = data.find(item => item.id === volumeId)
  if (!selectedVolume) {
    return (<div></div>)
  }
  const replicasListProps = {
    dataSource: selectedVolume.replicas || [],
    loading,
  }

  return (
    <div>
      <Row gutter={24}>
        <Col lg={8} md={24} className={styles.col}>
          <VolumeInfo selectedVolume={selectedVolume} />
        </Col>
        <Col lg={16} md={24}>
          <VolumeReplicas {...replicasListProps} />
        </Col>
      </Row>
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
