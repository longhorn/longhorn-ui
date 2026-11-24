import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select, Checkbox, Alert, Row, Col } from 'antd'
import { ModalBlur } from '../../components'
import { canAttachMoreNodes, getAttachRequests, isAttachedTo, isMaintenanceConflict, isRegularRwx } from './helper/sharedBlock'

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
    span: 5,
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
  hosts,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    getFieldValue,
  },
}) => {
  const maintenanceConflict = isMaintenanceConflict(items || [])

  function handleOk() {
    // The modal also calls this on Enter, when the OK button is disabled.
    if (maintenanceConflict) {
      return
    }
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
      }
      onOk(getAttachRequests(items, data.host, data.disableFrontend))
    })
  }

  const modalOpts = {
    title: 'Attach to host',
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
    okDisabled: maintenanceConflict,
  }

  if (!items || items.length === 0) {
    return null
  }

  const options = hosts.filter(host => host.conditions && host.conditions.Ready && host.conditions.Ready.status.toLowerCase() === 'true')
    .filter(host => !items.every(item => isAttachedTo(item, host.id)))
    .map(host => <Select.Option key={host.name} value={host.id}>{host.name}</Select.Option>)

  // RWX volumes can only be manually attached in maintenance mode, except shared block volumes.
  const hasRwxVolume = items.some(isRegularRwx)
  // A shared block volume in maintenance mode can only be attached to one node.
  const hasAttachedVolume = items.some(canAttachMoreNodes)
  const getMaintenanceAlert = () => {
    if (maintenanceConflict) {
      return { type: 'error', message: 'RWX volumes can only be manually attached in maintenance mode, and shared block volumes that are already attached cannot be. Attach them separately.' }
    }
    return hasRwxVolume
      ? { type: 'warning', message: 'RWX volumes can only be manually attached in maintenance mode.' }
      : { type: 'info', message: 'Shared block volumes that are already attached cannot be attached to more nodes in maintenance mode.' }
  }
  const selectedHost = getFieldValue('host')
  const skippedVolumes = items.filter(item => isAttachedTo(item, selectedHost)).map(item => item.name)

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Host" hasFeedback {...formItemLayout}>
          {getFieldDecorator('host', {
            rules: [
              {
                required: true,
                message: 'Please select a host to attach',
              },
            ],
          })(<Select style={{ width: '100%' }} size="large" notFoundContent={hasAttachedVolume ? 'No more nodes to attach to' : undefined}>
            {options}
          </Select>)}
        </FormItem>
        <FormItem label="Maintenance" valuepropname={'checked'} {...formItemLayoutCheckBox}>
          {getFieldDecorator('disableFrontend', {
            initialValue: hasRwxVolume,
            valuePropName: 'checked',
            rules: [
              {
                required: false,
              },
            ],
          })(<Checkbox disabled={hasRwxVolume || hasAttachedVolume}></Checkbox>)}
        </FormItem>
      </Form>
      { hasRwxVolume || hasAttachedVolume ? <Row>
        <Col span={18} style={{ marginLeft: 100 }}>
          <Alert {...getMaintenanceAlert()} showIcon />
        </Col>
      </Row> : '' }
      { skippedVolumes.length > 0 ? <Row style={{ marginTop: 12 }}>
        <Col span={18} style={{ marginLeft: 100 }}>
          <Alert message={`Already attached to ${selectedHost}, so skipped: ${skippedVolumes.join(', ')}.`} type="info" showIcon />
        </Col>
      </Row> : '' }
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  items: PropTypes.array,
  onOk: PropTypes.func,
  hosts: PropTypes.array,
}

export default Form.create()(modal)
