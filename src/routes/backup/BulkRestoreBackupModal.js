import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Spin, Select, Popover, Alert, Tabs, Button } from 'antd'
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
    getFieldsValue,
    getFieldValue,
    setFieldsValue,
  },
}) => {
  const initConfigs = items.map((i) => ({
    name: '',
    numberOfReplicas: i.numberOfReplicas,
    dataEngine: 'v1',
    accessMode: i.accessMode || null,
    latestBackup: i.backupName,
    backingImage: i.backingImage,
    restoreVolumeRecurringJob: 'ignored',
    nodeSelector: [],
    diskSelector: [],
  }))
  const [currentTab, setCurrentTab] = useState(0)
  const [restoreBackupConfigs, setRestoreBackupConfigs] = useState(initConfigs)
  const [done, setDone] = useState(false)
  const lastIndex = items.length - 1

  useEffect(() => {
    if (currentTab === lastIndex && done) {
      onOk(restoreBackupConfigs)
    }
  }, [restoreBackupConfigs])

  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
        name: getFieldValue('name').trimLeftAndRight(),
        fromBackup: items[currentTab]?.fromBackup || '',
      }
      setRestoreBackupConfigs(prev => {
        const newConfigs = [...prev]
        newConfigs.splice(currentTab, 1, data)
        return newConfigs
      })
      if (currentTab !== lastIndex) {
        const nextIndex = currentTab + 1
        setCurrentTab(nextIndex)
        const nextConfig = restoreBackupConfigs[nextIndex]
        setFieldsValue({
          name: nextConfig.name,
          numberOfReplicas: nextConfig.numberOfReplicas,
          dataEngine: nextConfig.dataEngine,
          accessMode: nextConfig.accessMode,
          latestBackup: nextConfig.latestBackup,
          backingImage: nextConfig.backingImage,
          restoreVolumeRecurringJob: nextConfig.restoreVolumeRecurringJob,
          nodeSelector: nextConfig.nodeSelector,
          diskSelector: nextConfig.diskSelector,
        })
      } else if (currentTab === lastIndex) {
        setDone(true)
      }
    })
  }

  const handleFieldChange = () => {
    setRestoreBackupConfigs(prev => {
      const newConfigs = [...prev]
      const data = {
        ...getFieldsValue(),
        name: getFieldValue('name')?.trimLeftAndRight() || '',
        fromBackup: items[currentTab]?.fromBackup || '',
      }
      newConfigs.splice(currentTab, 1, data)
      return newConfigs
    })
  }

  const handlePrevious = () => {
    const prevIdx = currentTab - 1
    setCurrentTab(prevIdx)
    const prevConfig = restoreBackupConfigs[prevIdx]
    setFieldsValue({
      name: prevConfig.name,
      numberOfReplicas: prevConfig.numberOfReplicas,
      dataEngine: prevConfig.dataEngine,
      accessMode: prevConfig.accessMode,
      latestBackup: prevConfig.latestBackup,
      backingImage: prevConfig.backingImage,
      restoreVolumeRecurringJob: prevConfig.restoreVolumeRecurringJob,
      nodeSelector: prevConfig.nodeSelector,
      diskSelector: prevConfig.diskSelector,
    })
  }

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
      <Button key="back" onClick={handlePrevious} disabled={currentTab === 0}>
        Previous
      </Button>,
      <Button key="submit" type="success" onClick={handleOk}>
        {currentTab === lastIndex ? 'OK' : 'Next'}
      </Button>,
    ],
  }

  const showWarning = backupVolumes?.some((backupVolume) => backupVolume.name === getFieldsValue().name)
  const message = `The restore volume name (${getFieldsValue().name}) is the same as that of this backup volume, by which the backups created after restoration reside in this backup volume as well.`

  const item = restoreBackupConfigs[currentTab] || {}
  const activeKey = item.latestBackup

  return (
    <ModalBlur {...modalOpts}>
      <Tabs className="restoreBackupTab" activeKey={activeKey} type="card">
        {items.map(i => <TabPane tab={i.volumeName} key={i.backupName} />)}
      </Tabs>
      <Form key={currentTab} layout="horizontal">
        <Popover
          overlayStyle={{ top: '20px' }}
          placement="right"
          visible={showWarning}
          content={
          <div style={{ maxWidth: 250 }}>
            <Alert message={message} type="warning" />
          </div>
        }>
          <FormItem label="Volume Name" hasFeedback {...formItemLayout}>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: 'Volume name is required',
                },
              ],
            })(<Input onChange={handleFieldChange} />)}
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
          })(<InputNumber min={1} max={10} onChange={handleFieldChange} />)
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
          })(<Select onSelect={handleFieldChange}>
            <Option key={'v1'} value={'v1'}>v1</Option>
            <Option key={'v2'} value={'v2'}>v2</Option>
          </Select>)}
        </FormItem>
        <FormItem label="Access Mode" hasFeedback {...formItemLayout}>
          {getFieldDecorator('accessMode', {
            initialValue: item.accessMode,
          })(<Select onSelect={handleFieldChange}>
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
        <FormItem label="Restore Volume Recurring Job" hasFeedback {...formItemLayout}>
          {getFieldDecorator('restoreVolumeRecurringJob', {
            initialValue: 'ignored',
          })(<Select onSelect={handleFieldChange}>
            <Option key={'enabled'} value={'enabled'}>Enabled</Option>
            <Option key={'disabled'} value={'disabled'}>Disabled</Option>
            <Option key={'ignored'} value={'ignored'}>Ignored</Option>
          </Select>)}
        </FormItem>
        <Spin spinning={tagsLoading}>
          <FormItem label="Node Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('nodeSelector', {
              initialValue: [],
            })(<Select mode="tags" onSelect={handleFieldChange}>
            {nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label="Disk Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('diskSelector', {
              initialValue: [],
            })(<Select mode="tags" onSelect={handleFieldChange}>
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
