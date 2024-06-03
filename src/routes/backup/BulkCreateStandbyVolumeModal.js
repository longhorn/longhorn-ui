import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber, Select, Spin, Tabs, Button, Input } from 'antd'
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
  backingImages,
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
    name: `dr-${i.volumeName}`,
    size: formatMib(i.size),
    numberOfReplicas,
    dataEngine: 'v1',
    accessMode: i.accessMode || null,
    backingImage: i.backingImage,
    nodeSelector: [],
    diskSelector: [],
  }))
  const [currentTab, setCurrentTab] = useState(0)
  const [drVolumeConfigs, setDrVolumeConfigs] = useState(initConfigs)
  const [done, setDone] = useState(false)
  const lastIndex = items.length - 1

  useEffect(() => {
    if (currentTab === lastIndex && done) {
      const data = drVolumeConfigs.map((config, index) => ({
        ...config,
        standby: true,
        frontend: '',
        fromBackup: items[index].fromBackup,
        size: config.size.replace(/\s/ig, ''),
      }))
      onOk(data)
    }
  }, [drVolumeConfigs])

  const handleOk = () => {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
        name: getFieldValue('name').trimLeftAndRight(),
      }
      setDrVolumeConfigs(prev => {
        const newConfigs = [...prev]
        newConfigs.splice(currentTab, 1, data)
        return newConfigs
      })
      if (currentTab !== lastIndex) {
        const nextIndex = currentTab + 1
        setCurrentTab(nextIndex)
        const nextConfig = drVolumeConfigs[nextIndex]
        setFieldsValue({
          name: nextConfig.name,
          size: nextConfig.size,
          numberOfReplicas,
          dataEngine: nextConfig.dataEngine,
          accessMode: nextConfig.accessMode,
          backingImage: nextConfig.backingImage,
          nodeSelector: nextConfig.nodeSelector,
          diskSelector: nextConfig.diskSelector,
        })
      } else if (currentTab === lastIndex) {
        setDone(true)
      }
    })
  }

  const handlePrevious = () => {
    const prevIdx = currentTab - 1
    setCurrentTab(prevIdx)
    const prevConfig = drVolumeConfigs[prevIdx]
    setFieldsValue({
      name: prevConfig.name,
      size: prevConfig.size,
      numberOfReplicas: prevConfig.numberOfReplicas,
      dataEngine: prevConfig.dataEngine,
      accessMode: prevConfig.accessMode,
      backingImage: prevConfig.backingImage,
      nodeSelector: prevConfig.nodeSelector,
      diskSelector: prevConfig.diskSelector,
    })
  }

  const handleFieldChange = () => {
    setDrVolumeConfigs(prev => {
      const newConfigs = [...prev]
      const data = {
        ...getFieldsValue(),
        name: getFieldValue('name')?.trimLeftAndRight() || '',
      }
      newConfigs.splice(currentTab, 1, data)
      return newConfigs
    })
  }

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
      <Button key="back" onClick={handlePrevious} disabled={currentTab === 0}>
        Previous
      </Button>,
      <Button key="submit" type="success" onClick={handleOk}>
        {currentTab === lastIndex ? 'OK' : 'Next'}
      </Button>,
    ],
  }

  const item = drVolumeConfigs[currentTab] || {}
  const activeKey = items[currentTab].volumeName

  return (
    <ModalBlur {...modalOpts}>
      <Tabs className="drVolumeTab" activeKey={activeKey} type="card">
        {items.map(i => <TabPane tab={i.volumeName} key={i.volumeName} />)}
      </Tabs>
      <Form layout="horizontal">
        <FormItem label="Volume Name" hasFeedback {...formItemLayout}>
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
          })(<InputNumber min={1} max={10} onChange={handleFieldChange} />)}
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
          })(<Select disabled>
            { backingImages.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
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
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  items: PropTypes.array,
  onOk: PropTypes.func,
  numberOfReplicas: PropTypes.number,
  nodeTags: PropTypes.array,
  diskTags: PropTypes.array,
  tagsLoading: PropTypes.bool,
  backingImages: PropTypes.array,
  v1DataEngineEnabled: PropTypes.bool,
  v2DataEngineEnabled: PropTypes.bool,
}

export default Form.create()(modal)
