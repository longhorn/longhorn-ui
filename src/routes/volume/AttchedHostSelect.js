import React, { PropTypes } from 'react'
import { Select, Input, Form } from 'antd'
const InputGroup = Input.Group

const AttchedHostSelect = ({
  hosts,
  onSelect,
}) => {
  const allowClear = true

  const options = hosts.map(item => <Select.Option key={item.name} value={item.name}>{item.name}</Select.Option>)

  return (
    <InputGroup compact>
      <span className="ant-input-group-addon">Attached to Host</span>
      <Select style={{ minWidth: '200px' }} allowClear={allowClear} size="large" onSelect={onSelect}>
        {options}
      </Select>
    </InputGroup>
  )
}

AttchedHostSelect.propTypes = {
  onSelect: PropTypes.func,
  hosts: PropTypes.array,
}

export default Form.create()(AttchedHostSelect)
