import React, { PropTypes } from 'react'
import { Select, Input, Form } from 'antd'
const InputGroup = Input.Group

const AttachedHostSelect = ({
  hosts,
  onSelect,
  location,
}) => {
  const allowClear = true
  const options = hosts.map(item => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)
  let defaultValue = ''
  const found = hosts.find(h => location.query && h.id === location.query.host)
  if (found) {
    defaultValue = found.name
  }
  return (
    <InputGroup compact>
      <span className="ant-input-group-addon">Attached to Host</span>
      <Select style={{ minWidth: '200px' }} defaultValue={defaultValue} allowClear={allowClear} size="large" onChange={onSelect}>
        {options}
      </Select>
    </InputGroup>
  )
}

AttachedHostSelect.propTypes = {
  onSelect: PropTypes.func,
  hosts: PropTypes.array,
  location: PropTypes.object,
}

export default Form.create()(AttachedHostSelect)
