import React from 'react'
import PropTypes from 'prop-types'
import { Form, Checkbox, Alert, Select } from 'antd'
import { ModalBlur } from '../../components'
import { getDetachRequests, getEngineHost, getRequestedHosts, getUIAttachments } from './helper/sharedBlock'

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
    getFieldValue,
  },
}) => {
  // Only a force detach can detach what workloads attached.
  const forceDetach = getFieldValue('forceDetach') || false
  const sharedBlockVolumes = items?.filter(item => item.sharedBlock) || []
  const workloadVolumes = sharedBlockVolumes.filter(item => getUIAttachments(item).length === 0)
  const nothingToDetach = !forceDetach && workloadVolumes.length > 0 && workloadVolumes.length === items.length

  function handleOk() {
    // The modal also calls this on Enter, when the OK button is disabled.
    if (nothingToDetach) {
      return
    }
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
      }
      onOk(items?.flatMap(item => getDetachRequests(item, data.forceDetach, data.hosts)))
    })
  }
  if (!items) {
    return null
  }
  const sharedBlockVolume = items.length === 1 ? sharedBlockVolumes[0] : null
  const uiHosts = getUIAttachments(sharedBlockVolume).map(({ nodeID }) => nodeID)
  const selectedHosts = getFieldValue('hosts') || []

  const modalOpts = {
    title: `Are you sure you want to detach volume ${items.map((item) => `${item.name}`).join(', ')} ?`,
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
    okDisabled: nothingToDetach,
  }

  const getSharedBlockAlert = () => {
    if (forceDetach && sharedBlockVolume) {
      return { type: 'warning', description: `Force Detach detaches the volume from all nodes: ${getRequestedHosts(sharedBlockVolume).join(', ')}.` }
    }
    if (!forceDetach && workloadVolumes.length > 0) {
      return { type: 'warning', description: `${workloadVolumes.map(item => item.name).join(', ')} can only be detached by scaling down the workloads that use it, or with Force Detach.` }
    }
    const engineHost = getEngineHost(sharedBlockVolume)
    if (selectedHosts.includes(engineHost) && getRequestedHosts(sharedBlockVolume).some(host => !selectedHosts.includes(host))) {
      return { type: 'info', description: `The engine runs on ${engineHost}. The volume stays available there until it is detached from all nodes.` }
    }
    return null
  }
  const sharedBlockAlert = getSharedBlockAlert()

  const getAlertDescription = (item) => {
    // Detaching a shared block volume from a host leaves the workloads on the other attachments alone.
    if (item.sharedBlock && !forceDetach) return null
    const va = item?.volumeAttachment
    if (!va) return null

    const attachments = Object.values(va.attachments || {})

    if (attachments.some(att => att.attachmentType === 'csi-attacher' && att.satisfied)) {
      return (
        <div>
          Forcing this volume to detach could break its connection to Kubernetes&apos;s VolumeAttachment resources. This could prevent your applications from attaching volumes correctly, potentially causing Pods to fail or leading to data loss.
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
        {uiHosts.length > 0 && (
          <FormItem label="Host" {...formItemLayout}>
            {forceDetach ? <Select mode="multiple" disabled value={getRequestedHosts(sharedBlockVolume)} /> : getFieldDecorator('hosts', {
              initialValue: uiHosts.length === 1 ? uiHosts : [],
              rules: [{ type: 'array', required: true, message: 'Please select a host to detach' }],
            })(<Select mode="multiple">
              {uiHosts.map(host => <Select.Option key={host} value={host}>{host}</Select.Option>)}
            </Select>)}
          </FormItem>
        )}
        <FormItem label="Force Detach" valuepropname={'checked'} {...formItemLayoutCheckBox}>
          {getFieldDecorator('forceDetach', {
            initialValue: false,
            valuePropName: 'checked',
          })(<Checkbox></Checkbox>)}
        </FormItem>
        {sharedBlockAlert && <Alert style={{ marginBottom: 12 }} description={sharedBlockAlert.description} type={sharedBlockAlert.type} showIcon />}
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
