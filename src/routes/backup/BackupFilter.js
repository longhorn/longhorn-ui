import React from 'react'
import PropTypes from 'prop-types'
import { Select, Form, Row, Col } from 'antd'
const Option = Select.Option

const BackupFilter = ({
  backupVolumesForSelect,
  onSearch,
}) => {
  function handleChange(v) {
    onSearch(v)
  }

  const options = backupVolumesForSelect.map(v => (
    <Option value={v.name} key={v.name}>{v.name}</Option>
  ))

  return (
    <Row gutter={24}>
      <Col lg={6} md={12} sm={16} xs={24} style={{ marginBottom: 16 }}>
        <span>Name: </span>
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="Choose a volume for backups"
          optionFilterProp="children"
          onChange={handleChange}
          defaultValue="all"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          <Option value={'all'} key={'all'}>{'All'}</Option>
          {options}
        </Select>
      </Col>
    </Row>
  )
}

BackupFilter.propTypes = {
  form: PropTypes.object.isRequired,
  onSearch: PropTypes.func,
  keyword: PropTypes.string,
  backupVolumesForSelect: PropTypes.array,
}

export default Form.create()(BackupFilter)
