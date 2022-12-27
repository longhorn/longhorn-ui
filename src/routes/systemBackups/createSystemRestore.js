import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 15,
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
      if (data.name && typeof data.name === 'string') {
        data.name = data.name.trimLeftAndRight()
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Restore System Backup',
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
                message: 'Please input System Restore name.',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="Version" hasFeedback {...formItemLayout}>
          {getFieldDecorator('version', {
            initialValue: item.version,
            rules: [
              {
                required: true,
                message: 'Please input version.',
              },
            ],
          })(<Input disabled={true} />)}
        </FormItem>
        <FormItem label="System Backup" hasFeedback {...formItemLayout}>
          {getFieldDecorator('systemBackup', {
            initialValue: item.systemBackup,
            rules: [
              {
                required: true,
                message: 'Please input System backup name.',
              },
            ],
          })(<Input disabled={true} />)}
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
