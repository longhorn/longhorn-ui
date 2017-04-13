import React, { PropTypes } from 'react'
import { Form, Button, Row, Col } from 'antd'

const HostAction = ({
  onAdd,
}) => {
  return (
    <Row gutter={24}>
      <Col lg={8} md={12} sm={16} xs={24} style={{ marginBottom: 16 }} />
      <Col lg={{ offset: 8, span: 8 }} md={12} sm={8} xs={24} style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button size="large" type="primary" onClick={onAdd}>Add Host</Button>
      </Col>
    </Row>
  )
}

HostAction.propTypes = {
  onAdd: PropTypes.func,
}

export default Form.create()(HostAction)

