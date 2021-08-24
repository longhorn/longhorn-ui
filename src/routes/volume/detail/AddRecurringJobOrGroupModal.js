import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select } from 'antd'
import { ModalBlur } from '../../../components'
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
    title: item.type === 'job' ? 'Add Recurring Job' : 'Add Recurring Job Group',
    visible,
    onCancel,
    width: 800,
    onOk: handleOk,
  }
  if (!item) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={item.type === 'job' ? 'Recurring Job Name' : 'Recurring Job Group Name'} {...formItemLayout}>
        {getFieldDecorator('name', {
          initialValue: '',
          rules: [
            {
              required: true,
              message: 'Please Select Recurring Job Name',
            },
          ],
        })(<Select>
            {item.options.map((option) => {
              return <Option key={option.id} value={option.name}>{option.name}</Option>
            })}
          </Select>)}
        </FormItem>
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
}

export default Form.create()(modal)
