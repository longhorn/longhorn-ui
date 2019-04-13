import React, { PropTypes } from 'react'
import { Form, Input, Checkbox } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 7,
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
  onChange,
  nameSpaceDisabled,
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


  function onInnerChange(value) {
    value.target.checked ? setFieldsValue({ namespace: '', pvcName: item.defaultPVCName }) : setFieldsValue({ namespace: '', pvcName: '' })
    onChange()
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="PV Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('pvName', {
            initialValue: item.defaultPVName,
            rules: [
              {
                required: true,
                message: 'Please input pvName',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="Create PVC" hasFeedback {...formItemLayout}>
          <Checkbox checked={!nameSpaceDisabled} onChange={onInnerChange}></Checkbox>
        </FormItem>
        <FormItem label="PVC Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('pvcName', {
            initialValue: item.defaultPVCName,
            rules: [
              {
                required: !nameSpaceDisabled,
                message: 'Please input pvcName',
              },
            ],
          })(<Input disabled={nameSpaceDisabled} />)}
        </FormItem>
        <FormItem label="Namespace" hasFeedback {...formItemLayout}>
          {getFieldDecorator('namespace', {
            initialValue: '',
            rules: [
              {
                required: !nameSpaceDisabled,
                message: 'Please input namespace',
              },
            ],
          })(<Input disabled={nameSpaceDisabled} />)}
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
  onChange: PropTypes.func,
  hosts: PropTypes.array,
  nameSpaceDisabled: PropTypes.bool,
}

export default Form.create()(modal)
