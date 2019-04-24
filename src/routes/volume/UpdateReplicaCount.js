import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 10,
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
      }
      onOk(data, item.actions.updateReplicaCount)
    })
  }

  const modalOpts = {
    title: 'Update Replicas Count',
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
        <FormItem label="Number Of Replicats" hasFeedback {...formItemLayout}>
          {getFieldDecorator('replicaCount', {
            initialValue: item.numberOfReplicas,
            rules: [
              {
                required: true,
                message: 'Please input the number of replicas',
              },
              {
                validator: (rule, value, callback) => {
                  if (value < 1 || value > 20 || !/^\d+$/.test(value)) {
                    callback('The value should be an integer between 1 and 20')
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber min={1} max={20} step={1} />)}
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
