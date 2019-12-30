import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber, Alert } from 'antd'
import { ModalBlur } from '../../../components'
import { formatMib } from '../../../utils/formater'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 19,
  },
}

const modal = ({
  visible,
  onCancel,
  onOk,
  selected,
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
      if (data.size) {
        data.size = `${data.size}Gi`
      }

      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Expand Volume',
    visible,
    onCancel,
    onOk: handleOk,
  }

  function formatSize() {
    if (selected && selected.size) {
      let sizeHasUnit = formatMib(selected.size)
      return Number(sizeHasUnit.split(' ')[0])
    }
    return 0
  }

  function noticePVCText() {
    if (selected && selected.kubernetesStatus) {
      if (selected.kubernetesStatus.pvName && (!selected.kubernetesStatus.pvcName || selected.kubernetesStatus.lastPVCRefAt)) {
        return 'The capacity of related PV will not be updated'
      } else if (selected.kubernetesStatus.pvName && selected.kubernetesStatus.pvcName && !selected.kubernetesStatus.lastPVCRefAt) {
        return 'The capacity of related PV and PVC will not be updated'
      } else {
        return ''
      }
    }
  }

  const messagePvAndPVC = noticePVCText()
  const messageDisableFrontend = selected && selected.disableFrontend ? 'Longhorn will not expand the filesystem for the volume in maintenance mode. There is no available frontend for filesystem expansion' : ''

  const minValue = formatSize()

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        {messagePvAndPVC ? <div style={{ marginBottom: 20 }}>
          <Alert style={{ paddingLeft: '40px' }} message={messagePvAndPVC} type="info" showIcon />
        </div> : ''}
        {messageDisableFrontend ? <div style={{ marginBottom: 20 }}>
          <Alert style={{ paddingLeft: '40px' }} message={messageDisableFrontend} type="info" showIcon />
        </div> : ''}
        <FormItem label="Size" hasFeedback {...formItemLayout}>
          {getFieldDecorator('size', {
            initialValue: minValue,
            rules: [
              {
                required: true,
                message: 'Please input volume size',
              }, {
                validator: (rule, value, callback) => {
                  if (value === '' || typeof value !== 'number') {
                    callback()
                    return
                  }
                  if (value < 0 || value > 65536) {
                    callback('The value should be between 0 and 65535')
                  } else if (value <= minValue) {
                    callback(`Size should be larger than ${minValue} Gi`)
                  } else if (!/^\d+([.]\d{1,2})?$/.test(value)) {
                    callback('This value should have at most two decimal places')
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber min={minValue} style={{ width: '320px' }} />)}
          <span style={{ marginLeft: '10px' }}>Gi</span>
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
  selected: PropTypes.object,
  onOk: PropTypes.func,
  hosts: PropTypes.array,
}

export default Form.create()(modal)
