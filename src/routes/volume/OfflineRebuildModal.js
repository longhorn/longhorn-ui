import React from 'react'
import PropTypes from 'prop-types'
import { Form, Radio } from 'antd'
import { ModalBlur } from '../../components'

const OfflineReplicaRebuildModal = ({
  items = [],
  visible,
  onCancel,
  onOk,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
  },
}) => {
  const initialValue = items.length === 1 ? items[0].offlineRebuild || 'ignored' : 'ignored'

  const handleOk = () => {
    validateFields((errors) => {
      if (errors) return

      const data = getFieldsValue()
      const actionUrls = items
        .map(item => item.actions?.offlineRebuilding)
        .filter(Boolean)

      onOk(data, actionUrls)
    })
  }

  return (
    <ModalBlur
      visible={visible}
      title="Offline Replica Rebuild"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <p>
        Choose how to handle offline replica rebuilding for this volume.<br />
        This setting overrides the global configuration.
      </p>
      <Form layout="horizontal">
        {getFieldDecorator('offlineRebuild', {
          initialValue,
          rules: [
            {
              required: true,
              message: 'Please select an option for offline rebuilding!',
            },
          ],
        })(
          <Radio.Group>
            <Radio value="ignored">Ignored</Radio>
            <Radio value="enabled">Enabled</Radio>
            <Radio value="disabled">Disabled</Radio>
          </Radio.Group>
        )}
      </Form>
    </ModalBlur>
  )
}

OfflineReplicaRebuildModal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  items: PropTypes.array,
  onOk: PropTypes.func,
}

export default Form.create()(OfflineReplicaRebuildModal)
