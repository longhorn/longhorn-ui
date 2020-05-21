import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select, Checkbox } from 'antd'
import { ModalBlur } from '../../components'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
}

const formItemLayoutCheckBox = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 12,
  },
}

const modal = ({
  items,
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
      onOk(data.host, data.disableFrontend, items.map(item => item.actions.attach))
    })
  }

  const modalOpts = {
    title: 'Attach to host',
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
  }

  const options = hosts.filter(host => host.conditions && host.conditions.Ready && host.conditions.Ready.status.toLowerCase() === 'true').map(host => <Select.Option key={host.name} value={host.id}>{host.name}</Select.Option>)
  if (!items || items.length === 0) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Host" hasFeedback {...formItemLayout}>
          {getFieldDecorator('host', {
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
        <FormItem label="Maintenance" {...formItemLayoutCheckBox}>
          {getFieldDecorator('disableFrontend', {
            initialValue: false,
            rules: [
              {
                required: false,
              },
            ],
          })(<Checkbox></Checkbox>)}
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
  hosts: PropTypes.array,
}

export default Form.create()(modal)
