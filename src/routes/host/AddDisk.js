import React, { PropTypes } from 'react'
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
          })(<Input />)}
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
          })(<Input />)}
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
