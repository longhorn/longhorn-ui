import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input } from 'antd'
import { ModalBlur } from '../index'
const FormItem = Form.Item
const { TextArea } = Input

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
}
const modal = ({
  visible,
  onCancel,
  onOk,
  okText,
  modalButtonDisabled,
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
    title: 'Generate Support Bundle',
    visible,
    onCancel,
    onOk: handleOk,
    okText,
    disabled: modalButtonDisabled,
    width: 680,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Issue URL" hasFeedback {...formItemLayout}>
          {getFieldDecorator('issueURL', {
            initialValue: '',
          })(<Input />)}
        </FormItem>
        <FormItem label="Description" hasFeedback {...formItemLayout}>
          {getFieldDecorator('description', {
            initialValue: '',
          })(<TextArea autosize={{ minRows: 6, maxRows: 10 }}/>)}
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
  onChange: PropTypes.func,
  hosts: PropTypes.array,
  nameSpaceDisabled: PropTypes.bool,
  defaultBool: PropTypes.bool,
  okText: PropTypes.string,
  modalButtonDisabled: PropTypes.bool,
}

export default Form.create()(modal)
