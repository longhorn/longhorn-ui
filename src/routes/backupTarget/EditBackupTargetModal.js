import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Icon, InputNumber, Tooltip } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 6,
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
    getFieldValue,
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
        credentialSecret: getFieldValue('credentialSecret')?.trim() || '',
        backupTargetURL: getFieldValue('backupTargetURL')?.trim() || '',
        pollInterval: getFieldValue('pollInterval')?.toString() || item.pollInterval.toString(), // pollInterval should be second number and in string type
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: t('editBackupTargetModal.title', { name: item.name }),
    visible,
    onCancel,
    width: 700,
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
                message: t('editBackupTargetModal.form.name.rules.required'),
              },
            ],
          })(<Input disabled />)}
        </FormItem>
        <FormItem label={t('editBackupTargetModal.form.url.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('backupTargetURL', {
            initialValue: item.backupTargetURL,
          })(<Input />)}
        </FormItem>
        <FormItem label={t('editBackupTargetModal.form.credentialSecret.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('credentialSecret', {
            initialValue: item.credentialSecret,
          })(<Input />)}
        </FormItem>
          <FormItem
            className="create-backup-target-poll-interval-form-item"
            label={t('editBackupTargetModal.form.pollInterval.label')}
            required={false}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {getFieldDecorator('pollInterval', {
                initialValue: item.pollInterval,
              })(<InputNumber min={0} />)}
              <span style={{ marginLeft: 8, marginRight: 8 }}>{t('editBackupTargetModal.form.pollInterval.seconds')}</span>
              <Tooltip title={t('editBackupTargetModal.form.pollInterval.tooltip')}>
                <Icon type="question-circle-o" style={{ alignSelf: 'center' }} />
              </Tooltip>
            </div>
          </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  item: PropTypes.object,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  form: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
}

export default withTranslation()(Form.create()(modal))
