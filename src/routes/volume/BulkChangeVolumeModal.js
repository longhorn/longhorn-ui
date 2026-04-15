import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select } from 'antd'
import { ModalBlur } from '../../components'
import { frontends } from './helper/index'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 14,
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
      onOk(data, items)
    })
  }

  const modalOpts = {
    title: t('bulkChangeVolumeModal.title'),
    visible,
    onCancel,
    onOk: handleOk,
  }

  const selectedVolumes = items.map((item) => `${item.name}`).join(', ')
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('bulkChangeVolumeModal.fields.selectedVolumes')} {...formItemLayout}>
          {selectedVolumes}
        </FormItem>
        <FormItem label={t('common.frontend')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('frontend', {
            initialValue: frontends[0].value,
            rules: [
              {
                required: true,
                message: t('common.validation.frontendRequired'),
              },
            ],
          })(<Select>
          { frontends.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>) }
          </Select>)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  items: PropTypes.array,
  t: PropTypes.func,
}

export default Form.create()(withTranslation()(modal))
