import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

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
  t,
}) => {
  if (!items) return null

  const FIELD_CONFIG = {
    ublkNumberOfQueue: {
      labelKey: 'updateUblkParamsModal.fields.ublkNumberOfQueue.label',
      requiredMessageKey: 'updateUblkParamsModal.fields.ublkNumberOfQueue.requiredMessage',
      actionKey: 'updateUblkNumberOfQueue',
    },
    ublkQueueDepth: {
      labelKey: 'updateUblkParamsModal.fields.ublkQueueDepth.label',
      requiredMessageKey: 'updateUblkParamsModal.fields.ublkQueueDepth.requiredMessage',
      actionKey: 'updateUblkQueueDepth',
    },
  }

  const { labelKey, requiredMessageKey, actionKey } = FIELD_CONFIG[field]

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
    title: t('updateUblkParamsModal.title.updateField', { fieldLabel: t(labelKey) }),
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem
          label={t(labelKey)}
          hasFeedback
          {...formItemLayout}
        >
          {getFieldDecorator(field, {
            initialValue,
            rules: [{ required: true, message: t(requiredMessageKey) }],
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
  t: PropTypes.func.isRequired,
}

export default withTranslation()(Form.create()(UpdateUblkParamsModal))
