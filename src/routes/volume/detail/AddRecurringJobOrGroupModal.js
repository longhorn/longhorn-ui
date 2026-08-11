import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select } from 'antd'
import { ModalBlur } from '../../../components'
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
  t,
  item,
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

      onOk(data)
    })
  }

  const modalOpts = {
    title: item.type === 'job' ? t('addRecurringJobOrGroupModal.title.job') : t('addRecurringJobOrGroupModal.title.group'),
    visible,
    onCancel,
    width: 800,
    onOk: handleOk,
  }
  if (!item) {
    return null
  }
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={item.type === 'job' ? t('addRecurringJobOrGroupModal.label.jobName') : t('addRecurringJobOrGroupModal.label.groupName')} {...formItemLayout}>
        {getFieldDecorator('name', {
          initialValue: '',
          rules: [
            {
              required: true,
              message: t('addRecurringJobOrGroupModal.validation.required'),
            },
          ],
        })(<Select>
            {item.options.map((option) => {
              return <Option key={option.id} value={option.name}>{option.name}</Option>
            })}
          </Select>)}
        </FormItem>
      </Form>
    </ModalBlur>
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
