import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class StorageClassInput extends React.Component {
  state = {
    storageclass: 'longhorn',
  }

  render() {
    const { getFieldDecorator, getFieldsValue, setFieldsValue } = this.props

    function classChange(value) {
      setFieldsValue({
        ...getFieldsValue(),
        storageclass: value,
      })
    }

    return (
      <div style={{ display: 'flex' }}>
          <FormItem label="Storage Class" style={{ flex: 0.6 }} hasFeedback labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('storageclass', {
              initialValue: this.state.storageclass,
              rules: [{ required: true, message: 'Please select a storage class' }],
            })(
            <Select
              style={{ width: '80%' }}
              name="storageclass"
              onChange={classChange}
            >
              {this.props.classes.map(c => (
                <Option key={c.name}>{c.name}</Option>
              ))}
            </Select>
            )}
          </FormItem>
      </div>
    )
  }
}

StorageClassInput.propTypes = {
  classes: PropTypes.array,
  state: PropTypes.object,
  getFieldDecorator: PropTypes.func,
  getFieldsValue: PropTypes.func,
  setFieldsValue: PropTypes.func,
}

export default StorageClassInput
