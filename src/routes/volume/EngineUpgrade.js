import React from 'react'
import PropTypes from 'prop-types'
import { Form, Select } from 'antd'
import { ModalBlur } from '../../components'

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
  items,
  visible,
  onCancel,
  onOk,
  engineImages,
  engineUpgradePerNodeLimit,
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
      onOk(data.image, items.map(item => item.actions.engineUpgrade))
    })
  }

  const modalOpts = {
    title: 'Upgrade Engine Image',
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
  }
  if (!items || items.length === 0) {
    return null
  }
  const options = engineImages.filter((engineImage) => {
    return items.findIndex((item) => {
      if (engineUpgradePerNodeLimit && engineUpgradePerNodeLimit.value !== '0') {
        return item.image === engineImage.image || !engineImage.default
      }
      return item.image === engineImage.image
    }) === -1
  }).map(engineImage => <Select.Option key={engineImage.image} value={engineImage.image}>{engineImage.image}</Select.Option>)

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Engine Image" hasFeedback {...formItemLayout}>
          {getFieldDecorator('image', {
            rules: [
              {
                required: true,
                message: 'Please select an engine image to upgrade',
              },
            ],
          })(<Select style={{ width: '100%' }} size="large">
            {options}
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
  engineImages: PropTypes.array,
  engineUpgradePerNodeLimit: PropTypes.object,
}

export default Form.create()(modal)
