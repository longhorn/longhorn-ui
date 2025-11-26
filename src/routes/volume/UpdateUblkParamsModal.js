import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber } from 'antd'
import { ModalBlur } from '../../components'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 },
}

const UpdateUblkParamsModal = ({
  items,
  visible,
  onCancel,
  onOk,
  field,
  form: { getFieldDecorator, validateFields, getFieldsValue },
}) => {
  if (!items) return null

  const FIELD_CONFIG = {
    ublkNumberOfQueue: {
      label: 'UBLK Number of Queues',
      requiredMessage: 'Please input the UBLK number of queues',
      actionKey: 'updateUblkNumberOfQueue',
    },
    ublkQueueDepth: {
      label: 'UBLK Queue Depth',
      requiredMessage: 'Please input the UBLK queue depth',
      actionKey: 'updateUblkQueueDepth',
    },
  }

  const { label: fieldLabel, requiredMessage, actionKey } = FIELD_CONFIG[field]

  let initialValue = ''
  if (items.length === 1) {
    initialValue = items[0][field]
  } else {
    const grouped = items.reduce((acc, obj) => {
      const v = obj[field]
      acc[v] = acc[v] || []
      acc[v].push(obj)
      return acc
    }, {})

    const uniqueValues = Object.keys(grouped)
    if (uniqueValues.length === 1) {
      initialValue = parseInt(uniqueValues[0], 10)
    }
  }

  function handleOk() {
    validateFields((errors) => {
      if (errors) return

      const value = getFieldsValue()[field]

      const data = {
        [field]: typeof value === 'number' ? value : 0,
      }

      const updateUrls = items
        .filter(item => item.actions && item.actions[actionKey])
        .map(item => item.actions[actionKey])

      onOk(data, updateUrls)
    })
  }

  const modalOpts = {
    title: `Update ${fieldLabel}`,
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem
          label={fieldLabel}
          hasFeedback
          {...formItemLayout}
        >
          {getFieldDecorator(field, {
            initialValue,
            rules: [{ required: true, message: requiredMessage }],
          })(
            <InputNumber min={0} step={1} />
          )}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

UpdateUblkParamsModal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  items: PropTypes.array,
  field: PropTypes.string,
}

export default Form.create()(UpdateUblkParamsModal)
