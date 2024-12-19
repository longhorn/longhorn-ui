import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
}

const modal = ({
  items,
  backupTargets,
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
      const data = { ...getFieldsValue() }
      const urls = items.reduce((final, item) => {
        final.push(item.actions.updateBackupTargetName)
        return final
      }, [])
      onOk(data, urls)
    })
  }

  const modalOpts = {
    title: 'Update Backup Target',
    visible,
    onCancel,
    onOk: handleOk,
  }
  if (!items) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="BackupTarget" {...formItemLayout}>
        {getFieldDecorator('backupTargetName', {
          initialValue: 'default',
        })(<Select>
            { backupTargets.map(bt => <Option key={bt.name} disabled={bt.available === false} value={bt.name}>{bt.name}</Option>)}
          </Select>)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  backupTargets: PropTypes.array,
  onCancel: PropTypes.func,
  items: PropTypes.array,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
