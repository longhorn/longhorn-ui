import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber } from 'antd'
import { ModalBlur } from '../../components'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
  },
}

const modal = ({
  item,
  defaultNumberOfReplicas,
  visible,
  onCancel,
  onOk,
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
      const minNumberOfCopies = getFieldValue('minNumberOfCopies')
      onOk(item, minNumberOfCopies)
    })
  }

  const modalOpts = {
    title: 'Update Minimum Copies Count',
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
        <FormItem label="Minimum Number of Copies" hasFeedback {...formItemLayout}>
          {getFieldDecorator('minNumberOfCopies', {
            initialValue: item.minNumberOfCopies || defaultNumberOfReplicas,
            rules: [
              {
                required: true,
                message: 'Please input the copies number',
              },
            ],
          })(<InputNumber min={1} />)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  defaultNumberOfReplicas: PropTypes.number,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
