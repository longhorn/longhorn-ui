import React, { PropTypes } from 'react'
import { Form, Input, Modal, InputNumber, Radio, Select } from 'antd'
const FormItem = Form.Item
const RadioGroup = Radio.Group

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

  const allowClear = false
  const options = hosts.map(host => <Select.Option key={host.name} value={host.name}>{host.name}</Select.Option>)
  const modalOpts = {
    title: 'Create Volume',
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <Modal {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: 'required field',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="Size" hasFeedback {...formItemLayout}>
          {getFieldDecorator('size', {
            initialValue: item.size,
            rules: [
              {
                required: true,
                message: 'required field',
              },
            ],
          })(<div><InputNumber min={1} /><span>GB</span></div>)}
        </FormItem>
        <FormItem label="IOPS" hasFeedback {...formItemLayout}>
          {getFieldDecorator('iops', {
            initialValue: item.iops,
            rules: [
              {
                required: true,
                message: 'required field',
              },
            ],
          })(<InputNumber min={1} />)}
        </FormItem>
        <FormItem label="# of Replicas" hasFeedback {...formItemLayout}>
          {getFieldDecorator('replicaNum', {
            initialValue: item.replicaNum,
            rules: [
              {
                required: true,
                message: 'required field',
              },
            ],
          })(<InputNumber min={2} />)}
        </FormItem>
        <FormItem label="Host" hasFeedback {...formItemLayout}>
          {getFieldDecorator('host', {
            initialValue: item.host,
            rules: [
              {
                required: true,
                message: 'required field',
              },
            ],
          })(
            <Select allowClear={allowClear} size="large">
              {options}
            </Select>)}
        </FormItem>
        <FormItem label="Disk Label" hasFeedback {...formItemLayout}>
          {getFieldDecorator('diskLabel', {
            initialValue: item.diskLabel,
            rules: [
              {
                required: true,
                message: 'required field',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="Frontend" hasFeedback {...formItemLayout}>
          {getFieldDecorator('frontend', {
            initialValue: item.frontend,
            rules: [
              {
                required: true,
                message: 'required field',
              },
            ],
          })(
            <RadioGroup value={item.frontend}>
              <Radio value={'linuxDev'}>linux-dev</Radio>
              <Radio value={'iscsi'}>iscsi</Radio>
            </RadioGroup>)}
        </FormItem>
      </Form>
    </Modal>
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
