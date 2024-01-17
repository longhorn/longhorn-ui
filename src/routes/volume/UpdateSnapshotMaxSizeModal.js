import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 6,
  },
}

const modal = ({
  item,
  visible,
  onCancel,
  onOk,
  form: { getFieldDecorator, getFieldsValue },
}) => {
  function handleOk() {
    const url = item && item.actions && item.actions.updateSnapshotMaxSize
    const data = {
      snapshotMaxSize: `${getFieldsValue().snapshotMaxSize}Gi`,
    }

    onOk(data, url)
  }
  const modalOpts = {
    title: 'Update Snapshot Max Size',
    visible,
    onCancel,
    onOk: handleOk,
  }


  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal" {...formItemLayout} style={{ display: 'flex' }}>
        <FormItem label="Max Count">
          {getFieldDecorator('snapshotMaxSize', {
            initialValue: item.snapshotMaxSize,
            rules: [
              {
                required: true,
                message: 'Please input volume snapshotMaxSize',
              },
            ],
          })(<InputNumber style={{ width: '270px' }} />)}
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
  selected: PropTypes.object,
  onOk: PropTypes.func,
  hosts: PropTypes.array,
}

export default Form.create()(modal)
