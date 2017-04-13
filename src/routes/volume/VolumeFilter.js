import React, { PropTypes } from 'react'
import { Form, Button, Row, Col } from 'antd'
import { Search } from '../../components'

const VolumeFilter = ({
  hosts,
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
    selectOptions: [{ value: 'id', name: 'Name' }, { value: 'host', name: 'Host' }],
    selectProps: {
      defaultValue: field || 'id',
    },
    onSearch: (value) => {
      if (value.field === 'host' && value.keyword.length > 0) {
        const found = hosts.filter(h => h.name.indexOf(value.keyword) > -1)
        if (found.length > 0) {
          value.keyword = found.map(f => f.id).join(',')
        }
      }
      onSearch(value)
    },
  }

  return (
    <Row gutter={24}>
      <Col lg={6} md={8} sm={16} xs={24} style={{ marginBottom: 16 }}>
        <Search {...searchGroupProps} />
      </Col>

      <Col lg={{ offset: 10, span: 8 }} md={{ offset: 8, span: 8 }} sm={{ offset: 0, span: 8 }} xs={{ offset: 0, span: 24 }} style={{ marginBottom: 16, textAlign: 'right' }}>
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
