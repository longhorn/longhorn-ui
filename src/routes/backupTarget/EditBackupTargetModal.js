import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Icon, InputNumber, Tooltip } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 15,
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
    getFieldValue,
  },
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
        credentialSecret: getFieldValue('credentialSecret')?.trim() || '',
        backupTargetURL: getFieldValue('backupTargetURL')?.trim() || '',
        pollInterval: getFieldValue('pollInterval')?.toString() || item.pollInterval.toString(), // pollInterval should be second number and in string type
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: `Edit Backup Target ${item.name}`,
    visible,
    onCancel,
    width: 700,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: 'Backup target name is required',
              },
            ],
          })(<Input disabled />)}
        </FormItem>
        <FormItem label="URL" hasFeedback {...formItemLayout}>
          {getFieldDecorator('backupTargetURL', {
            initialValue: item.backupTargetURL,
          })(<Input />)}
        </FormItem>
        <FormItem label="Credential Secret" hasFeedback {...formItemLayout}>
          {getFieldDecorator('credentialSecret', {
            initialValue: item.credentialSecret,
          })(<Input />)}
        </FormItem>
          <FormItem
            className="create-backup-target-poll-interval-form-item"
            label="Poll Interval"
            required={false}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {getFieldDecorator('pollInterval', {
                initialValue: item.pollInterval,
              })(<InputNumber min={0} />)}
              <span style={{ marginLeft: 8, marginRight: 8 }}>seconds</span>
              <Tooltip title="Set 0 to disable the polling">
                <Icon type="question-circle-o" style={{ alignSelf: 'center' }} />
              </Tooltip>
            </div>
          </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  item: PropTypes.object,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  form: PropTypes.object.isRequired,
}

export default Form.create()(modal)
