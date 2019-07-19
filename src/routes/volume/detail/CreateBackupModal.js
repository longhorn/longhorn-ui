import React from 'react'
import PropTypes from 'prop-types'
import { Form, Icon } from 'antd'
import { ModalBlur } from '../../../components'
import { BackupLabelInput } from '../../../components'

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
      let data = {}
      if (getFieldsValue().keys && getFieldsValue().key && getFieldsValue().value) {
        getFieldsValue().keys.forEach((item) => {
          data[getFieldsValue().key[item]] = getFieldsValue().value[item]
        })
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
      <p type="warning"><Icon style={{ marginRight: '10px' }} type="exclamation-circle" />This could take a while depending on the actual size of the volume and network bandwidth.</p>
      <BackupLabelInput form={form} />
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
