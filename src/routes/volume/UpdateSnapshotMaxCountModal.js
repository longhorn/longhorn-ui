import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 12,
  },
}

const modal = ({
  item,
  visible,
  onCancel,
  onOk,
  form: { getFieldDecorator, getFieldsValue, validateFields },
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const url = item && item.actions && item.actions.updateSnapshotMaxCount
      const data = {
        snapshotMaxCount: getFieldsValue().snapshotMaxCount,
      }

      onOk(data, url)
    })
  }
  const modalOpts = {
    title: 'Update Snapshot Max Count',
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form
        layout="horizontal"
        {...formItemLayout}
        style={{ display: 'flex', gap: 10 }}
      >
        <FormItem label="Max Count">
          {getFieldDecorator('snapshotMaxCount', {
            initialValue: item.snapshotMaxCount,
            rules: [
              {
                required: true,
                message: 'Please input volume snapshotMaxCount',
              },
              {
                validator: (rule, value, callback) => {
                  if (value === '' || typeof value !== 'number') {
                    callback()
                    return
                  }
                  if (value === 0) {
                    callback()
                  }
                  if (value === 1) {
                    callback(
                      'Set 0 to inherit global settings, or a value from 2 to 250'
                    )
                  }
                  if (value < 2 || value > 250) {
                    callback(
                      'Set 0 to inherit global settings, or a value from 2 to 250'
                    )
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber style={{ width: '270px' }} />)}
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
  selected: PropTypes.object,
  onOk: PropTypes.func,
  hosts: PropTypes.array,
}

export default Form.create()(modal)
