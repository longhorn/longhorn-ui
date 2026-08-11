import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

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
  t,
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
    title: t('updateBackupTargetModal.title.updateBackupTarget'),
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
        <FormItem label={t('updateBackupTargetModal.form.backupTarget.label')} {...formItemLayout}>
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
  t: PropTypes.func.isRequired,
}

export default withTranslation()(Form.create()(modal))
