import React, { PropTypes } from 'react'
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
  item,
  visible,
  onCancel,
  onOk,
  engineImages,
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
      onOk(data.image, item.actions.engineUpgrade)
    })
  }

  const modalOpts = {
    title: 'Upgrade Engine Image',
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
  }

  if (!item) {
    return null
  }
  const options = engineImages.filter(engineImage => engineImage.image !== item.engineImage && engineImage.state === 'ready').map(engineImage => <Select.Option key={engineImage.image} value={engineImage.image}>{engineImage.image}</Select.Option>)

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Engine Image" hasFeedback {...formItemLayout}>
          {getFieldDecorator('image', {
            initialValue: item.image,
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
  item: PropTypes.object,
  onOk: PropTypes.func,
  engineImages: PropTypes.array,
}

export default Form.create()(modal)
