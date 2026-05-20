import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select } from 'antd'
import { ModalBlur } from '../../components'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
}

const modal = ({
  item,
  option,
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
      let url = item && item.actions && item.actions.updateDataLocality

      onOk(data, url)
    })
  }

  const modalOpts = {
    title: t('updateDataLocality.title'),
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
        <FormItem label={t('updateDataLocality.fields.dataLocality')} {...formItemLayout}>
          {getFieldDecorator('dataLocality', {
            initialValue: item.dataLocality,
          })(<Select>
          { option.map(value => <Option key={value} value={value}>{value}</Option>) }
          </Select>)}
        </FormItem>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  option: PropTypes.array,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  t: PropTypes.func,
}

export default Form.create()(withTranslation()(modal))
