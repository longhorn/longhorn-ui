import React, { PropTypes } from 'react'
import { Form, Row, Col } from 'antd'
import { Search } from '../../components'

const BackupFilter = ({
  field,
  keyword,
  onSearch,
}) => {
  const searchGroupProps = {
    field,
    keyword,
    size: 'large',
    select: true,
    selectOptions: [{ value: 'volumeName', name: 'Volume' }],
    selectProps: {
      defaultValue: field || 'volumeName',
    },
    onSearch: (value) => {
      onSearch(value)
    },
  }

  return (
    <Row gutter={24}>
      <Col lg={6} md={12} sm={16} xs={24} style={{ marginBottom: 16 }}>
        <Search {...searchGroupProps} />
      </Col>
    </Row>
  )
}

BackupFilter.propTypes = {
  form: PropTypes.object.isRequired,
  onSearch: PropTypes.func,
  field: PropTypes.string,
  keyword: PropTypes.string,
}

export default Form.create()(BackupFilter)
