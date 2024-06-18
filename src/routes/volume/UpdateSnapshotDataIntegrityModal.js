import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select, Alert } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
}

const modal = ({
  item,
  options,
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
      let url = item && item.actions && item.actions.updateSnapshotDataIntegrity

      onOk(data, url)
    })
  }

  const modalOpts = {
    title: 'Snapshot Data Integrity',
    visible,
    onCancel,
    onOk: handleOk,
  }
  if (!item) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Option" {...formItemLayout}>
          {getFieldDecorator('snapshotDataIntegrity', {
            initialValue: item.snapshotDataIntegrity,
          })(<Select>
          { options.map(option => <Option key={option.key} value={option.value}>{option.key}</Option>) }
          </Select>)}
          <Alert
            style={{ marginTop: 10 }}
            message="This action may override the global setting “Snapshot Data Integrity”"
            type="warning"
          />
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  options: PropTypes.array,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
