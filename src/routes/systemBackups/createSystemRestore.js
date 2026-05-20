import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 15,
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
  t,
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
    title: t('createSystemRestore.title'),
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('common.name')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: t('createSystemRestore.form.name.rules.required'),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label={t('createSystemRestore.form.version.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('version', {
            initialValue: item.version,
            rules: [
              {
                required: true,
                message: t('createSystemRestore.form.version.rules.required'),
              },
            ],
          })(<Input disabled={true} />)}
        </FormItem>
        <FormItem label={t('createSystemRestore.form.systemBackup.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('systemBackup', {
            initialValue: item.systemBackup,
            rules: [
              {
                required: true,
                message: t('createSystemRestore.form.systemBackup.rules.required'),
              },
            ],
          })(<Input disabled={true} />)}
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
  t: PropTypes.func,
}

export default withTranslation()(Form.create()(modal))
