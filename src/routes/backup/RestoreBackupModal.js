import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Checkbox, Spin, Select, Popover, Alert } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    span: 8,
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
  previousChecked,
  nodeTags,
  diskTags,
  tagsLoading,
  backingImages,
  backupVolumes,
  setPreviousChange,
  v1DataEngineEnabled,
  v2DataEngineEnabled,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    setFieldsValue,
  },
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
        fromBackup: item.fromBackup,
      }
      if (data.name && typeof data.name === 'string') {
        data.name = data.name.trimLeftAndRight()
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: `Restore Backup ${item.backupName}`,
    visible,
    onCancel,
    onOk: handleOk,
    width: 700,
  }

  function onPreviousChange(value) {
    if (item.volumeName) {
      value.target.checked ? setFieldsValue({ name: item.volumeName }) : setFieldsValue({ name: '' })
    }
    setPreviousChange(value.target.checked)
  }

  const showWarning = backupVolumes?.some((backupVolume) => backupVolume.name === getFieldsValue().name)
  const message = `The restore volume name (${getFieldsValue().name}) is the same as that of this backup volume, by which the backups created after restoration reside in this backup volume as well.`

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <Popover placement="right"
          visible={showWarning}
          content={<div style={{ maxWidth: 250 }}>
            <Alert message={message} type="warning" />
          </div>}>
          <FormItem label="Name" hasFeedback {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: item.name,
              rules: [
                {
                  required: true,
                  message: 'Volume name is required',
                },
              ],
            })(<Input />)}
          </FormItem>
        </Popover>
        <FormItem label="Use Previous Name" hasFeedback {...formItemLayout}>
          <Checkbox checked={previousChecked} disabled={!item.volumeName} onChange={onPreviousChange} />
        </FormItem>
        <FormItem label="Number of Replicas" hasFeedback {...formItemLayout}>
          {getFieldDecorator('numberOfReplicas', {
            initialValue: item.numberOfReplicas,
            rules: [
              {
                required: true,
                message: 'Please input the number of replicas',
              },
            ],
          })(<InputNumber min={1} />)}
        </FormItem>
        <FormItem label="Data Engine" hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataEngine', {
            initialValue: 'v1',
            rules: [
              {
                required: true,
                message: 'Please select the data engine',
              },
              {
                validator: (rule, value, callback) => {
                  if (value === 'v1' && !v1DataEngineEnabled) {
                    callback('v1 data engine is not enabled')
                  } else if (value === 'v2' && !v2DataEngineEnabled) {
                    callback('v2 data engine is not enabled')
                  }
                  callback()
                },
              },
            ],
          })(<Select>
            <Option key={'v1'} value={'v1'}>v1</Option>
            <Option key={'v2'} value={'v2'}>v2</Option>
          </Select>)}
        </FormItem>
        <FormItem label="Access Mode" hasFeedback {...formItemLayout}>
          {getFieldDecorator('accessMode', {
            initialValue: item.accessMode,
          })(<Select>
            <Option key={'ReadWriteOnce'} value={'rwo'}>ReadWriteOnce</Option>
            <Option key={'ReadWriteMany'} value={'rwx'}>ReadWriteMany</Option>
          </Select>)}
        </FormItem>
        <FormItem label="Backing Image" hasFeedback {...formItemLayout}>
          {getFieldDecorator('backingImage', {
            initialValue: item.backingImage,
          })(<Select allowClear={true} disabled>
            { backingImages.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label="Encrypted" {...formItemLayout}>
        {getFieldDecorator('encrypted', {
          valuePropName: 'encrypted',
          initialValue: false,
        })(<Checkbox></Checkbox>)}
        </FormItem>
        <FormItem label="Restore Volume Recurring Job" hasFeedback {...formItemLayout}>
          {getFieldDecorator('restoreVolumeRecurringJob', {
            initialValue: 'ignored',
          })(<Select>
            <Option key={'enabled'} value={'enabled'}>Enabled</Option>
            <Option key={'disabled'} value={'disabled'}>Disabled</Option>
            <Option key={'ignored'} value={'ignored'}>Ignored</Option>
          </Select>)}
        </FormItem>
        <Spin spinning={tagsLoading}>
          <FormItem label="Node Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('nodeSelector', {
              initialValue: [],
            })(<Select mode="tags">
            { nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label="Disk Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('diskSelector', {
              initialValue: [],
            })(<Select mode="tags">
            { diskTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  item: PropTypes.object,
  visible: PropTypes.bool,
  previousChecked: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  setPreviousChange: PropTypes.func,
  nodeTags: PropTypes.array,
  diskTags: PropTypes.array,
  backingImages: PropTypes.array,
  backupVolumes: PropTypes.array,
  v1DataEngineEnabled: PropTypes.bool,
  v2DataEngineEnabled: PropTypes.bool,
  tagsLoading: PropTypes.bool,
  form: PropTypes.object.isRequired,
}

export default Form.create()(modal)
