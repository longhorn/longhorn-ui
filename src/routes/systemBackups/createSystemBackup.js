import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Select } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

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
    title: t('createSystemBackup.title'),
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
                message: t('createSystemBackup.form.name.rules.required'),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label={t('createSystemBackup.form.volumeBackupPolicy.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('volumeBackupPolicy', {
            initialValue: 'if-not-present',
          })(<Select>
            <Option key={'present'} value={'if-not-present'}>{t('createSystemBackup.form.volumeBackupPolicy.options.ifNotPresent')}</Option>
            <Option key={'always'} value={'always'}>{t('createSystemBackup.form.volumeBackupPolicy.options.always')}</Option>
            <Option key={'disabled'} value={'disabled'}>{t('createSystemBackup.form.volumeBackupPolicy.options.disabled')}</Option>
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
  t: PropTypes.func,
}

export default withTranslation()(Form.create()(modal))
