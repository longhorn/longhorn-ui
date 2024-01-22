import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber, Alert, Select } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 18,
  },
}

const modal = ({
  item,
  visible,
  onCancel,
  onOk,
  selected,
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
        size: `${getFieldsValue().size}${getFieldsValue().unit}`,
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

  // Convert Units Bi to Gi
  function formatSize() {
    if (selected && selected.size) {
      let sizeMi = parseInt(selected.size, 10) / (1024 * 1024)

      return getFieldsValue().unit === 'Gi'
        ? (sizeMi / 1024).toFixed(2)
        : parseInt(sizeMi, 10)
    }
    return 0
  }

  let minValue = formatSize()

  function unitChange(value) {
    let currentSize = getFieldsValue().size

    if (value === 'Gi') {
      currentSize /= 1024
    } else {
      currentSize *= 1024
    }
    setFieldsValue({ size: currentSize.toFixed(2), unit: value })
  }

  const messageDisableFrontend = selected && selected.disableFrontend ? 'Longhorn will not expand the filesystem for the volume in maintenance mode. There is no available frontend for filesystem expansion' : ''

  return (
    <ModalBlur {...modalOpts}>
      {messageDisableFrontend ? <div style={{ marginBottom: 20 }}>
        <Alert style={{ paddingLeft: '40px' }} message={messageDisableFrontend} type="info" showIcon />
      </div> : ''}
      <Form layout="horizontal" {...formItemLayout} style={{ display: 'flex' }}>
        <FormItem label="Size" style={{ flex: 0.7 }}>
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
                  } else if (value <= formatSize()) {
                    callback(`Size should be larger than ${formatSize()} ${getFieldsValue().unit}`)
                  } else if ((value * 1024) % 1 !== 0 && getFieldsValue().unit === 'Gi') {
                    callback(`Expansion volume size must be a multiple of Mi (1Gi = 1024Mi). e.g ${parseInt(value * 1024, 10) / 1024}`)
                  } else if (value % 1 !== 0 && getFieldsValue().unit === 'Mi') {
                    callback('Decimals are not allowed')
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber style={{ width: '270px' }} />)}
        </FormItem>
        <FormItem style={{ flex: 0.2, marginLeft: 5 }}>
          {getFieldDecorator('unit', {
            initialValue: item.unit,
            rules: [{ required: true, message: 'Please select your unit!' }],
          })(
            <Select
              style={{ width: '100px' }}
              onChange={unitChange}
            >
              <Option value="Mi">Mi</Option>
              <Option value="Gi">Gi</Option>
            </Select>,
          )}
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
