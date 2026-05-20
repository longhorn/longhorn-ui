import React from 'react'
import PropTypes from 'prop-types'
import { Form, Checkbox, Alert } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

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
    title: t('detachHost.title', { volumes: items.map((item) => `${item.name}`).join(', ') }),
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
  }

  const getAlertDescription = (item) => {
    const va = item?.volumeAttachment
    if (!va) return null

    const attachments = Object.values(va.attachments || {})

    if (attachments.some(att => att.attachmentType === 'csi-attacher' && att.satisfied)) {
      return (
        <div>
          {t('detachHost.alerts.csiAttacherWarning')}
        </div>
      )
    }

    if (item?.kubernetesStatus?.workloadsStatus && !item.kubernetesStatus.lastPodRefAt) {
      return (
        <div>
          {t('detachHost.alerts.runningPodWarning')}
        </div>
      )
    }

    return null
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal" {...formItemLayout}>
        <FormItem label={t('detachHost.fields.forceDetach')} valuepropname={'checked'} {...formItemLayoutCheckBox}>
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
  t: PropTypes.func,
}

export default Form.create()(withTranslation()(modal))
