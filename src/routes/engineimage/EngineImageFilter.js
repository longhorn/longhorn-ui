import React from 'react'
import PropTypes from 'prop-types'
import { Form, Button, Row, Col } from 'antd'
import { Search } from '../../components'

const EngineImageFilter = ({
  field,
  keyword,
  onSearch,
  onAdd,
}) => {
  const searchGroupProps = {
    field,
    keyword,
    size: 'large',
    select: true,
    selectOptions: [{ value: 'name', name: 'Name' }, { value: 'image', name: 'image' }],
    selectProps: {
      defaultValue: field || 'name',
    },
    onSearch,
  }

  return (
    <Row gutter={24}>
      <Col lg={6} md={8} sm={16} xs={24} className="filter-input">
        <Search {...searchGroupProps} />
      </Col>

      <Col lg={{ offset: 10, span: 8 }} md={{ offset: 8, span: 8 }} sm={{ offset: 0, span: 8 }} xs={{ offset: 0, span: 24 }} style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button size="large" type="primary" onClick={onAdd}>Create Engine Image</Button>
      </Col>
    </Row>
  )
}

EngineImageFilter.propTypes = {
  form: PropTypes.object.isRequired,
  onSearch: PropTypes.func,
  onSelect: PropTypes.func,
  onAdd: PropTypes.func,
  field: PropTypes.string,
  keyword: PropTypes.string,
  location: PropTypes.object,
}

export default Form.create()(EngineImageFilter)
