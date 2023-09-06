import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input } from 'antd'
import { ModalBlur, SizeInput } from '../../components'

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
  selected,
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
    title: 'Edit Object Store',
    visible,
    onCancel,
    width: 800,
    onOk: handleOk,
    style: { top: 0 },
  }

  const sizeInputProps = {
    state: selected,
    getFieldDecorator,
    getFieldsValue,
    setFieldsValue,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Name" {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: selected.name,
          })(<Input disabled="true" style={{ width: '80%' }} />)}
        </FormItem>
        <SizeInput {...sizeInputProps}>
        </SizeInput>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  selected: PropTypes.object,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
