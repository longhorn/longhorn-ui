import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Select } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 9,
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
      if (data.name && typeof data.name === 'string') {
        data.name = data.name.trimLeftAndRight()
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Create System Backup',
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: 'Please input System backup name',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="Volume Backup Policy" hasFeedback {...formItemLayout}>
          {getFieldDecorator('volumeBackupPolicy', {
            initialValue: 'if-not-present',
          })(<Select>
            <Option key={'present'} value={'if-not-present'}>If-Not-Present</Option>
            <Option key={'always'} value={'always'}>Always</Option>
            <Option key={'disabled'} value={'disabled'}>Disabled</Option>
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
}

export default Form.create()(modal)
