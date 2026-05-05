import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
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
    getFieldValue,
  },
  t,
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const minNumberOfCopies = getFieldValue('minNumberOfCopies')
      onOk(item, minNumberOfCopies)
    })
  }

  const modalOpts = {
    title: t('updateMinCopiesCount.title'),
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
        <FormItem label={t('updateMinCopiesCount.form.minNumberOfCopies.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('minNumberOfCopies', {
            initialValue: item.minNumberOfCopies,
            rules: [
              {
                required: true,
                message: t('updateMinCopiesCount.form.minNumberOfCopies.rules.required'),
              },
            ],
          })(<InputNumber min={1} />)}
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

export default withTranslation()(Form.create()(modal))
