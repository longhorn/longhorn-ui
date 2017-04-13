import React, { PropTypes } from 'react'
import { Select, Form, Row, Col } from 'antd'
import { Search } from '../../components'
const Option = Select.Option

const BackupFilter = ({
  backupVolumes,
  field,
  keyword,
  onSearch,
}) => {
  const searchGroupProps = {
    field,
    keyword,
    size: 'large',
    select: true,
    selectOptions: [
      {
        value: 'volumeName',
        name: 'Volume',
        options(value) {
          if (backupVolumes.find(b => b.name === value)) {
            return []
          }
          return backupVolumes.filter(b => b.name.indexOf(value) > -1).map(f => {
            return <Option key={f.name}>{f.name}</Option>
          })
        },
      },
    ],
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
  backupVolumes: PropTypes.array,
}

export default Form.create()(BackupFilter)
