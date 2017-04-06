import React, { PropTypes } from 'react'
import { Form, Select } from 'antd'
import { ModalBlur } from '../../components'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
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
        key: item.key,
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Attach to host',
    visible,
    onCancel,
    onOk: handleOk,
  }

  const options = hosts.map(host => <Select.Option key={host.name} value={host.name}>{host.name}</Select.Option>)

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Host" hasFeedback {...formItemLayout}>
          {getFieldDecorator('host', {
            initialValue: item.host,
            rules: [
              {
                required: true,
                message: 'required field',
              },
            ],
          })(<Select style={{ minWidth: '200px' }} size="large">
            {options}
          </Select>)}
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
