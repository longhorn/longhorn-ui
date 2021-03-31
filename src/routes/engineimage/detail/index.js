import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Row, Col, Card } from 'antd'
import EngineImageInfo from './EngineImageInfo'

function EngineImageDetail({ engineimage, engineimageId }) {
  const selectedEngineImage = engineimage.data.find(item => item.id === engineimageId)
  if (!selectedEngineImage) {
    return (<div></div>)
  }
  const engineImageProps = {
    selectedEngineImage,
  }
  const bodyStyle = {
    bodyStyle: {
      background: '#fff',
    },
  }
  return (
    <div>
      <Row gutter={24}>
        <Col md={24} xs={24}>
          <Card title="Engine Image Detail" bordered={false} {...bodyStyle}>
            <EngineImageInfo {...engineImageProps} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

EngineImageDetail.propTypes = {
  engineimage: PropTypes.object,
  engineimageId: PropTypes.string,
}

export default connect(({ engineimage }, { match }) => ({ engineimage, engineimageId: match.params.id }))(EngineImageDetail)
