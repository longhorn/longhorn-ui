import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Select } from 'antd'
import { ModalBlur } from '../../components'

const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 17,
  },
}

const modal = ({
  form: {
    getFieldDecorator,
    getFieldsValue,
  },
  item,
  visible,
  onCancel,
  onOk,
}) => {
  function handleOk() {
    const data = {
      ...getFieldsValue(),
    }
    onOk(data)
  }

  const modalOpts = {
    visible,
    onCancel,
    width: 800,
    onOk: handleOk,
    style: { top: 0 },
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: 'Please input Object Endpoint name',
              },
            ],
          })(<Input style={{ width: '80%' }} />)}
        </FormItem>
        <div style={{ display: 'flex' }}>
          <FormItem label="Size" style={{ flex: 0.6, paddingLeft: 75 }}>
            {getFieldDecorator('size', {
              initialValue: item.size,
              rules: [
                {
                  required: true,
                  message: 'Please input size',
                },
                {
                  validator: (rule, value, callback) => {
                    if (value === '' || typeof value !== 'number') {
                      callback()
                      return
                    }
                    if (value < 0 || value > 65536) {
                      callback('The value should be between 0 and 65536')
                    }
                  },
                },
              ],
            })(<InputNumber style={{ width: '250px' }} />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('unit', {
              initialValue: item.unit,
              rules: [
                {
                  required: true,
                  message: 'Please input unit',
                },
              ],
            })(
              <Select style={{ width: '100px' }}>
                <Option value="Mi">Mi</Option>
                <Option value="Gi">Gi</Option>
              </Select>
            )}
          </FormItem>
        </div>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  item: PropTypes.object,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
