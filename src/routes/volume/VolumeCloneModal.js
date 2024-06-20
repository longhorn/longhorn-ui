import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input } from 'antd'
import { ModalBlur } from '../../components'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 18,
  },
}

const modal = ({
  selectedVolume,
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
        ...selectedVolume,
        ...getFieldsValue(),
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: `Clone Volume ${selectedVolume.name}`,
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: `cloned-${selectedVolume.name}`,
            rules: [
              {
                required: true,
                message: 'Volume name is required',
              },
            ],
          })(<Input />)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  selectedVolume: PropTypes.object,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  option: PropTypes.array,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
