import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Checkbox } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 19,
  },
}

const formItemLayout1 = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 15,
  },
}

const formItemLayout2 = {
  labelCol: {
    span: 14,
  },
  wrapperCol: {
    span: 8,
  },
}

const modal = ({
  item,
  visible,
  onCancel,
  onOk,
  previousChecked,
  setPreviousChange,
  isBulk = false,
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
        fromBackup: item.fromBackup,
      }
      onOk(data)
    })
  }
  const modalOpts = {
    title: isBulk ? 'Restore Backup' : `Restore Backup ${item.backupName}`,
    visible,
    onCancel,
    onOk: handleOk,
    width: 600,
  }

  function onPreviousChange(value) {
    if (item.volumeName) {
      value.target.checked ? setFieldsValue({ name: item.volumeName }) : setFieldsValue({ name: '' })
    }
    setPreviousChange(value.target.checked)
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true && !isBulk,
                message: 'Please input volume name',
              },
            ],
          })(<Input disabled={isBulk} />)}
        </FormItem>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
          {!isBulk ? <FormItem label="Number of Replicas" hasFeedback {...formItemLayout2}>
              {getFieldDecorator('numberOfReplicas', {
                initialValue: item.numberOfReplicas,
                rules: [
                  {
                    required: true,
                    message: 'Please input the number of replicas',
                  },
                ],
              })(<InputNumber min={1} />)}
            </FormItem> : <FormItem label="Number of Replicas" hasFeedback {...formItemLayout1}>
              {getFieldDecorator('numberOfReplicas', {
                initialValue: item.numberOfReplicas,
                rules: [
                  {
                    required: true,
                    message: 'Please input the number of replicas',
                  },
                ],
              })(<InputNumber min={1} />)}
            </FormItem>}
          </div>
          {!isBulk ? <div style={{ flex: 1 }}>
            <FormItem label="Use Previous Name" hasFeedback {...formItemLayout2}>
              <Checkbox checked={previousChecked} disabled={!item.volumeName} onChange={onPreviousChange}></Checkbox>
            </FormItem>
          </div> : ''}
        </div>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  previousChecked: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  setPreviousChange: PropTypes.func,
  hosts: PropTypes.array,
  isBulk: PropTypes.bool,
}

export default Form.create()(modal)
