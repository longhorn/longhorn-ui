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
  allBackupTargetsName,
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
        pollInterval: getFieldValue('pollInterval')?.toString() || item.pollInterval.toString(), // pollInterval is a string type
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: t('createBackupTargetModal.title'),
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
                message: t('createBackupTargetModal.form.name.rules.required'),
              },
              {
                validator: (_rule, value, callback) => {
                  if (allBackupTargetsName.includes(value)) {
                    callback(t('createBackupTargetModal.form.name.rules.duplicate', { value }))
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label={t('createBackupTargetModal.form.url.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('backupTargetURL', {
            initialValue: item.backupTargetURL,
          })(<Input />)}
        </FormItem>
        <FormItem label={t('createBackupTargetModal.form.credentialSecret.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('credentialSecret', {
            initialValue: item.credentialSecret,
          })(<Input />)}
        </FormItem>
          <FormItem
            className="create-backup-target-poll-interval-form-item"
            label={t('createBackupTargetModal.form.pollInterval.label')}
            required={false}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {getFieldDecorator('pollInterval', {
                initialValue: item.pollInterval || 0,
              })(<InputNumber min={0} />)}
              <span style={{ marginLeft: 8, marginRight: 8 }}>{t('createBackupTargetModal.form.pollInterval.seconds')}</span>
              <Tooltip title={t('createBackupTargetModal.form.pollInterval.tooltip')}>
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
