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
  items,
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
      let urls = items.map((item) => item?.actions?.updateUnmapMarkSnapChainRemoved)

      onOk(data, urls)
    })
  }

  const modalOpts = {
    title: 'Allow snapshots removal during trim',
    visible,
    onCancel,
    width: 600,
    onOk: handleOk,
  }
  if (!items || items?.length === 0) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Option" {...formItemLayout}>
          {getFieldDecorator('unmapMarkSnapChainRemoved', {
            initialValue: 'ignored',
          })(<Select>
          { option.map(ele => <Option key={ele.key} value={ele.value}>{ele.key}</Option>) }
          </Select>)}
          <Alert
            style={{ marginTop: 10 }}
            message="This action may override the global setting “Remove Snapshots During Filesystem Trim”"
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
  items: PropTypes.array,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
