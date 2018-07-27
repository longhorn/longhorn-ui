import React, { PropTypes } from 'react'
import { Input, InputNumber, Checkbox, Form } from 'antd'
import { formatMib } from '../../../utils/formater'
const FormItem = Form.Item

const EditableDiskCell = ({ form, value, dataIndex, rowIndex, disabled }) => {
  const getInput = () => {
    const { getFieldDecorator } = form
    switch (dataIndex) {
      case 'path':
        return (
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${rowIndex}']['${dataIndex}']`, {
              rules: [{
                required: true,
                message: 'Please Input Path!',
              }],
              initialValue: value,
            })(<Input
              type="text"
              placeholder="Path mounted by the disk, e.g. /mnt/disk1" disabled={disabled} />)}
          </FormItem>
        )
      case 'storageAvailable':
      case 'storageMaximum':
      case 'storageScheduled':
        return (
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${rowIndex}']['${dataIndex}']`, {
              initialValue: parseFloat(formatMib(value)),
            })(<span>
              <InputNumber min={0} defaultValue={parseFloat(formatMib(value), 10)} disabled /> Gi
            </span>)}
          </FormItem>
        )
      case 'storageReserved':
        return (
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${rowIndex}']['${dataIndex}']`, {
              initialValue: parseFloat(formatMib(value), 10),
            })(<span>
              <InputNumber min={1} defaultValue={parseFloat(formatMib(value), 10)} disabled={disabled} /> Gi
            </span>)}
          </FormItem>
        )
      case 'allowScheduling':
        return (
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${rowIndex}']['${dataIndex}']`, {
              initialValue: value,
            })(<Checkbox defaultChecked={value} disabled={disabled} />)}
          </FormItem>
        )
      default:
        return (
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(`disks['${rowIndex}']['${dataIndex}']`, {
              initialValue: value,
            })(<Input disabled={disabled} />)}
          </FormItem>
        )
    }
  }
  return getInput()
}

EditableDiskCell.propTypes = {
  form: PropTypes.object,
  value: PropTypes.any,
  dataIndex: PropTypes.string,
  rowIndex: PropTypes.string,
  disabled: PropTypes.bool,
}

export default EditableDiskCell
