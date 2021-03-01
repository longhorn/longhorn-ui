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
      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Create Backing Image',
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
                message: 'Please input backing image name',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="Url" hasFeedback {...formItemLayout}>
          {getFieldDecorator('imageURL', {
            initialValue: item.imageURL,
            rules: [
              {
                required: true,
                message: 'Please input backing image url',
              },
            ],
          })(<Input />)}
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
