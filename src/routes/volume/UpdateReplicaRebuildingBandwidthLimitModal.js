import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 14,
  },
  wrapperCol: {
    span: 6,
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
      const fields = getFieldsValue()

      const data = {
        ...fields,
        replicaRebuildingBandwidthLimit: fields.replicaRebuildingBandwidthLimit?.toString() || '',
      }

      let updateReplicaRebuildingBandwidthLimitUrl = []

      if (items && items.length > 0) {
        items.forEach((ele) => {
          if (ele.actions && ele.actions.updateReplicaRebuildingBandwidthLimit) {
            updateReplicaRebuildingBandwidthLimitUrl.push(ele.actions.updateReplicaRebuildingBandwidthLimit)
          }
        })
      }

      onOk(data, updateReplicaRebuildingBandwidthLimitUrl)
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
    title: 'Update Replica Rebuilding Bandwidth Limit',
    visible,
    onCancel,
    onOk: handleOk,
  }
  if (!items) {
    return null
  }

  if (items.length === 1) {
    initialValue = items[0].replicaRebuildingBandwidthLimit
  } else {
    let obj = groupBy(items, 'replicaRebuildingBandwidthLimit') || {}

    if (Object.keys(obj) && Object.keys(obj).length === 1) {
      initialValue = parseInt(Object.keys(obj)[0], 10)
    }
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Replica Rebuilding Bandwidth Limit" hasFeedback {...formItemLayout}>
          {getFieldDecorator('replicaRebuildingBandwidthLimit', {
            initialValue,
            rules: [
              {
                required: true,
                message: 'Please input the number of limit',
              },
            ],
          })(<InputNumber placeholder="various" min={0} step={1} />)}
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
