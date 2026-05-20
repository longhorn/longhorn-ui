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
  items,
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
      let updateDataLocalityUrl = []

      if (items && items.length > 0) {
        items.forEach((ele) => {
          if (ele.actions && ele.actions.updateDataLocality) {
            updateDataLocalityUrl.push(ele.actions.updateDataLocality)
          }
        })
      }

      onOk(data, updateDataLocalityUrl)
    })
  }

  function groupBy(objectArray, property) {
    return objectArray.reduce((acc, obj) => {
      let key = obj[property]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj)
      return acc
    }, {})
  }

  let initialValue = ''

  const modalOpts = {
    title: t('updateBulkDataLocality.title'),
    visible,
    onCancel,
    onOk: handleOk,
  }
  if (!items) {
    return null
  }

  if (items.length === 1) {
    initialValue = items[0].dataLocality
  } else {
    let obj = groupBy(items, 'dataLocality') || {}

    if (Object.keys(obj) && Object.keys(obj).length === 1) {
      initialValue = Object.keys(obj)[0]
    }
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('updateBulkDataLocality.fields.dataLocality')} hasFeedback {...formItemLayout}>
          {initialValue ? getFieldDecorator('dataLocality', {
            initialValue,
          })(<Select>
            { option.map(value => <Option key={value} value={value}>{value}</Option>) }
          </Select>) : getFieldDecorator('dataLocality', {
            rules: [
              {
                required: true,
                message: t('common.validation.cannotBeEmpty'),
              },
            ],
          })(<Select placeholder={t('updateBulkDataLocality.placeholders.various')}>
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
  items: PropTypes.array,
  onOk: PropTypes.func,
  t: PropTypes.func,
}

export default Form.create()(withTranslation()(modal))
