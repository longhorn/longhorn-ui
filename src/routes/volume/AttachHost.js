import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select, Checkbox, Alert, Row, Col } from 'antd'
import { ModalBlur } from '../../components'
import { canAttachMoreNodes, getAttachRequests, isAttachedTo } from './helper/sharedBlock'

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
      onOk(getAttachRequests(items, data.host, data.disableFrontend))
    })
  }

  const modalOpts = {
    title: 'Attach to host',
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
  }

  if (!items || items.length === 0) {
    return null
  }

  const options = hosts.filter(host => host.conditions && host.conditions.Ready && host.conditions.Ready.status.toLowerCase() === 'true')
    .filter(host => !items.every(item => isAttachedTo(item, host.id)))
    .map(host => <Select.Option key={host.name} value={host.id}>{host.name}</Select.Option>)

  // RWX volumes can only be manually attached in maintenance mode, except shared block volumes.
  const hasRwxVolume = items && items.some((item) => {
    return item.accessMode === 'rwx' && !item.migratable && !item.sharedBlock
  })
  // A shared block volume in maintenance mode can only be attached to one node.
  const hasAttachedVolume = items.some(canAttachMoreNodes)
  const maintenanceMessage = hasRwxVolume
    ? 'RWX volumes can only be manually attached in maintenance mode.'
    : 'Shared block volumes that are already attached cannot be attached to more nodes in maintenance mode.'

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
          })(<Select style={{ width: '100%' }} size="large" notFoundContent="No more nodes to attach to">
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
          <Alert message={maintenanceMessage} type={hasRwxVolume ? 'warning' : 'info'} showIcon />
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
