import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select } from 'antd'
import { groupBy } from '../helper'
import { ModalBlur } from '../../../components'
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
  options,
  feilds,
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
      let actionUrls = []

      if (items && items.length > 0) {
        items.forEach((ele) => {
          if (feilds?.actionKey && ele?.actions[feilds.actionKey]) {
            actionUrls.push(ele.actions[feilds.actionKey])
          }
        })
      }

      onOk(data, actionUrls)
    })
  }

  const modalOpts = {
    title: `Update ${feilds?.name}`,
    visible,
    onCancel,
    width: 710,
    onOk: handleOk,
  }
  if (items.length < 0) {
    return null
  }
  let initialValue = 'ignored'

  if (feilds.key) {
    if (items.length === 1) {
      initialValue = items[0][feilds.key]
    } else {
      let obj = groupBy(items, feilds.key) || {}
      if (Object.keys(obj) && Object.keys(obj).length === 1) {
        initialValue = Object.keys(obj)[0]
      }
    }
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={feilds?.name} {...formItemLayout}>
        {getFieldDecorator(feilds?.key, {
          initialValue,
        })(<Select>
            { options?.map((item) => {
              return <Option key={item.value} value={item.value}>{item.label}</Option>
            }) }
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
  items: PropTypes.array,
  onOk: PropTypes.func,
  options: PropTypes.array,
  feilds: PropTypes.object,
}

export default Form.create()(modal)
