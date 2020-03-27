import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Checkbox, Alert, Radio } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 15,
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
  selectPVCaction,
  setPreviousChange,
  previousChecked,
  defaultBool = true,
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
      data.previousChecked = previousChecked
      data.createPvcChecked = !nameSpaceDisabled
      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Create PV/PVC',
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
    return (selectPVCaction || []).every((ele) => {
      return !(ele.kubernetesStatus && ele.kubernetesStatus.lastPVCRefAt)
    })
  }

  function hasNewlyEnteredPVC() {
    return (selectPVCaction || []).some((ele) => {
      return ele.kubernetesStatus && !ele.kubernetesStatus.lastPVCRefAt
    })
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="PV Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('pvName', {
            initialValue: '<Volume Name>',
            rules: [
              {
                required: false,
                message: 'Please input pvName',
              },
            ],
          })(<Input disabled={defaultBool} />)}
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
              <Checkbox checked={previousChecked} disabled={hasPreviousPVC()} onChange={onPreviousChange}></Checkbox>
            </FormItem>
          </div>
        </div>
        <FormItem label="Namespace" hasFeedback {...formItemLayout}>
          {getFieldDecorator('namespace', {
            initialValue: item,
            rules: [
              {
                required: !nameSpaceDisabled && (hasNewlyEnteredPVC() || !previousChecked),
                message: 'Please input namespace',
              },
            ],
          })(<Input disabled={nameSpaceDisabled || (previousChecked && !hasNewlyEnteredPVC())} />)}
        </FormItem>
        <FormItem label="PVC Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('pvcName', {
            initialValue: '<Volume Name>',
            rules: [
              {
                required: false,
                message: 'Please input pvcName',
              },
            ],
          })(<Input disabled={defaultBool} />)}
        </FormItem>
      </Form>

      {previousChecked ? <div style={{ marginTop: 20 }}>
        <Alert message="If volume has a default namespace, pvc uses this namepace, if not, it uses the newly entered namespace" type="info" showIcon />
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
  selectPVCaction: PropTypes.array,
  setPreviousChange: PropTypes.func,
  previousChecked: PropTypes.bool,
}

export default Form.create()(modal)
