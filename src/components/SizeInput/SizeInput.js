import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select, InputNumber } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class SizeInput extends React.Component {
  state = {
    size: 0,
    unit: 'Gi',
  }

  render() {
    const { getFieldDecorator, getFieldsValue, setFieldsValue } = this.props

    function unitChange(value) {
      const unitmap = new Map([
        ['Mi', 0],
        ['Gi', 1],
        ['Ti', 2],
      ])

      let currentSize = getFieldsValue().size
      let newUnit = unitmap.get(value)
      let currentUnit = unitmap.get(getFieldsValue().unit)

      if (newUnit > currentUnit) {
        currentSize /= 1024 ** (newUnit - currentUnit)
      } else {
        currentSize *= 1024 ** (currentUnit - newUnit)
      }
      setFieldsValue({
        ...getFieldsValue(),
        unit: value,
        size: currentSize,
      })
    }

    return (
      <div style={{ display: 'flex' }}>
        <FormItem label="Size" style={{ flex: 0.6 }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
          {getFieldDecorator('size', {
            initialValue: this.state.size,
            rules: [
              {
                required: true,
                message: 'Please input size',
              }, {
                validator: (rule, value, callback) => {
                  if (value === '' || typeof value !== 'number') {
                    callback()
                    return
                  }
                  if (value < 0 || value > 65536) {
                    callback('The value should be between 0 and 65535')
                  } else if (!/^\d+([.]\d{1,2})?$/.test(value)) {
                    callback('This value should have at most two decimal places')
                  } else if (value < 10 && getFieldsValue().unit === 'Mi') {
                    callback('The volume size must be greater than 10 Mi')
                  } else if (value % 1 !== 0 && getFieldsValue().unit === 'Mi') {
                    callback('Decimals are not allowed')
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber style={{ width: '250px' }} />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('unit', {
            initialValue: this.state.unit,
            rules: [{ required: true, message: 'Please select your unit!' }],
          })(
            <Select style={{ width: '100px' }} onChange={unitChange} placeholder="Gi">
              <Option value="Mi">Mi</Option>
              <Option value="Gi">Gi</Option>
              <Option value="Ti">Ti</Option>
            </Select>,
          )}
        </FormItem>
      </div>
    )
  }
}

SizeInput.propTypes = {
  state: PropTypes.object,
  getFieldDecorator: PropTypes.func,
  getFieldsValue: PropTypes.func,
  setFieldsValue: PropTypes.func,
}

export default SizeInput
