import React, { PropTypes } from 'react'
import { Select, Input, Form } from 'antd'
const InputGroup = Input.Group

const AttchedHostSelect = ({
  hosts,
  onSelect,
  location,
}) => {
  const allowClear = true

  const options = hosts.map(item => <Select.Option key={item.name} value={item.name}>{item.name}</Select.Option>)

  return (
    <InputGroup compact>
      <span className="ant-input-group-addon">Attached to Host</span>
      <Select style={{ minWidth: '200px' }} defaultValue={location.query ? location.query.host : ''} allowClear={allowClear} size="large" onChange={onSelect}>
        {options}
      </Select>
    </InputGroup>
  )
}

AttchedHostSelect.propTypes = {
  onSelect: PropTypes.func,
  hosts: PropTypes.array,
  location: PropTypes.object,
}

export default Form.create()(AttchedHostSelect)
