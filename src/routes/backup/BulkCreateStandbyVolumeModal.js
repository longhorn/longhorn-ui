import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber, Select, message, Spin, Checkbox, Tooltip, Tabs, Button, Input, Popover, Alert } from 'antd'
import { ModalBlur } from '../../components'
import { formatMib } from '../../utils/formatter'

const TabPane = Tabs.TabPane
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
  numberOfReplicas,
  visible,
  onCancel,
  onOk,
  nodeTags,
  diskTags,
  tagsLoading,
  backupVolumes,
  backingImages,
  v1DataEngineEnabled,
  v2DataEngineEnabled,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    getFieldValue,
    getFieldsError,
    setFieldsValue,
  },
}) => {
  const initConfigs = items.map((i) => ({
    name: i.volumeName,
    size: formatMib(i.size),
    numberOfReplicas,
    dataEngine: 'v1',
    accessMode: i.accessMode || null,
    backingImage: i.backingImage,
    encrypted: false,
    nodeSelector: [],
    diskSelector: [],
  }))
  const [currentTab, setCurrentTab] = useState(0)
  const [drVolumeConfigs, setDrVolumeConfigs] = useState(initConfigs)

  function handleOk() {
    const data = drVolumeConfigs.map((config, index) => ({
      ...config,
      standby: true,
      frontend: '',
      fromBackup: items[index].fromBackup,
      size: items[index].size.replace(/\s/ig, ''),
    }))
    onOk(data)
  }


  const handleApplyAll = () => {
    // only apply below configs to other configs
    const currentConfig = {
      numberOfReplicas: getFieldValue('numberOfReplicas'),
      dataEngine: getFieldValue('dataEngine'),
      accessMode: getFieldValue('accessMode'),
      encrypted: getFieldValue('encrypted') || false,
      nodeSelector: getFieldValue('nodeSelector'),
      diskSelector: getFieldValue('diskSelector'),
    }
    setDrVolumeConfigs(prev => {
      const newConfigs = [...prev]
      newConfigs.forEach((config, index) => {
        if (index !== currentTab) {
          newConfigs.splice(index, 1, { ...config, ...currentConfig })
        }
      })
      return newConfigs
    })
    message.success(`Successfully apply ${getFieldValue('name')} config to all other disaster recovery volumes`, 5)
  }

  const allFieldsError = { ...getFieldsError() }
  const hasFieldsError = Object.values(allFieldsError).some(fieldError => fieldError !== undefined) || false

  const updateDrVolumeConfigs = (key, newValue) => {
    setDrVolumeConfigs(prev => {
      const newConfigs = [...prev]
      const data = {
        ...getFieldsValue(),
        [key]: newValue,
      }
      newConfigs.splice(currentTab, 1, data)
      return newConfigs
    })
  }

  const handleNameChange = (e) => updateDrVolumeConfigs('name', e.target.value)
  const handleReplicasNumberChange = (newNumber) => updateDrVolumeConfigs('numberOfReplicas', newNumber)
  const handleEncryptedCheck = (e) => updateDrVolumeConfigs('encrypted', e.target.checked)
  const handleDataEngineChange = (value) => updateDrVolumeConfigs('dataEngine', value)
  const handleAccessModeChange = (value) => updateDrVolumeConfigs('accessMode', value)
  const handleNodeTagRemove = (value) => {
    const oldNodeTags = drVolumeConfigs[currentTab]?.nodeSelector
    const newNodeSelector = oldNodeTags?.filter(tag => tag !== value) || []
    updateDrVolumeConfigs('nodeSelector', newNodeSelector)
  }
  const handleNodeTagAdd = (value) => {
    const oldNodeTags = drVolumeConfigs[currentTab]?.nodeSelector
    updateDrVolumeConfigs('nodeSelector', [...oldNodeTags, value])
  }
  const handleDiskTagRemove = (value) => {
    const oldDiskTags = drVolumeConfigs[currentTab]?.diskSelector
    const newDiskSelector = oldDiskTags?.filter(tag => tag !== value) || []
    updateDrVolumeConfigs('diskSelector', newDiskSelector)
  }
  const handleDiskTagAdd = (value) => {
    const oldDiskTags = drVolumeConfigs[currentTab]?.diskSelector
    updateDrVolumeConfigs('diskSelector', [...oldDiskTags, value])
  }

  const handleTabClick = (key) => {
    if (hasFieldsError) {
      message.error('Please correct the error fields before switching to another tab', 5)
      return
    }
    validateFields((errors) => {
      if (errors) return errors
    })

    const newIndex = items.findIndex(i => i.volumeName === key)
    if (newIndex !== -1) {
      setCurrentTab(newIndex)
      const nextConfig = drVolumeConfigs[newIndex]
      setFieldsValue({
        name: nextConfig.name,
        size: nextConfig.size,
        numberOfReplicas: nextConfig.numberOfReplicas,
        dataEngine: nextConfig.dataEngine,
        accessMode: nextConfig.accessMode,
        backingImage: nextConfig.backingImage,
        encrypted: nextConfig.encrypted,
        nodeSelector: nextConfig.nodeSelector,
        diskSelector: nextConfig.diskSelector,
      })
    }
  }

  const tooltipTitle = `Apply this ${getFieldValue('name')} config to all the other disaster recovery volumes, this action will overwrite your previous filled in configs`
  const modalOpts = {
    title: 'Create Multiple Disaster Recovery Volumes',
    visible,
    onOk: handleOk,
    onCancel,
    width: 700,
    footer: [
     <Button key="cancel" onClick={onCancel}>
        Cancel
      </Button>,
      <Tooltip key="applyAllTooltip" overlayStyle={{ width: 300 }} placement="top" title={tooltipTitle}>
        <Button key="applyAll" style={{ marginLeft: 8 }} onClick={handleApplyAll} disabled={hasFieldsError}> Apply All </Button>
      </Tooltip>,
      <Button key="submit" style={{ marginLeft: 8 }} type="success" onClick={handleOk} disabled={hasFieldsError}>
        Ok
      </Button>,
    ],
  }
  const showWarning = backupVolumes?.some((backupVolume) => backupVolume.name === getFieldValue('name'))
  const alertMessage = <p>
    If there is another volume with the same name ({getFieldsValue().name}), the create DR volume will fail.
  </p>
  const item = drVolumeConfigs[currentTab] || {}
  const activeKey = items[currentTab].volumeName

  return (
    <ModalBlur {...modalOpts}>
      <Tabs className="drVolumeTab" activeKey={activeKey} onTabClick={handleTabClick} type="card">
        {items.map(i => <TabPane tab={i.volumeName} key={i.volumeName} />)}
      </Tabs>
      <Form layout="horizontal">
        <Popover
          overlayStyle={{ top: '20px' }}
          placement="right"
          visible={showWarning}
          content={
          <div style={{ maxWidth: 300 }}>
            <Alert message={alertMessage} type="warning" />
          </div>
        }>
          <FormItem label="Volume Name" hasFeedback {...formItemLayout}>
              {getFieldDecorator('name', {
                initialValue: item.name,
                rules: [
                  {
                    required: true,
                    message: 'Volume name is required',
                  },
                ],
              })(<Input onChange={handleNameChange} />)}
          </FormItem>
        </Popover>
        <FormItem label="Size" hasFeedback {...formItemLayout}>
          {getFieldDecorator('size', {
            initialValue: item.size,
            rules: [
              {
                required: true,
                message: 'Please input volume size',
              },
            ],
          })(<Input disabled />)}
        </FormItem>
        <FormItem label="Number of Replicas" hasFeedback {...formItemLayout}>
          {getFieldDecorator('numberOfReplicas', {
            initialValue: numberOfReplicas,
            rules: [
              {
                required: true,
                message: 'Please input the number of replicas',
              },
            ],
          })(<InputNumber min={1} max={10} onChange={handleReplicasNumberChange} />)}
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
                validator: (_rule, value, callback) => {
                  if (value === 'v1' && !v1DataEngineEnabled) {
                    callback('v1 data engine is not enabled')
                  } else if (value === 'v2' && !v2DataEngineEnabled) {
                    callback('v2 data engine is not enabled')
                  }
                  callback()
                },
              },
            ],
          })(<Select onSelect={handleDataEngineChange}>
            <Option key={'v1'} value={'v1'}>v1</Option>
            <Option key={'v2'} value={'v2'}>v2</Option>
          </Select>)}
        </FormItem>
        <FormItem label="Access Mode" hasFeedback {...formItemLayout}>
          {getFieldDecorator('accessMode', {
            initialValue: item.accessMode,
          })(<Select onSelect={handleAccessModeChange}>
            <Option key={'ReadWriteOnce'} value={'rwo'}>ReadWriteOnce</Option>
            <Option key={'ReadWriteMany'} value={'rwx'}>ReadWriteMany</Option>
          </Select>)}
        </FormItem>
        <FormItem label="Backing Image" hasFeedback {...formItemLayout}>
          {getFieldDecorator('backingImage', {
            initialValue: item.backingImage,
          })(<Select disabled>
            { backingImages.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label="Encrypted" {...formItemLayout}>
          {getFieldDecorator('encrypted', {
            valuePropName: 'checked',
            initialValue: item.encrypted || false,
          })(<Checkbox onChange={handleEncryptedCheck} />)}
        </FormItem>
        <Spin spinning={tagsLoading}>
          <FormItem label="Node Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('nodeSelector', {
              initialValue: [],
            })(<Select mode="tags" onSelect={handleNodeTagAdd} onDeselect={handleNodeTagRemove}>
            { nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label="Disk Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('diskSelector', {
              initialValue: [],
            })(<Select mode="tags" onSelect={handleDiskTagAdd} onDeselect={handleDiskTagRemove}>
            { diskTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
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
  numberOfReplicas: PropTypes.number,
  nodeTags: PropTypes.array,
  diskTags: PropTypes.array,
  backupVolumes: PropTypes.array,
  tagsLoading: PropTypes.bool,
  backingImages: PropTypes.array,
  v1DataEngineEnabled: PropTypes.bool,
  v2DataEngineEnabled: PropTypes.bool,
}

export default Form.create()(modal)
