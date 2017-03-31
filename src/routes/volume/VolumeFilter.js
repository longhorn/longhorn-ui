import React, { PropTypes } from 'react'
import { Form, Button, Row, Col } from 'antd'
import { Search } from '../../components'
import AttchedHostSelect from './AttchedHostSelect'

const VolumeFilter = ({
  hosts,
  field,
  keyword,
  onSearch,
  onSelect,
  onAdd,
  location,
}) => {
  const searchGroupProps = {
    field,
    keyword,
    size: 'large',
    select: true,
    selectOptions: [{ value: 'id', name: 'Name' }],
    selectProps: {
      defaultValue: field || 'id',
    },
    onSearch: (value) => {
      onSearch(value)
    },
  }
  const attchedHostProps = {
    hosts,
    onSelect: (value) => {
      onSelect(value)
    },
    location,
  }

  return (
    <Row gutter={24}>
      <Col lg={6} md={12} sm={16} xs={24} style={{ marginBottom: 16 }}>
        <Search {...searchGroupProps} />
      </Col>

      <Col lg={6} md={12} sm={16} xs={24} style={{ marginBottom: 16 }}>
        <AttchedHostSelect {...attchedHostProps} />
      </Col>

      <Col lg={{ offset: 4, span: 8 }} md={{ offset: 0, span: 24 }} sm={{ offset: 0, span: 24 }} xs={{ offset: 0, span: 24 }} style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button size="large" type="primary" onClick={onAdd}>Create Volume</Button>
      </Col>
    </Row>
  )
}

VolumeFilter.propTypes = {
  form: PropTypes.object.isRequired,
  onSearch: PropTypes.func,
  onSelect: PropTypes.func,
  onAdd: PropTypes.func,
  field: PropTypes.string,
  keyword: PropTypes.string,
  hosts: PropTypes.array,
  location: PropTypes.object,
}

export default Form.create()(VolumeFilter)
