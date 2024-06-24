import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Spin, Select, message, Popover, Alert, Tabs, Button, Checkbox, Tooltip } from 'antd'
import { ModalBlur } from '../../components'

const TabPane = Tabs.TabPane
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
  items,
  visible,
  onCancel,
  onOk,
  nodeTags,
  diskTags,
  tagsLoading,
  backingImages,
  backupVolumes,
  v1DataEngineEnabled,
  v2DataEngineEnabled,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsError,
    getFieldsValue,
    getFieldValue,
    setFieldsValue,
  },
}) => {
  const initConfigs = items.map((i) => ({
    name: i.volumeName,
    numberOfReplicas: i.numberOfReplicas,
    dataEngine: 'v1',
    accessMode: i.accessMode || null,
    latestBackup: i.backupName,
    backingImage: i.backingImage,
    encrypted: false,
    restoreVolumeRecurringJob: 'ignored',
    nodeSelector: i.nodeSelector || [],
    diskSelector: i.diskSelector || [],
  }))
  const [currentTab, setCurrentTab] = useState(0)
  const [restoreBackupConfigs, setRestoreBackupConfigs] = useState(initConfigs)

  const handleOk = () => onOk(restoreBackupConfigs)

  const updateRestoreBackupConfigs = (key, newValue) => {
    setRestoreBackupConfigs(prev => {
      const newConfigs = [...prev]
      const data = {
        ...getFieldsValue(),
        [key]: newValue,
        fromBackup: items[currentTab]?.fromBackup || '',
      }
      newConfigs.splice(currentTab, 1, data)
      return newConfigs
    })
  }

  const handleNameChange = (e) => updateRestoreBackupConfigs('name', e.target.value)
  const handleReplicasNumberChange = (newNumber) => updateRestoreBackupConfigs('numberOfReplicas', newNumber)
  const handleEncryptedCheck = (e) => updateRestoreBackupConfigs('encrypted', e.target.checked)
  const handleDataEngineChange = (value) => updateRestoreBackupConfigs('dataEngine', value)
  const handleAccessModeChange = (value) => updateRestoreBackupConfigs('accessMode', value)
  const handleRecurringJobChange = (value) => updateRestoreBackupConfigs('restoreVolumeRecurringJob', value)
  const handleNodeTagRemove = (value) => {
    const oldNodeTags = restoreBackupConfigs[currentTab]?.nodeSelector
    const newNodeSelector = oldNodeTags?.filter(tag => tag !== value) || []
    updateRestoreBackupConfigs('nodeSelector', newNodeSelector)
  }
  const handleNodeTagAdd = (value) => {
    const oldNodeTags = restoreBackupConfigs[currentTab]?.nodeSelector
    updateRestoreBackupConfigs('nodeSelector', [...oldNodeTags, value])
  }
  const handleDiskTagRemove = (value) => {
    const oldDiskTags = restoreBackupConfigs[currentTab]?.diskSelector
    const newDiskSelector = oldDiskTags?.filter(tag => tag !== value) || []
    updateRestoreBackupConfigs('diskSelector', newDiskSelector)
  }
  const handleDiskTagAdd = (value) => {
    const oldDiskTags = restoreBackupConfigs[currentTab]?.diskSelector
    updateRestoreBackupConfigs('diskSelector', [...oldDiskTags, value])
  }

  const handleApplyAll = () => {
    // only apply below configs to other configs
    const currentConfig = {
      numberOfReplicas: getFieldValue('numberOfReplicas'),
      dataEngine: getFieldValue('dataEngine'),
      accessMode: getFieldValue('accessMode'),
      encrypted: getFieldValue('encrypted') || false,
      restoreVolumeRecurringJob: getFieldValue('restoreVolumeRecurringJob'),
      nodeSelector: getFieldValue('nodeSelector'),
      diskSelector: getFieldValue('diskSelector'),
    }
    setRestoreBackupConfigs(prev => {
      const newConfigs = [...prev]
      newConfigs.forEach((config, index) => {
        if (index !== currentTab) {
          newConfigs.splice(index, 1, { ...config, ...currentConfig })
        }
      })
      return newConfigs
    })
    message.success(`Successfully apply ${getFieldValue('name')} config to all other restore volumes`, 5)
  }

  const allFieldsError = { ...getFieldsError() }
  const hasFieldsError = Object.values(allFieldsError).some(fieldError => fieldError !== undefined) || false

  const handleTabClick = (key) => {
    if (hasFieldsError) {
      message.error('Please correct the error fields before switching to another tab', 5)
      return
    }
    validateFields((errors) => {
      if (errors) return errors
    })

    const newIndex = items.findIndex(i => i.backupName === key)

    if (newIndex !== -1) {
      setCurrentTab(newIndex)
      const nextConfig = restoreBackupConfigs[newIndex]
      setFieldsValue({
        name: nextConfig.name,
        numberOfReplicas: nextConfig.numberOfReplicas,
        dataEngine: nextConfig.dataEngine,
        accessMode: nextConfig.accessMode,
        latestBackup: nextConfig.latestBackup,
        backingImage: nextConfig.backingImage,
        encrypted: nextConfig.encrypted,
        restoreVolumeRecurringJob: nextConfig.restoreVolumeRecurringJob,
        nodeSelector: nextConfig.nodeSelector,
        diskSelector: nextConfig.diskSelector,
      })
    }
  }

  const showWarning = backupVolumes?.some((backupVolume) => backupVolume.name === getFieldsValue().name)
  const alertMessage = <p>
    1. If there is another volume with the same name ({getFieldsValue().name}), the restore action will fail.
    <br />
    2. The restore volume name ({getFieldsValue().name}) is the same as this backup volume, by which the backups created after restoration reside in this backup volume as well.
    </p>

  const tooltipTitle = `Apply this ${getFieldValue('name')} config to all the other restore volumes, this action will overwrite your previous filled in configs`
  const modalOpts = {
    title: 'Restore Multiple Latest Backups',
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

  const item = restoreBackupConfigs[currentTab] || {}
  const activeKey = item.latestBackup

  return (
    <ModalBlur {...modalOpts}>
      <Tabs className="restoreBackupTab" activeKey={activeKey} onTabClick={handleTabClick} type="card">
        {items.map(i => <TabPane tab={i.volumeName} key={i.backupName} />)}
      </Tabs>
      <Form key={currentTab} layout="horizontal">
        <Popover
          overlayStyle={{ top: '20px' }}
          placement="right"
          visible={showWarning}
          content={
          <div style={{ maxWidth: 450 }}>
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
        <FormItem label="Number of Replicas" hasFeedback {...formItemLayout}>
          {getFieldDecorator('numberOfReplicas', {
            initialValue: item.numberOfReplicas,
            rules: [
              {
                required: true,
                message: 'Please input the number of replicas',
              },
            ],
          })(<InputNumber min={1} max={10} onChange={handleReplicasNumberChange} />)
          }
        </FormItem>
        <FormItem label="Data Engine" hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataEngine', {
            initialValue: item.dataEngine || 'v1',
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
        <FormItem label="Latest Backup" hasFeedback {...formItemLayout}>
          {getFieldDecorator('latestBackup', {
            initialValue: item.latestBackup,
          })(<Input disabled />)}
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
        <FormItem label="Restore Volume Recurring Job" hasFeedback {...formItemLayout}>
          {getFieldDecorator('restoreVolumeRecurringJob', {
            initialValue: 'ignored',
          })(<Select onSelect={handleRecurringJobChange}>
            <Option key={'enabled'} value={'enabled'}>Enabled</Option>
            <Option key={'disabled'} value={'disabled'}>Disabled</Option>
            <Option key={'ignored'} value={'ignored'}>Ignored</Option>
          </Select>)}
        </FormItem>
        <Spin spinning={tagsLoading}>
          <FormItem label="Node Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('nodeSelector', {
              initialValue: [],
            })(<Select mode="tags" onSelect={handleNodeTagAdd} onDeselect={handleNodeTagRemove}>
            {nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label="Disk Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('diskSelector', {
              initialValue: [],
            })(<Select mode="tags" onSelect={handleDiskTagAdd} onDeselect={handleDiskTagRemove}>
            {diskTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  items: PropTypes.array.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
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
