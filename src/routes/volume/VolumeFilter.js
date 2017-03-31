import React, { PropTypes } from 'react'
import { Select, Input, Form, Button, Row, Col } from 'antd'
import { Search } from '../../components'
const InputGroup = Input.Group

const VolumeFilter = ({
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
    selectOptions: [{ value: 'id', name: 'Name' }],
    selectProps: {
      defaultValue: field || 'id',
    },
    onSearch: (value) => {
      onSearch(value)
    },
  }
  const allowClear = true
  return (
    <Row gutter={24}>
      <Col lg={6} md={12} sm={16} xs={24} style={{ marginBottom: 16 }}>
        <Search {...searchGroupProps} />
      </Col>

      <Col lg={6} md={12} sm={16} xs={24} style={{ marginBottom: 16 }}>
        <InputGroup compact>
          <span className="ant-input-group-addon">Attached to Host</span>
          <Select style={{ minWidth: '200px' }} allowClear={allowClear} size="large">
            <Select.Option value="Jiangsu">84e983d2-ee35-4460-81e9-8912728b2c96</Select.Option>
          </Select>
        </InputGroup>
      </Col>

      <Col lg={{ offset: 4, span: 8 }} md={12} sm={8} xs={24} style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button size="large" type="primary" onClick={onAdd}>Create Volume</Button>
      </Col>
    </Row>
  )
}

VolumeFilter.propTypes = {
  form: PropTypes.object.isRequired,
  onSearch: PropTypes.func,
  onAdd: PropTypes.func,
  field: PropTypes.string,
  keyword: PropTypes.string,
}

export default Form.create()(VolumeFilter)
