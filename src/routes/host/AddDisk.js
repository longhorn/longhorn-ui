import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Modal } from 'antd'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 6,
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
        key: item.key,
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Add Disk',
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <Modal {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Path" hasFeedback {...formItemLayout}>
          {getFieldDecorator('path', {
            initialValue: item.path,
            rules: [
              {
                required: true,
                message: 'required field',
              },
            ],
          })(<Input placeholder="A Linux directaory path like “/foo/bar”" />)}
        </FormItem>
        <FormItem label="Labels" hasFeedback {...formItemLayout}>
          {getFieldDecorator('labels', {
            initialValue: item.labels,
            rules: [
              {
                required: true,
                message: 'required field',
              },
            ],
          })(<Input placeholder="A comma-separate list of strings, 10-20 chars" />)}
        </FormItem>
      </Form>
    </Modal>
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
