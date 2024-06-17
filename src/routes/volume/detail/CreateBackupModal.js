import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select, Alert } from 'antd'
import { ModalBlur } from '../../../components'
import { BackupLabelInput } from '../../../components'

const FormItem = Form.Item
const Option = Select.Option

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
  availBackupTargets,
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
      if (errors) return

      const labels = getLabels(getFieldsValue)
      const data = {
        labels,
        backupTargetName: getFieldValue('backupTargetName'),
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
        <FormItem label="Backup Target" style={{ display: 'flex' }} {...formItemLayout}>
          {getFieldDecorator('backupTargetName', {
            initialValue: availBackupTargets.length > 0 ? availBackupTargets[0].name : '',
          })(
          <Select style={{ width: '100%' }}>
            {availBackupTargets.map(bkTarget => <Option key={bkTarget.name} value={bkTarget.name}>{bkTarget.name}</Option>)}
          </Select>
          )}
        </FormItem>
        <BackupLabelInput form={form} />
      </div>
    </ModalBlur>
  )
}

modal.propTypes = {
  availBackupTargets: PropTypes.array,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  hosts: PropTypes.array,
}

export default Form.create()(modal)
