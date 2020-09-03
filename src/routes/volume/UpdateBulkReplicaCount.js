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
  items,
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

      let updateReplicaCountUrl = []

      if (items && items.length > 0) {
        items.forEach((ele) => {
          if (ele.actions && ele.actions.updateReplicaCount) {
            updateReplicaCountUrl.push(ele.actions.updateReplicaCount)
          }
        })
      }

      onOk(data, updateReplicaCountUrl)
    })
  }

  function groupBy(objectArray, property) {
    return objectArray.reduce((acc, obj) => {
      let key = obj[property]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj)
      return acc
    }, {})
  }

  let initialValue = ''

  const modalOpts = {
    title: 'Update Replicas Count',
    visible,
    onCancel,
    onOk: handleOk,
  }
  if (!items) {
    return null
  }

  if (items.length === 1) {
    initialValue = items[0].numberOfReplicas
  } else {
    let obj = groupBy(items, 'numberOfReplicas') || {}

    if (Object.keys(obj) && Object.keys(obj).length === 1) {
      initialValue = parseInt(Object.keys(obj)[0], 10)
    }
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Number Of Replicas" hasFeedback {...formItemLayout}>
          {getFieldDecorator('replicaCount', {
            initialValue,
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
          })(<InputNumber placeholder="various" min={1} max={20} step={1} />)}
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
}

export default Form.create()(modal)
