import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 14,
  },
}

const modal = ({
  item,
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

      let url = item && item.actions && item.actions.updateReplicaCount

      onOk(data, url)
    })
  }

  const modalOpts = {
    title: t('updateReplicaCount.title'),
    visible,
    onCancel,
    onOk: handleOk,
  }
  if (!item) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('common.numberOfReplicas')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('replicaCount', {
            initialValue: item.numberOfReplicas,
            rules: [
              {
                required: true,
                message: t('common.validation.replicasRequired'),
              },
              {
                validator: (rule, value, callback) => {
                  if (value < 1 || value > 20 || !/^\d+$/.test(value)) {
                    callback(t('common.validation.valueBetween', { min: 1, max: 20 }))
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber min={1} max={20} step={1} />)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  t: PropTypes.func,
}

export default Form.create()(withTranslation()(modal))
