import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select } from 'antd'
import PathInput from './PathInput'
import { ModalBlur } from '../../../components'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
}

const modal = ({
  item,
  visible,
  onCancel,
  onOk,
  hosts,
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

      onOk({ url: item.actions.connect, ...data })
    })
  }

  const modalOpts = {
    title: 'Connect to node',
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
  }

  const options = hosts.filter(host => host.conditions && host.conditions.Ready && host.conditions.Ready.status.toLowerCase() === 'true').map(host => <Select.Option key={host.name} value={host.id}>{host.name}</Select.Option>)
  if (!item) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Node" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: 'Please select a host to attach',
              },
            ],
          })(<Select style={{ width: '100%' }} size="large">
            {options}
          </Select>)}
        </FormItem>
        <FormItem label="Path" hasFeedback {...formItemLayout}>
          {getFieldDecorator('path', {
            rules: [{
              required: true,
              message: 'Please Input Path!',
            }],
            initialValue: item.path,
          })(<PathInput placeholder="Path mounted by the disk, e.g. /mnt/disk1" />)}
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
  hosts: PropTypes.array,
}

export default Form.create()(modal)
