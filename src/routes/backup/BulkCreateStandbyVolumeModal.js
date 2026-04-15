import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, InputNumber, Select, message, Spin, Checkbox, Tooltip, Tabs, Button, Input, Popover, Alert } from 'antd'
import { ModalBlur } from '../../components'
import { formatMib } from '../../utils/formatter'
import { safeParseJSON } from '../../utils/formatDate'
import { withTranslation } from 'react-i18next'

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
  t,
}) => {
  const parsedReplicas = safeParseJSON(numberOfReplicas)
  const initialDataEngine = v1DataEngineEnabled ? 'v1' : 'v2'
  const initialReplicas = parseInt(parsedReplicas[initialDataEngine] ?? 3, 10)

  const initConfigs = items.map((i) => ({
    name: i.volumeName,
    size: formatMib(i.size),
    numberOfReplicas: initialReplicas,
    dataEngine: 'v1',
    accessMode: i.accessMode || null,
    backingImage: i.backingImage,
    encrypted: false,
    nodeSelector: [],
    diskSelector: [],
    backupBlockSize: i.blockSize || '0'
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
    message.success(t('bulkCreateStandbyVolumeModal.messages.applyAllSuccess', { volumeName: getFieldValue('name') }), 5)
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
  const handleDataEngineChange = (value) => {
    const replicas = parseInt(parsedReplicas[value] ?? 3, 10)
    updateDrVolumeConfigs('dataEngine', value)
    updateDrVolumeConfigs('numberOfReplicas', replicas)
    setFieldsValue({ numberOfReplicas: replicas })
  }
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
      message.error(t('bulkCreateStandbyVolumeModal.messages.correctErrorsBeforeSwitch'), 5)
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

  const tooltipTitle = t('bulkCreateStandbyVolumeModal.tooltips.applyAll', { volumeName: getFieldValue('name') })
  const modalOpts = {
    title: t('bulkCreateStandbyVolumeModal.modal.title'),
    visible,
    onOk: handleOk,
    onCancel,
    width: 700,
    footer: [
     <Button key="cancel" onClick={onCancel}>
        {t('common.cancel')}
      </Button>,
      <Tooltip key="applyAllTooltip" overlayStyle={{ width: 300 }} placement="top" title={tooltipTitle}>
        <Button key="applyAll" style={{ marginLeft: 8 }} onClick={handleApplyAll} disabled={hasFieldsError}> {t('bulkCreateStandbyVolumeModal.buttons.applyAll')} </Button>
      </Tooltip>,
      <Button key="submit" style={{ marginLeft: 8 }} type="success" onClick={handleOk} disabled={hasFieldsError}>
        {t('common.ok')}
      </Button>,
    ],
  }
  const showWarning = backupVolumes?.some((backupVolume) => backupVolume.name === getFieldValue('name'))
  const alertMessage = t('bulkCreateStandbyVolumeModal.warning.sameNameMessage', { volumeName: getFieldsValue().name })
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
          <FormItem label={t('bulkCreateStandbyVolumeModal.form.volumeName.label')} hasFeedback {...formItemLayout}>
              {getFieldDecorator('name', {
                initialValue: item.name,
                rules: [
                  {
                    required: true,
                    message: t('createStandbyVolumeModal.form.name.validationMessage'),
                  },
                ],
              })(<Input onChange={handleNameChange} />)}
          </FormItem>
        </Popover>
        <FormItem label={t('columns.size')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('size', {
            initialValue: item.size,
            rules: [
              {
                required: true,
                message: t('common.validation.sizeRequired'),
              },
            ],
          })(<Input disabled />)}
        </FormItem>
        <FormItem label={t('columns.dataEngine')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataEngine', {
            initialValue: initialDataEngine,
            rules: [
              {
                required: true,
                message: t('createStandbyVolumeModal.form.dataEngine.validationMessage'),
              },
              {
                validator: (_rule, value, callback) => {
                  if (value === 'v1' && !v1DataEngineEnabled) {
                    callback(t('common.validation.vEngineDisabled', { v: 'v1' }))
                  } else if (value === 'v2' && !v2DataEngineEnabled) {
                    callback(t('common.validation.vEngineDisabled', { v: 'v2' }))
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
        <FormItem label={t('common.numberOfReplicas')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('numberOfReplicas', {
            initialValue: initialReplicas,
            rules: [
              {
                required: true,
                message: t('createStandbyVolumeModal.form.numberOfReplicas.validationMessage'),
              },
            ],
          })(<InputNumber min={1} max={10} onChange={handleReplicasNumberChange} />)}
        </FormItem>
        <FormItem label={t('columns.accessMode')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('accessMode', {
            initialValue: item.accessMode,
          })(<Select onSelect={handleAccessModeChange}>
            <Option key={'ReadWriteOnce'} value={'rwo'}>{t('accessModes.rwo')}</Option>
            <Option key={'ReadWriteOncePod'} value={'rwop'}>{t('accessModes.rwop')}</Option>
            <Option key={'ReadWriteMany'} value={'rwx'}>{t('accessModes.rwx')}</Option>
          </Select>)}
        </FormItem>
        <FormItem label={t('common.backingImage')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('backingImage', {
            initialValue: item.backingImage,
          })(<Select disabled>
            { backingImages.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label={t('common.encrypted')} {...formItemLayout}>
          {getFieldDecorator('encrypted', {
            valuePropName: 'checked',
            initialValue: item.encrypted || false,
          })(<Checkbox onChange={handleEncryptedCheck} />)}
        </FormItem>
        <Spin spinning={tagsLoading}>
          <FormItem label={t('common.nodeTag')} hasFeedback {...formItemLayout}>
            {getFieldDecorator('nodeSelector', {
              initialValue: [],
            })(<Select mode="tags" onSelect={handleNodeTagAdd} onDeselect={handleNodeTagRemove}>
            { nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label={t('common.diskTag')} hasFeedback {...formItemLayout}>
            {getFieldDecorator('diskSelector', {
              initialValue: [],
            })(<Select mode="tags" onSelect={handleDiskTagAdd} onDeselect={handleDiskTagRemove}>
            { diskTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <FormItem label={t('columns.backupBlockSize')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('backupBlockSize', {
            initialValue: ['0', '2097152', '16777216'].includes(String(item.backupBlockSize))
              ? String(item.backupBlockSize)
              : '0',
          })(
            <Select disabled>
              <Option key="ignored" value="0">{t('createStandbyVolumeModal.form.backupBlockSize.options.ignored')}</Option>
              <Option key="2Mi" value="2097152">2 Mi</Option>
              <Option key="16Mi" value="16777216">16 Mi</Option>
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
  t: PropTypes.func.isRequired,
}

export default withTranslation()(Form.create()(modal))
