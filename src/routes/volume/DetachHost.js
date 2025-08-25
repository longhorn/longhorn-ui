import React from 'react'
import PropTypes from 'prop-types'
import { Form, Checkbox, Alert } from 'antd'
import { ModalBlur } from '../../components'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
}

const formItemLayoutCheckBox = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 12,
  },
}

const modal = ({
  items,
  visible,
  onCancel,
  onOk,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
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
      const params = items?.map(item => {
        return {
          url: item.actions?.detach,
          data: {
            forceDetach: data.forceDetach,
            attachmentID: 'longhorn-ui',
            hostId: '',
          },
        }
      })
      onOk(params)
    })
  }
  if (!items) {
    return null
  }
  const modalOpts = {
    title: `Are you sure you want to detach volume ${items.map((item) => `${item.name}`).join(', ')} ?`,
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
  }

  const getAlertDescription = (item) => {
    const va = item?.volumeAttachment
    if (!va) return null

    const attachments = Object.values(va.attachments || {})

    if (attachments.some(att => att.attachmentType === 'csi-attacher')) {
      return (
        <div>
          Force-detaching this volume may cause it to become inconsistent with Kubernetes VolumeAttachment resources.<br />
          This can prevent workloads from attaching the volume correctly and may lead to Pod failures or potential data loss.
        </div>
      )
    }

    if (item?.kubernetesStatus?.workloadsStatus && !item.kubernetesStatus.lastPodRefAt) {
      return (
        <div>
          Detaching a Volume when it is being used by a running Kubernetes Pod will result in
          crashing of the Pod and possible loss of data. The Volume cannot be used by the
          Kubernetes again until the original Pod is deleted. Are you sure you want to detach the volume?
        </div>
      )
    }

    return null
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal" {...formItemLayout}>
        <FormItem label="Force Detach" valuepropname={'checked'} {...formItemLayoutCheckBox}>
          {getFieldDecorator('forceDetach', {
            initialValue: false,
            valuePropName: 'checked',
          })(<Checkbox></Checkbox>)}
        </FormItem>
        {items.some(item => getAlertDescription(item)) && (
          <Alert
            description={getAlertDescription(items.find(item => getAlertDescription(item)))}
            type="warning"
            showIcon
          />
        )}
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  items: PropTypes.array,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
