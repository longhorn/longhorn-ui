import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Select, Spin } from 'antd'
import { ModalBlur } from '../../components'
import { frontends } from './helper/index'
const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 14,
  },
}

const modal = ({
  item,
  visible,
  onCancel,
  onOk,
  nodeTags,
  diskTags,
  tagsLoading,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
  },
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Create Volume',
    visible,
    onCancel,
    onOk: handleOk,
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
                message: 'Please input volume name',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="Size" hasFeedback {...formItemLayout}>
          {getFieldDecorator('size', {
            initialValue: item.size,
            rules: [
              {
                required: true,
                message: 'Please input volume size',
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
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber />)}
          <span>Gi</span>
        </FormItem>

        <FormItem label="Number of Replicas" hasFeedback {...formItemLayout}>
          {getFieldDecorator('numberOfReplicas', {
            initialValue: item.numberOfReplicas,
            rules: [
              {
                required: true,
                message: 'Please input the number of replicas',
              },
              {
                validator: (rule, value, callback) => {
                  if (value === '' || typeof value !== 'number') {
                    callback()
                    return
                  }
                  if (value < 1 || value > 10) {
                    callback('The value should be between 1 and 10')
                  } else if (!/^\d+$/.test(value)) {
                    callback('The value must be a positive integer')
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber />)}
        </FormItem>
        <FormItem label="Frontend" hasFeedback {...formItemLayout}>
          {getFieldDecorator('frontend', {
            initialValue: frontends[0].value,
            rules: [
              {
                required: true,
                message: 'Please select a frontend',
              },
            ],
          })(<Select>
          { frontends.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>) }
          </Select>)}
        </FormItem>
        <Spin spinning={tagsLoading}>
          <FormItem label="Node Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('nodeSelector', {
              initialValue: [],
            })(<Select mode="tags">
            { nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label="Disk Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('diskSelector', {
              initialValue: [],
            })(<Select mode="tags">
            { diskTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  hosts: PropTypes.array,
  nodeTags: PropTypes.array,
  diskTags: PropTypes.array,
  tagsLoading: PropTypes.bool,
}

export default Form.create()(modal)
