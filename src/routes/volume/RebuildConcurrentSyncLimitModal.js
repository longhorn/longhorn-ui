import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber, Modal } from 'antd'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12 },
}

const RebuildConcurrentSyncLimitModal = ({
  items = [],
  visible,
  onCancel,
  onOk,
  form: { getFieldDecorator, validateFields, getFieldsValue, getFieldsError },
}) => {
  if (!items || items.length === 0) return null

  const handleOk = () => {
    validateFields((errors) => {
      if (errors) return
      const values = getFieldsValue()
      const urls = items
        .map(item => item.actions?.updateRebuildConcurrentSyncLimit)
        .filter(url => !!url)

      onOk(values, urls)
    })
  }

  const hasErrors = (fieldsError) => Object.keys(fieldsError).some(field => fieldsError[field])

  const fieldsError = getFieldsError()
  const isOkDisabled = hasErrors(fieldsError)

  const isBulk = items.length > 1
  const initialValue = isBulk ? 0 : (items[0].rebuildConcurrentSyncLimit || 0)

  return (
    <Modal
      title={isBulk ? `Update Rebuild Concurrent Sync Limit (${items.length} volumes)` : 'Update Rebuild Concurrent Sync Limit'}
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okButtonProps={{ disabled: isOkDisabled }}
      destroyOnClose
    >
      <Form layout="horizontal">
        <FormItem
          label="Rebuild Concurrent Sync Limit"
          hasFeedback
          {...formItemLayout}
        >
          {getFieldDecorator('rebuildConcurrentSyncLimit', {
            initialValue,
            rules: [
              {
                type: 'number',
                min: 0,
                max: 5,
                message: 'Value must be between 0 and 5',
              },
            ],
          })(<InputNumber min={0} max={5} />)}
        </FormItem>
      </Form>
    </Modal>
  )
}

RebuildConcurrentSyncLimitModal.propTypes = {
  items: PropTypes.array,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
}

export default Form.create()(RebuildConcurrentSyncLimitModal)
