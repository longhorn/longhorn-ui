import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Spin, Select, message, Popover, Alert, Tabs, Button, Checkbox, Tooltip } from 'antd'
import { ModalBlur } from '../../components'
import { safeParseJSON } from '../../utils/formatDate'
import { withTranslation } from 'react-i18next'

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
  t,
}) => {
  const initialDataEngine = v1DataEngineEnabled ? 'v1' : 'v2'

  const initConfigs = items.map((i) => {
    const parsedReplicas = safeParseJSON(i.numberOfReplicas)
    const initialReplicas = parseInt(parsedReplicas[initialDataEngine] ?? 3, 10)

    return {
      name: i.volumeName,
      numberOfReplicas: initialReplicas,
      dataEngine: initialDataEngine,
      accessMode: i.accessMode || null,
      latestBackup: i.backupName,
      backingImage: i.backingImage,
      fromBackup: i.fromBackup,
      encrypted: false,
      restoreVolumeRecurringJob: 'ignored',
      nodeSelector: i.nodeSelector || [],
      diskSelector: i.diskSelector || [],
      backupBlockSize: i.blockSize || '0'
    }
  })
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
    message.success(t('bulkRestoreBackupModal.messages.applyAllSuccess', { volumeName: getFieldValue('name') }), 5)
  }

  const allFieldsError = { ...getFieldsError() }
  const hasFieldsError = Object.values(allFieldsError).some(fieldError => fieldError !== undefined) || false

  const handleTabClick = (key) => {
    if (hasFieldsError) {
      message.error(t('bulkRestoreBackupModal.messages.correctErrorsBeforeSwitch'), 5)
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
  const alertMessage = t('bulkRestoreBackupModal.warning.sameNameMessage', { volumeName: getFieldsValue().name })

  const tooltipTitle = t('bulkRestoreBackupModal.tooltips.applyAll', { volumeName: getFieldValue('name') })
  const modalOpts = {
    title: t('bulkRestoreBackupModal.modal.title'),
    visible,
    onOk: handleOk,
    onCancel,
    width: 700,
    footer: [
      <Button key="cancel" onClick={onCancel}>
        {t('common.cancel')}
      </Button>,
      <Tooltip key="applyAllTooltip" overlayStyle={{ width: 300 }} placement="top" title={tooltipTitle}>
        <Button key="applyAll" style={{ marginLeft: 8 }} onClick={handleApplyAll} disabled={hasFieldsError}> {t('bulkRestoreBackupModal.buttons.applyAll')} </Button>
      </Tooltip>,
      <Button key="submit" style={{ marginLeft: 8 }} type="success" onClick={handleOk} disabled={hasFieldsError}>
        {t('common.ok')}
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
          <FormItem label={t('bulkRestoreBackupModal.form.volumeName.label')} hasFeedback {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: item.name,
              rules: [
                {
                  required: true,
                  message: t('bulkRestoreBackupModal.form.volumeName.validationMessage'),
                },
              ],
            })(<Input onChange={handleNameChange} />)}
          </FormItem>
        </Popover>
        <FormItem label={t('columns.dataEngine')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataEngine', {
            initialValue: item.dataEngine,
            rules: [
              {
                required: true,
                message: t('restoreBackupModal.form.dataEngine.validationMessage'),
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
            initialValue: item.numberOfReplicas,
            rules: [
              {
                required: true,
                message: t('restoreBackupModal.form.numberOfReplicas.validationMessage'),
              },
            ],
          })(<InputNumber min={1} max={10} onChange={handleReplicasNumberChange} />)
          }
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
        <FormItem label={t('bulkRestoreBackupModal.form.latestBackup.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('latestBackup', {
            initialValue: item.latestBackup,
          })(<Input disabled />)}
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
        <FormItem label={t('restoreBackupModal.form.restoreVolumeRecurringJob.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('restoreVolumeRecurringJob', {
            initialValue: 'ignored',
          })(<Select onSelect={handleRecurringJobChange}>
            <Option key={'enabled'} value={'enabled'}>{t('restoreBackupModal.form.restoreVolumeRecurringJob.options.enabled')}</Option>
            <Option key={'disabled'} value={'disabled'}>{t('restoreBackupModal.form.restoreVolumeRecurringJob.options.disabled')}</Option>
            <Option key={'ignored'} value={'ignored'}>{t('restoreBackupModal.form.restoreVolumeRecurringJob.options.ignored')}</Option>
          </Select>)}
        </FormItem>
        <Spin spinning={tagsLoading}>
          <FormItem label={t('common.nodeTag')} hasFeedback {...formItemLayout}>
            {getFieldDecorator('nodeSelector', {
              initialValue: [],
            })(<Select mode="tags" onSelect={handleNodeTagAdd} onDeselect={handleNodeTagRemove}>
            {nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label={t('common.diskTag')} hasFeedback {...formItemLayout}>
            {getFieldDecorator('diskSelector', {
              initialValue: [],
            })(<Select mode="tags" onSelect={handleDiskTagAdd} onDeselect={handleDiskTagRemove}>
            {diskTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <FormItem label={t('columns.backupBlockSize')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('backupBlockSize', {
            initialValue: ['0', '2097152', '16777216'].includes(String(item.backupBlockSize))
              ? String(item.backupBlockSize)
              : '0',
          })(
            <Select>
              <Option key="ignored" value="0">{t('restoreBackupModal.form.backupBlockSize.options.ignored')}</Option>
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
  t: PropTypes.func.isRequired,
}

export default withTranslation()(Form.create()(modal))
