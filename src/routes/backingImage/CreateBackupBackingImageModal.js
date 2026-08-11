import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select, Icon } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 15,
  },
}

const modal = ({
  backingImage,
  backupTargets,
  visible,
  onCancel,
  onOk,
  form: {
    getFieldDecorator,
    getFieldValue,
  },
  t,
}) => {
  function handleOk() {
    const backupTarget = backupTargets.find(bkTarget => bkTarget.name === getFieldValue('backupTargetName'))
    if (backupTarget) {
      const url = backingImage.actions?.backupBackingImageCreate
      const payload = {
        ...backingImage,
        backingImageName: backingImage.name,
        backupTargetName: backupTarget.name,
        backupTargetURL: backupTarget.backupTargetURL,
      }
      onOk(url, payload)
    }
  }

  const modalOpts = {
    title: t('createBackupBackingImageModal.title'),
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <p type="warning">
        <Icon style={{ marginRight: '10px' }} type="exclamation-circle" />{t('createBackupBackingImageModal.warningMessage', { name: backingImage.name })}
      </p>
      <div style={{ display: 'flex' }}>
        <FormItem label={t('createBackupBackingImageModal.form.backupTarget.label')} style={{ width: '100%' }} {...formItemLayout}>
          {getFieldDecorator('backupTargetName', {
            initialValue: backupTargets.find(bk => bk.name === 'default')?.name || '',
          })(
          <Select style={{ width: '100%' }}>
            {backupTargets.map(bkTarget => <Option key={bkTarget.name} disabled={bkTarget.available === false} value={bkTarget.name}>{bkTarget.name}</Option>)}
          </Select>
          )}
        </FormItem>
      </div>
    </ModalBlur>
  )
}

modal.propTypes = {
  backingImage: PropTypes.object,
  backupTargets: PropTypes.array,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  t: PropTypes.func,
}

export default withTranslation()(Form.create()(modal))
