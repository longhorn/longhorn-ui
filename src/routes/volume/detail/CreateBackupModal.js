import React from 'react'
import PropTypes from 'prop-types'
import { Form, Alert, Checkbox } from 'antd'
import { ModalBlur } from '../../../components'
import { BackupLabelInput } from '../../../components'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
}

const getLabels = (getFieldsValue) => {
  const labels = {}
  if (getFieldsValue().keys && getFieldsValue().key && getFieldsValue().value) {
    getFieldsValue().keys.forEach((item) => {
      labels[getFieldsValue().key[item]] = getFieldsValue().value[item]
    })
  }
  return labels
}

const modal = ({
  visible,
  onCancel,
  onOk,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    getFieldValue,
    setFieldsValue,
  },
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        labels: getLabels(getFieldsValue),
        backupMode: getFieldValue('fullBackup') === true ? 'full' : 'incremental',
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Create Backup',
    visible,
    onCancel,
    onOk: handleOk,
  }

  const form = {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    getFieldValue,
    setFieldsValue,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Alert showIcon message="Create backup action could take a while depending on the actual size of the volume and network bandwidth." type="warning" />
      <div style={{ marginTop: '16px' }}>
        <BackupLabelInput form={form} />
        <FormItem label="Full Backup" {...formItemLayout}>
          {getFieldDecorator('fullBackup', {
            valuePropName: 'checked',
            initialValue: false,
          })(<Checkbox />)}
        </FormItem>
      </div>
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
