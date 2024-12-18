import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select, Icon } from 'antd'
import { ModalBlur } from '../../components'

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
    title: 'Create Backup Backing Image',
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <p type="warning">
        <Icon style={{ marginRight: '10px' }} type="exclamation-circle" />Choose a backup target to backup <strong>{backingImage.name}</strong> backing image
      </p>
      <div style={{ display: 'flex' }}>
        <FormItem label="Backup Target" style={{ width: '100%' }} {...formItemLayout}>
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
}

export default Form.create()(modal)
