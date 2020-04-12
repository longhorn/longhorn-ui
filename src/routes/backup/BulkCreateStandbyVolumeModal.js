import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber } from 'antd'
import { ModalBlur } from '../../components'
import { formatMib } from '../../utils/formater'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 14,
  },
}

const modal = ({
  items,
  numberOfReplicas,
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
      onOk(data, items)
    })
  }

  const modalOpts = {
    title: 'Create Disaster Recovery Volume',
    visible,
    onCancel,
    onOk: handleOk,
  }
  const selectedItems = items.map((item) => `${item.name} ${formatMib(item.size)}`).join(', ')
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Volume(s)" {...formItemLayout}>
          { selectedItems }
        </FormItem>

        <FormItem label="Number of Replicas" hasFeedback {...formItemLayout}>
          {getFieldDecorator('numberOfReplicas', {
            initialValue: numberOfReplicas,
            rules: [
              {
                required: true,
                message: 'Please input the number of replicas',
              },
              {
                validator: (rule, value, callback) => {
                  if (value === '' || typeof value !== 'number') {
                    callback()
                    return
                  }
                  if (value < 1 || value > 10) {
                    callback('The value should be between 1 and 10')
                  } else if (!/^\d+$/.test(value)) {
                    callback('The value must be a positive integer')
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber />)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  items: PropTypes.array,
  onOk: PropTypes.func,
  numberOfReplicas: PropTypes.number,
}

export default Form.create()(modal)
