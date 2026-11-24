import React from 'react'
import PropTypes from 'prop-types'
import { Form, Checkbox, Alert, Select } from 'antd'
import { ModalBlur } from '../../components'
import { getDetachNotices, getDetachRequests, getSharedBlockNodes, getUIAttachments, hasNothingToDetach } from './helper/sharedBlock'

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

// Enter picks a host in the list. The modal would take it as OK.
const keepEnterInSelect = (e) => {
  if (e.keyCode === 13) {
    e.nativeEvent.stopImmediatePropagation()
  }
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
  const forceDetach = getFieldValue('forceDetach') || false
  const nothingToDetach = hasNothingToDetach(items || [], forceDetach)

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
  const sharedBlockVolume = items.length === 1 && items[0].sharedBlock ? items[0] : null
  const uiHosts = [...new Set(getUIAttachments(sharedBlockVolume).map(({ nodeID }) => nodeID))]
  const defaultHosts = uiHosts.length === 1 ? uiHosts : []
  const notices = getDetachNotices(items, forceDetach, getFieldValue('hosts') || defaultHosts)

  const modalOpts = {
    title: `Are you sure you want to detach volume ${items.map((item) => `${item.name}`).join(', ')} ?`,
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
    okDisabled: nothingToDetach,
  }

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
          <FormItem label="Host" style={forceDetach ? { display: 'none' } : undefined} {...formItemLayout}>
            {getFieldDecorator('hosts', {
              initialValue: defaultHosts,
              rules: [{ type: 'array', required: !forceDetach, message: 'Please select a host to detach' }],
            })(<Select mode="multiple" onInputKeyDown={keepEnterInSelect}>
              {uiHosts.map(host => <Select.Option key={host} value={host}>{host}</Select.Option>)}
            </Select>)}
          </FormItem>
        )}
        {sharedBlockVolume && forceDetach && (
          <FormItem label="Host" {...formItemLayout}>
            <Select mode="multiple" disabled value={getSharedBlockNodes(sharedBlockVolume).map(({ host }) => host)} />
          </FormItem>
        )}
        <FormItem label="Force Detach" valuepropname={'checked'} {...formItemLayoutCheckBox}>
          {getFieldDecorator('forceDetach', {
            initialValue: false,
            valuePropName: 'checked',
          })(<Checkbox></Checkbox>)}
        </FormItem>
        {notices.map(({ type, text }) => <Alert key={text} style={{ marginBottom: 12 }} description={text} type={type} showIcon />)}
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
