import React, { PropTypes } from 'react'
import { Select, Form, Row, Col } from 'antd'
const Option = Select.Option

const BackupFilter = ({
  backupVolumes,
  onSearch,
  value,
}) => {
  function handleChange(v) {
    onSearch(v)
  }

  const options = backupVolumes.map(v => (
    <Option value={v.name} key={v.name}>{v.name}</Option>
  ))

  return (
    <Row gutter={24}>
      <Col lg={6} md={12} sm={16} xs={24} style={{ marginBottom: 16 }}>
        <span>Volume: </span>
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Choose a volume for backups"
          optionFilterProp="children"
          onChange={handleChange}
          value={value}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {options}
        </Select>
      </Col>
    </Row>
  )
}

BackupFilter.propTypes = {
  form: PropTypes.object.isRequired,
  onSearch: PropTypes.func,
  value: PropTypes.string,
  keyword: PropTypes.string,
  backupVolumes: PropTypes.array,
}

export default Form.create()(BackupFilter)
