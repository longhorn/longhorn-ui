import React, { PropTypes } from 'react'
import { Form, Row, Col } from 'antd'
import { Filter } from '../../components/index'

const HostFilter = ({
  location,
  onSearch,
  stateOption,
  fieldOption,
}) => {
  const searchGroupProps = {
    location,
    stateOption,
    fieldOption,
    onSearch: (value) => {
      onSearch(value)
    },
  }
  return (
    <Row gutter={24}>
      <Col lg={6} md={8} sm={16} xs={24} style={{ marginBottom: 16 }}>
        <Filter {...searchGroupProps} />
      </Col>
    </Row>
  )
}

HostFilter.propTypes = {
  onSearch: PropTypes.func,
  location: PropTypes.object,
  stateOption: PropTypes.array,
  fieldOption: PropTypes.array,
}

export default Form.create()(HostFilter)
