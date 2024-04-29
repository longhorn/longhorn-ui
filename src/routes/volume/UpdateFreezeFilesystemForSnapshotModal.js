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
  option,
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
      let url = item?.actions?.updateFreezeFilesystemForSnapshot

      onOk(data, url)
    })
  }

  const modalOpts = {
    title: 'Update Freeze Filesystem For Snapshot',
    visible,
    onCancel,
    width: 600,
    onOk: handleOk,
  }
  if (!item) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Option" {...formItemLayout}>
          {getFieldDecorator('freezeFilesystemForSnapshot', {
            initialValue: item?.freezeFilesystemForSnapshot,
          })(<Select>
          { option.map(ele => <Option key={ele.key} value={ele.value}>{ele.key}</Option>) }
          </Select>)}
          <Alert
            style={{ marginTop: 10 }}
            message="This action may override the global setting “Freeze Filesystem For Snapshot”"
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
  option: PropTypes.array,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
