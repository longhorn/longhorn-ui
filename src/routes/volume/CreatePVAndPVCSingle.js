import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Checkbox, Radio, Select, Icon, Tooltip } from 'antd'
import { ModalBlur } from '../../components'
import style from './CreatePVAndPVC.less'
const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 9,
  },
  wrapperCol: {
    span: 13,
  },
}
const formItemLayout2 = {
  labelCol: {
    span: 18,
  },
  wrapperCol: {
    span: 2,
  },
}
const modal = ({
  item,
  visible,
  onCancel,
  selected,
  onOk,
  onChange,
  setPreviousChange,
  nameSpaceDisabled,
  previousChecked,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    setFieldsValue,
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
      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Create PV/PVC',
    visible,
    onCancel,
    onOk: handleOk,
  }

  function onInnerChange(value) {
    value.target.checked ? setFieldsValue({ namespace: '', pvcName: item.defaultPVCName }) : setFieldsValue({ namespace: '', pvcName: '' })
    onChange()
  }

  function onPreviousChange(value) {
    value.target.checked && !nameSpaceDisabled ? setFieldsValue({ namespace: selected.namespace, pvcName: selected.pvcName }) : setFieldsValue({ namespace: '', pvcName: '' })
    setPreviousChange(value.target.checked)
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="PV Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('pvName', {
            initialValue: item.defaultPVName,
            rules: [
              {
                required: true,
                message: 'Please input pvName',
              },
            ],
          })(<Input disabled={item.pvNameDisabled} />)}
        </FormItem>
        <FormItem label="Access Mode" {...formItemLayout}>
          <Select disabled={true} value={item.accessMode}>
            <Option key={'ReadWriteOnce'} value={'rwo'}>ReadWriteOnce</Option>
            <Option key={'ReadWriteMany'} value={'rwx'}>ReadWriteMany</Option>
          </Select>
        </FormItem>
        { (item.encrypted && !item.pvNameDisabled) && <FormItem label="Secret Namespace" {...formItemLayout}>
          {getFieldDecorator('secretNamespace', {
            initialValue: '',
          })(<Input disabled={false} />)}
        </FormItem>}
        { (item.encrypted && !item.pvNameDisabled) && <FormItem label="Secret Name" {...formItemLayout}>
          {getFieldDecorator('secretName', {
            initialValue: '',
          })(<Input disabled={false} />)}
        </FormItem>}
        <FormItem label="Storage Class Name" {...formItemLayout}>
          {getFieldDecorator('storageClassName', {
            initialValue: '',
          })(<div className={style.storageClassName}>
            <Input disabled={item.pvNameDisabled} />
            <Tooltip title={'If no value is provided, Longhorn will first utilize the storageClassName stored in the backup volume if the volume is being restored from a backup. Otherwise, Longhorn will use the storageClassName specified in the default setting.'}>
              <span className={style.icon}>
                <Icon type="info-circle" />
              </span>
            </Tooltip>
          </div>)}
        </FormItem>
        <FormItem label="File System" {...formItemLayout}>
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
            <FormItem label="Create PVC" hasFeedback {...formItemLayout2}>
              <Checkbox checked={!nameSpaceDisabled} onChange={onInnerChange}></Checkbox>
            </FormItem>
          </div>
          <div style={{ flex: 1 }}>
            <FormItem label="Use Previous PVC" hasFeedback {...formItemLayout2}>
              <Checkbox checked={previousChecked} disabled={!selected.lastPVCRefAt || nameSpaceDisabled} onChange={onPreviousChange}></Checkbox>
            </FormItem>
          </div>
        </div>
        <FormItem label="PVC Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('pvcName', {
            initialValue: item.defaultPVCName,
            rules: [
              {
                required: !nameSpaceDisabled,
                message: 'Please input pvcName',
              },
            ],
          })(<Input disabled={nameSpaceDisabled} />)}
        </FormItem>
        <FormItem label="Namespace" hasFeedback {...formItemLayout}>
          {getFieldDecorator('namespace', {
            initialValue: item.previousNamespace,
            rules: [
              {
                required: !nameSpaceDisabled,
                message: 'Please input namespace',
              },
            ],
          })(<Input disabled={nameSpaceDisabled} />)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  previousChecked: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  selected: PropTypes.object,
  onOk: PropTypes.func,
  onChange: PropTypes.func,
  hosts: PropTypes.array,
  nameSpaceDisabled: PropTypes.bool,
  setPreviousChange: PropTypes.func,
}

export default Form.create()(modal)
