import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber, Select } from 'antd'
const { Option } = Select
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
  form: { getFieldDecorator, getFieldsValue, setFieldsValue },
}) => {
  function handleOk() {
    const { snapshotMaxSize, unit } = getFieldsValue()
    const url = item && item.actions && item.actions.updateSnapshotMaxSize
    const data = {
      snapshotMaxSize: `${snapshotMaxSize}${unit}`,
    }

    onOk(data, url)
  }

  // Convert Units Bi to Gi
  function formatSize() {
    if (item?.snapshotMaxSize && item?.snapshotMaxSize) {
      let sizeMi = parseInt(item?.snapshotMaxSize, 10) / (1024 * 1024)

      return getFieldsValue().unit === 'Gi'
        ? (sizeMi / 1024).toFixed(2)
        : parseInt(sizeMi, 10)
    }
    return 0
  }

  const minValue = formatSize()

  function unitChange(value) {
    let currentSize = getFieldsValue().snapshotMaxSize

    if (value === 'Gi') {
      currentSize /= 1024
    } else {
      currentSize *= 1024
    }
    setFieldsValue({ snapshotMaxSize: currentSize, unit: value })
  }

  const modalOpts = {
    title: 'Update Snapshot Max Size',
    visible,
    onCancel,
    onOk: handleOk,
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form
        layout="horizontal"
        {...formItemLayout}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <FormItem label="Max Size">
          {getFieldDecorator('snapshotMaxSize', {
            initialValue: minValue,
            rules: [
              {
                required: true,
                message: 'Please input volume snapshotMaxSize',
              },
            ],
          })(<InputNumber style={{ width: '270px' }} />)}
        </FormItem>
        <FormItem label="Unit">
          {getFieldDecorator('unit', {
            initialValue: 'Gi',
            rules: [{ required: true, message: 'Please select a value!' }],
          })(
            <Select placeholder="Select a value" onChange={unitChange}>
              <Option value="Gi">Gi</Option>
              <Option value="Mi">Mi</Option>
            </Select>
          )}
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
