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
      }
      let updateAccessModeUrl = []

      if (items && items.length > 0) {
        items.forEach((ele) => {
          if (ele.actions && ele.actions.updateAccessMode) {
            updateAccessModeUrl.push(ele.actions.updateAccessMode)
          }
        })
      }

      onOk(data, updateAccessModeUrl)
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
    title: t('updateAccessMode.title'),
    visible,
    onCancel,
    onOk: handleOk,
  }
  if (!items) {
    return null
  }

  if (items.length === 1) {
    initialValue = items[0].accessMode
  } else {
    let obj = groupBy(items, 'accessMode') || {}

    if (Object.keys(obj) && Object.keys(obj).length === 1) {
      initialValue = Object.keys(obj)[0]
    }
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('columns.accessMode')} hasFeedback {...formItemLayout}>
          {initialValue ? getFieldDecorator('accessMode', {
            initialValue,
          })(<Select>
            <Option key={'ReadWriteOnce'} value={'rwo'}>{t('accessModes.rwo')}</Option>
            <Option key={'ReadWriteOncePod'} value={'rwop'}>{t('accessModes.rwop')}</Option>
            <Option key={'ReadWriteMany'} value={'rwx'}>{t('accessModes.rwx')}</Option>
          </Select>) : getFieldDecorator('accessMode', {
            rules: [
              {
                required: true,
                message: t('common.validation.cannotBeEmpty'),
              },
            ],
          })(<Select placeholder="various">
              <Option key={'ReadWriteOnce'} value={'rwo'}>{t('accessModes.rwo')}</Option>
              <Option key={'ReadWriteOncePod'} value={'rwop'}>{t('accessModes.rwop')}</Option>
              <Option key={'ReadWriteMany'} value={'rwx'}>{t('accessModes.rwx')}</Option>
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
