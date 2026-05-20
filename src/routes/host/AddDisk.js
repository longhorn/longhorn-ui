import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Modal } from 'antd'
import { withTranslation } from 'react-i18next'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 6,
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
  t
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
        key: item.key,
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: t('addDisk.title'),
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <Modal {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('addDisk.path.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('path', {
            initialValue: item.path,
            rules: [
              {
                required: true,
                message: t('common.validation.required'),
              },
            ],
          })(<Input placeholder={t('addDisk.path.placeholder')} />)}
        </FormItem>
        <FormItem label={t('addDisk.labels.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('labels', {
            initialValue: item.labels,
            rules: [
              {
                required: true,
                message: t('common.validation.required'),
              },
            ],
          })(<Input placeholder={t('addDisk.labels.placeholder')} />)}
        </FormItem>
      </Form>
    </Modal>
  )
}

modal.propTypes = {
  t: PropTypes.func,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
}

export default withTranslation()(Form.create()(modal))
