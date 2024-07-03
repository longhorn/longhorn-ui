import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Spin,
  Alert,
  Button,
  Tooltip,
  message,
  Tabs,
} from 'antd'
import { ModalBlur } from '../../components'
import { frontends } from './helper/index'
import { formatSize } from '../../utils/formatter'
const TabPane = Tabs.TabPane
const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 13 },
}

const modal = ({
  selectedRows = [],
  visible,
  onCancel,
  onOk,
  nodeTags,
  diskTags,
  defaultDataLocalityOption,
  defaultDataLocalityValue,
  backingImageOptions,
  tagsLoading,
  v1DataEngineEnabled,
  v2DataEngineEnabled,
  form: {
    getFieldDecorator,
    validateFields,
    setFieldsValue,
    getFieldsValue,
    getFieldValue,

    getFieldsError,
  },
}) => {
  const initConfigs = selectedRows.map((i) => ({
    id: i.id,
    name: `cloned-${i.name}`,
    size: i.size,
    numberOfReplicas: i.numberOfReplicas,
    frontend: i.frontend,
    dataLocality: i.dataLocality || defaultDataLocalityValue,
    accessMode: i.accessMode || null,
    backingImage: i.backingImage,
    dataSource: i.name,
    encrypted: i.encrypted || false,
    dataEngine: i.dataEngine || 'v1',
    nodeSelector: i.nodeSelector || [],
    diskSelector: i.diskSelector || [],
  }))
  const [tabIndex, setTabIndex] = useState(0)
  const [volumeConfigs, setVolumeConfigs] = useState(initConfigs)

  const handleOk = () => {
    const data = volumeConfigs.map(vol => ({
      ...vol,
      dataSource: `vol://${vol.dataSource}`,
    }))
    onOk(data)
  }
  const updateVolumeConfig = (key, newValue) => {
    setVolumeConfigs(prev => {
      const newConfigs = [...prev]
      const current = newConfigs[tabIndex]
      const data = {
        ...current,
        [key]: newValue,
      }
      newConfigs.splice(tabIndex, 1, data)
      return newConfigs
    })
  }

  const handleApplyAll = () => {
    // only apply below configs to other configs
    const currentConfig = {
      numberOfReplicas: getFieldValue('numberOfReplicas'),
      frontend: getFieldValue('frontend'),
      dataLocality: getFieldValue('dataLocality'),
      accessMode: getFieldValue('accessMode'),
      encrypted: getFieldValue('encrypted') || false,
      dataEngine: getFieldValue('dataEngine'),
      nodeSelector: getFieldValue('nodeSelector'),
      diskSelector: getFieldValue('diskSelector'),
    }
    setVolumeConfigs(prev => {
      const newConfigs = [...prev]
      newConfigs.forEach((config, index) => {
        if (index !== tabIndex) {
          newConfigs.splice(index, 1, { ...config, ...currentConfig })
        }
      })
      return newConfigs
    })
    message.success(`Successfully apply ${getFieldValue('name')} config to all other cloned volumes`, 5)
  }

  const tooltipTitle = `Apply ${getFieldValue('name')} configuration to other cloned volumes, this action will overwrite your previous filled-in configurations`
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

    const newIndex = selectedRows.findIndex(i => i.name === key)

    if (newIndex !== -1) {
      setTabIndex(newIndex)
      const {
        name,
        numberOfReplicas,
        frontend,
        dataLocality,
        accessMode,
        backingImage,
        encrypted,
        dataEngine,
        nodeSelector,
        diskSelector } = volumeConfigs[newIndex] || {}

      setFieldsValue({
        name,
        size: formatSize(volumeConfigs[newIndex]),
        numberOfReplicas,
        frontend,
        dataLocality,
        accessMode,
        backingImage,
        encrypted,
        dataEngine,
        nodeSelector,
        diskSelector,
      })
    }
  }

  const handleNameChange = (e) => updateVolumeConfig('name', e.target.value)
  const handleReplicasNumberChange = (newNumber) => updateVolumeConfig('numberOfReplicas', newNumber)
  const handleFrontendChange = (value) => updateVolumeConfig('frontend', value)
  const handleDataLocalityChange = (value) => updateVolumeConfig('dataLocality', value)
  const handleAccessModeChange = (value) => updateVolumeConfig('accessMode', value)
  const handleEncryptedCheck = (e) => updateVolumeConfig('encrypted', e.target.checked)
  const handleNodeTagRemove = (value) => {
    const oldNodeTags = volumeConfigs[tabIndex]?.nodeSelector
    const newNodeSelector = oldNodeTags?.filter(tag => tag !== value) || []
    updateVolumeConfig('nodeSelector', newNodeSelector)
  }
  const handleNodeTagAdd = (value) => {
    const oldNodeTags = volumeConfigs[tabIndex]?.nodeSelector
    updateVolumeConfig('nodeSelector', [...oldNodeTags, value])
  }
  const handleDiskTagRemove = (value) => {
    const oldDiskTags = volumeConfigs[tabIndex]?.diskSelector
    const newDiskSelector = oldDiskTags?.filter(tag => tag !== value) || []
    updateVolumeConfig('diskSelector', newDiskSelector)
  }
  const handleDiskTagAdd = (value) => {
    const oldDiskTags = volumeConfigs[tabIndex]?.diskSelector
    updateVolumeConfig('diskSelector', [...oldDiskTags, value])
  }

  const modalOpts = {
    title: 'Clone Volumes',
    visible,
    onCancel,
    width: 880,
    onOk: handleOk,
    footer: [
      <Button key="cancel" onClick={onCancel}>Cancel</Button>,
      <Tooltip key="applyAllTooltip" overlayStyle={{ width: 300 }} placement="top" title={tooltipTitle}>
        <Button key="applyAll" style={{ marginLeft: 8 }} onClick={handleApplyAll} disabled={hasFieldsError}> Apply All </Button>
      </Tooltip>,
      <Button key="submit" style={{ marginLeft: 8 }} type="success" onClick={handleOk} disabled={hasFieldsError}>
        Ok
      </Button>,
    ],
    style: { top: 0 },
  }

  const item = volumeConfigs[tabIndex] || {}
  const activeKey = item.id // use original volume id as key

  return (
    <ModalBlur {...modalOpts}>
      <Alert style={{ width: 'fit-content', margin: 'auto', marginBottom: 24 }} message="Longhorn will auto attach the new volume, perform cloning from specified volume, and then detach it" type="info" showIcon />
      <Tabs className="cloneVolumeTab" activeKey={activeKey} onTabClick={handleTabClick} type="card">
        {selectedRows.map(i => <TabPane tab={i.name} key={i.name} />)}
      </Tabs>
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: 'Please input volume name',
              },
            ],
          })(<Input onChange={handleNameChange} />)}
        </FormItem>
        <div style={{ display: 'flex' }}>
          <FormItem label="Size" style={{ flex: '1 0 65%', paddingLeft: 30 }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('size', {
              initialValue: formatSize(item),
              rules: [
                {
                  required: true,
                  message: 'Please input volume size',
                }, {
                  validator: (_rule, value, callback) => {
                    if (value === '' || typeof value !== 'number') {
                      callback()
                      return
                    }
                    if (value < 0 || value > 65536) {
                      callback('The value should be between 0 and 65535')
                    } else if (!/^\d+([.]\d{1,2})?$/.test(value)) {
                      callback('This value should have at most two decimal places')
                    } else if (value < 10 && getFieldsValue().unit === 'Mi') {
                      callback('The volume size must be greater than 10 Mi')
                    } else if (value % 1 !== 0 && getFieldsValue().unit === 'Mi') {
                      callback('Decimals are not allowed')
                    } else {
                      callback()
                    }
                  },
                },
              ],
            })(<InputNumber disabled style={{ width: '330px' }} />)}
          </FormItem>
          <FormItem style={{ flex: '1 0 30%' }}>
          {getFieldDecorator('unit', {
            initialValue: item.unit || 'Gi',
            rules: [{ required: true, message: 'Please select your unit!' }],
          })(
            <Select
              disabled
              style={{ width: '100px' }}
            >
              <Option value="Mi">Mi</Option>
              <Option value="Gi">Gi</Option>
            </Select>,
          )}
          </FormItem>
        </div>
        <FormItem label="Number of Replicas" hasFeedback {...formItemLayout}>
          {getFieldDecorator('numberOfReplicas', {
            initialValue: item.numberOfReplicas,
            rules: [
              {
                required: true,
                message: 'Please input the number of replicas',
              },
              {
                validator: (_rule, value, callback) => {
                  if (value === '' || typeof value !== 'number') {
                    callback()
                    return
                  }
                  if (value < 1 || value > 10) {
                    callback('The value should be between 1 and 10')
                  } else if (!/^\d+$/.test(value)) {
                    callback('The value must be a positive integer')
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber onChange={handleReplicasNumberChange} />)}
        </FormItem>
        <FormItem label="Frontend" hasFeedback {...formItemLayout}>
          {getFieldDecorator('frontend', {
            initialValue: item.frontend || frontends[0].value,
            rules: [
              {
                required: true,
                message: 'Please select a frontend',
              },
            ],
          })(<Select onSelect={handleFrontendChange}>
          { frontends.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label="Data Locality" hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataLocality', {
            initialValue: item.dataLocality || defaultDataLocalityValue,
          })(<Select onSelect={handleDataLocalityChange}>
          { defaultDataLocalityOption.map(value => <Option key={value} value={value}>{value}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label="Access Mode" hasFeedback {...formItemLayout}>
          {getFieldDecorator('accessMode', {
            initialValue: item.accessMode || 'rwo',
          })(<Select onSelect={handleAccessModeChange}>
            <Option key={'ReadWriteOnce'} value={'rwo'}>ReadWriteOnce</Option>
            <Option key={'ReadWriteMany'} value={'rwx'}>ReadWriteMany</Option>
          </Select>)}
        </FormItem>
        <FormItem label="Backing Image" hasFeedback {...formItemLayout}>
          {getFieldDecorator('backingImage', {
            initialValue: item.backingImage || '',
          })(<Select disabled>
            { backingImageOptions.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label="Data Source" hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataSource', {
            initialValue: item.id || '',
          })(<Select disabled />)}
        </FormItem>
        <FormItem label="Data Engine" hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataEngine', {
            initialValue: item.dataEngine || 'v1',
            rules: [
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
          })(<Select disabled>
            <Option key={'v1'} value={'v1'}>v1</Option>
            <Option key={'v2'} value={'v2'}>v2</Option>
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
              initialValue: item.nodeSelector || [],
            })(<Select mode="tags" onSelect={handleNodeTagAdd} onDeselect={handleNodeTagRemove}>
            { nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label="Disk Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('diskSelector', {
              initialValue: item.diskSelector || [],
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
  selectedRows: PropTypes.array.isRequired,
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  nodeTags: PropTypes.array,
  diskTags: PropTypes.array,
  defaultDataLocalityOption: PropTypes.array,
  defaultDataLocalityValue: PropTypes.string,
  tagsLoading: PropTypes.bool,
  v1DataEngineEnabled: PropTypes.bool,
  v2DataEngineEnabled: PropTypes.bool,
  backingImageOptions: PropTypes.array,
}

export default Form.create()(modal)
