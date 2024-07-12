import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input } from 'antd'
import { ModalBlur } from '../../components'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 12,
  },
}

const modal = ({
  item,
  visible,
  onOk,
  onCancel,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldValue,
  },
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        secret: getFieldValue('secret') || '',
        secretNamespace: getFieldValue('secretNamespace') || '',
      }
      onOk(item, data)
    })
  }

  const modalOpts = {
    title: 'Restore Backing Image',
    visible,
    onCancel,
    onOk: handleOk,
  }
  if (!item) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Backup" {...formItemLayout}>
          {getFieldDecorator('backup', { initialValue: item?.name || '' })(<Input disabled />)}
        </FormItem>
        <FormItem label="Secret" hasFeedback {...formItemLayout}>
          {getFieldDecorator('secret', { initialValue: '' })(<Input />)}
        </FormItem>
        <FormItem label="Secret Namespace" hasFeedback {...formItemLayout}>
          {getFieldDecorator('secretNamespace', { initialValue: '' })(<Input />)}
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
