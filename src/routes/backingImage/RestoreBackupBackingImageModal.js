import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Select, } from 'antd'
import { ModalBlur } from '../../components'

const { Item: FormItem } = Form
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 12,
  },
}

const modal = ({
  item = {},
  visible,
  onOk,
  onCancel,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldValue,
  },
  v1DataEngineEnabled = true,
  v2DataEngineEnabled = false
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        secret: getFieldValue('secret') || '',
        secretNamespace: getFieldValue('secretNamespace') || '',
        dataEngine: getFieldValue('dataEngine') || 'v1'
      }
      onOk(item, data)
    })
  }

  const modalOpts = {
    title: 'Restore Backing Image',
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Backup" {...formItemLayout}>
          {getFieldDecorator('backup', { initialValue: item.name || '' })(<Input disabled={!!item.name} />)}
        </FormItem>
        {item.secret && (
          <FormItem label="Secret" hasFeedback {...formItemLayout}>
            {getFieldDecorator('secret', { initialValue: item.secret })(<Input disabled />)}
          </FormItem>
        )}
        {item.secretNamespace && (
          <FormItem label="Secret Namespace" hasFeedback {...formItemLayout}>
            {getFieldDecorator('secretNamespace', { initialValue: item.secretNamespace })(<Input disabled />)}
          </FormItem>
        )}
         <FormItem label="Data Engine" hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataEngine', {
            initialValue: v1DataEngineEnabled ? 'v1' : 'v2',
            rules: [
              {
                validator: (_rule, value, callback) => {
                  if (value === 'v1' && !v1DataEngineEnabled) {
                    callback('v1 data engine is not enabled')
                  } else if (value === 'v2' && !v2DataEngineEnabled) {
                    callback('v2 data engine is not enabled')
                  }
                  callback()
                },
              },
            ],
          })(<Select>
            <Option key={'v1'} value={'v1'}>v1</Option>
            <Option key={'v2'} value={'v2'}>v2</Option>
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
  v1DataEngineEnabled: PropTypes.bool,
  v2DataEngineEnabled: PropTypes.bool,
}

export default Form.create()(modal)
