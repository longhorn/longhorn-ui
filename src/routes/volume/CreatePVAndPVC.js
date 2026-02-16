import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Checkbox, Alert, Radio, Icon, Tooltip } from 'antd'
import { ModalBlur } from '../../components'
import style from './CreatePVAndPVC.less'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 14,
  },
}

const formItemLayout2 = {
  labelCol: {
    span: 14,
  },
  wrapperCol: {
    span: 2,
  },
}

const modal = ({
  item,
  visible,
  onCancel,
  onOk,
  onChange,
  nameSpaceDisabled,
  selectedRows,
  setPreviousChange,
  previousChecked,
  defaultBool = true,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    setFieldsValue,
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
      data.previousChecked = previousChecked
      data.createPvcChecked = !nameSpaceDisabled
      onOk(data)
    })
  }

  const modalOpts = {
    title: t('createPVAndPVC.title'),
    visible,
    onCancel,
    onOk: handleOk,
  }

  function onInnerChange() {
    setFieldsValue({ namespace: '' })
    onChange()
  }

  function onPreviousChange(value) {
    setPreviousChange(value.target.checked)
  }

  function hasPreviousPVC() {
    return (selectedRows || []).every((ele) => {
      return !(ele.kubernetesStatus && ele.kubernetesStatus.lastPVCRefAt)
    })
  }

  function hasNewlyEnteredPVC() {
    return (selectedRows || []).some((ele) => {
      return ele.kubernetesStatus && !ele.kubernetesStatus.lastPVCRefAt
    })
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('createPVAndPVC.fields.pvName')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('pvName', {
            initialValue: t('createPVAndPVC.placeholders.volumeName'),
            rules: [
              {
                required: false,
                message: t('createPVAndPVC.validation.pvNameRequired'),
              },
            ],
          })(<Input disabled={defaultBool} />)}
        </FormItem>
        <FormItem label={t('columns.accessMode')} {...formItemLayout}>
          <Input disabled={true} value={t('createPVAndPVC.placeholders.volumeAccessMode')} />
        </FormItem>
        <FormItem label={t('createPVAndPVC.fields.storageClassName')} {...formItemLayout}>
          {getFieldDecorator('storageClassName', {
            initialValue: '',
          })(<div className={style.storageClassName}>
            <Input disabled={item.pvNameDisabled} />
            <Tooltip title={t('createPVAndPVC.tooltips.storageClassName')}>
              <span className={style.icon}>
                <Icon type="info-circle" />
              </span>
            </Tooltip>
          </div>)}
        </FormItem>
        <FormItem label={t('createPVAndPVC.fields.fileSystem')} {...formItemLayout}>
          {getFieldDecorator('fsType', {
            initialValue: 'ext4',
          })(
            <Radio.Group>
              <Radio value="ext4">Ext4</Radio>
              <Radio value="xfs">XFS</Radio>
            </Radio.Group>,
          )}
        </FormItem>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <FormItem label={t('createPVAndPVC.fields.createPVC')} hasFeedback {...formItemLayout2}>
              <Checkbox checked={!nameSpaceDisabled} onChange={onInnerChange}></Checkbox>
            </FormItem>
          </div>
          <div style={{ flex: 1 }}>
            <FormItem label={t('createPVAndPVC.fields.usePreviousPVC')} hasFeedback {...formItemLayout2}>
              <Checkbox checked={previousChecked} disabled={hasPreviousPVC()} onChange={onPreviousChange}></Checkbox>
            </FormItem>
          </div>
        </div>
        <FormItem label={t('createPVAndPVC.fields.namespace')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('namespace', {
            initialValue: item,
            rules: [
              {
                required: !nameSpaceDisabled && (hasNewlyEnteredPVC() || !previousChecked),
                message: t('createPVAndPVC.validation.namespaceRequired'),
              },
            ],
          })(<Input disabled={nameSpaceDisabled || (previousChecked && !hasNewlyEnteredPVC())} />)}
        </FormItem>
        <FormItem label={t('createPVAndPVC.fields.pvcName')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('pvcName', {
            initialValue: t('createPVAndPVC.placeholders.volumeName'),
            rules: [
              {
                required: false,
                message: t('createPVAndPVC.validation.pvcNameRequired'),
              },
            ],
          })(<Input disabled={defaultBool} />)}
        </FormItem>
      </Form>

      {previousChecked ? <div style={{ marginTop: 20 }}>
        <Alert message={t('createPVAndPVC.previousPVCMessage')} type="info" showIcon />
      </div> : ''}
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.string,
  onOk: PropTypes.func,
  onChange: PropTypes.func,
  hosts: PropTypes.array,
  nameSpaceDisabled: PropTypes.bool,
  defaultBool: PropTypes.bool,
  selectedRows: PropTypes.array,
  setPreviousChange: PropTypes.func,
  previousChecked: PropTypes.bool,
  t: PropTypes.func,
}

export default Form.create()(withTranslation()(modal))
