import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input } from 'antd'
import { ModalBlur, SizeInput, StorageClassInput } from '../../components'

const FormItem = Form.Item

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
    validateFields,
    getFieldsValue,
    setFieldsValue,
  },
  item,
  visible,
  onCancel,
  onOk,
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) { return }

      const data = {
        ...getFieldsValue(),
        size: `${getFieldsValue().size}${getFieldsValue().unit}`,
      }

      if (data.unit) { delete data.unit }

      onOk(data)
    })
  }

  const modalOpts = {
    visible,
    onCancel,
    width: 800,
    onOk: handleOk,
    style: { top: 0 },
  }

  const sizeInputProps = {
    state: item,
    getFieldDecorator,
    getFieldsValue,
    setFieldsValue,
  }

  const storageclassInputProps = {
    classes: item.storageclasses,
    state: item,
    getFieldDecorator,
    getFieldsValue,
    setFieldsValue,
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
        <SizeInput {...sizeInputProps}>
        </SizeInput>
        <StorageClassInput {...storageclassInputProps}>
        </StorageClassInput>
        <FormItem label="Access Key" hasFeedback {...formItemLayout}>
          {getFieldDecorator('accesskey', {
            initialValue: item.accesskey,
            rules: [
              {
                required: true,
                message: 'Please input an access key',
              },
            ],
          })(<Input style={{ width: '80%' }} />)}
        </FormItem>
        <FormItem label="Secret Key" hasFeedback {...formItemLayout}>
          {getFieldDecorator('secretkey', {
            initialValue: item.secretkey,
            rules: [
              {
                required: true,
                message: 'Please input a secret key',
              },
            ],
          })(<Input style={{ width: '80%' }} />)}
        </FormItem>
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
