import React, { PropTypes } from 'react'
import { Form, Input, Checkbox } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 10,
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
  onChange,
  nameSpaceDisabled,
  defaultBool = true,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    setFieldsValue,
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
      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Create PV/PVC',
    visible,
    onCancel,
    onOk: handleOk,
  }

  function onInnerChange() {
    setFieldsValue({ namespace: '' })
    onChange()
  }


  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="PV Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('pvName', {
            initialValue: '<Volume Name>',
            rules: [
              {
                required: false,
                message: 'Please input pvName',
              },
            ],
          })(<Input disabled={defaultBool} />)}
        </FormItem>
        <FormItem label="Create PVC" hasFeedback {...formItemLayout}>
          <Checkbox checked={!nameSpaceDisabled} onChange={onInnerChange}></Checkbox>
        </FormItem>
        <FormItem label="Namespace" hasFeedback {...formItemLayout}>
          {getFieldDecorator('namespace', {
            initialValue: item,
            rules: [
              {
                required: !nameSpaceDisabled,
                message: 'Please input namespace',
              },
            ],
          })(<Input disabled={nameSpaceDisabled} />)}
        </FormItem>
        <FormItem label="PVC Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('pvcName', {
            initialValue: '<Volume Name>',
            rules: [
              {
                required: false,
                message: 'Please input pvcName',
              },
            ],
          })(<Input disabled={defaultBool} />)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.string,
  onOk: PropTypes.func,
  onChange: PropTypes.func,
  hosts: PropTypes.array,
  nameSpaceDisabled: PropTypes.bool,
  defaultBool: PropTypes.bool,
}

export default Form.create()(modal)
