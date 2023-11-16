import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input } from 'antd'
import { ModalBlur, SizeInput } from '../../components'
import { bytesToGiB } from './helper'

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
      // don't send data if it's not changed
      if (data.image === selected.image) { delete data.image }
      if (data.uiImage === selected.uiImage) { delete data.uiImage }

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
    state: {
      size: bytesToGiB(selected.size),
      unit: 'Gi',
      mustExpand: true,
    },
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
          })(<Input disabled={true} style={{ width: '80%' }} />)}
        </FormItem>
        <SizeInput {...sizeInputProps}>
        </SizeInput>
        <FormItem label="Image" {...formItemLayout}>
          {getFieldDecorator('image', {
            initialValue: selected.image,
          })(<Input style={{ width: '80%' }} />)}
        </FormItem>
        <FormItem label="UI Image" {...formItemLayout}>
          {getFieldDecorator('uiImage', {
            initialValue: selected.uiImage,
          })(<Input style={{ width: '80%' }} />)}
        </FormItem>
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
