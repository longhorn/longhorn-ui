import React, { PropTypes } from 'react'
import { connect } from 'dva'
import { Row, Col, Input } from 'antd'

function Setting() {
  return (
    <div className="content-inner">
      <Row gutter={24}>
        <Col lg={12} md={24} >
          <div style={{ marginBottom: 16 }}>
            <Input addonBefore="Backup Target" defaultValue="" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input addonBefore="IOPs Overprovision" defaultValue="" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input addonBefore="Capacity Overprovisioned" defaultValue="" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input addonBefore="Syslog Server" defaultValue="" />
          </div>
        </Col>
      </Row>
    </div>
  )
}

Setting.propTypes = {
  setting: PropTypes.object,
}

export default connect(({ setting }) => ({ setting }))(Setting)
