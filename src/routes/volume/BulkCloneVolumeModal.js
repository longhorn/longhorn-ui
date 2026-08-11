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
import { withTranslation } from 'react-i18next'

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
  backupTargets,
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
  t,
}) => {
  const initConfigs = selectedRows.map((i) => ({
    id: i.id,
    name: t('cloneVolume.defaultName', { volumeName: i.name }),
    size: i.size,
    numberOfReplicas: i.numberOfReplicas,
    frontend: i.frontend,
    dataLocality: i.dataLocality || defaultDataLocalityValue,
    accessMode: i.accessMode || null,
    backingImage: i.backingImage,
    backupTargetName: i.backupTargetName || 'default',
    dataSource: i.name,
    encrypted: i.encrypted || false,
    dataEngine: i.dataEngine || 'v1',
    nodeSelector: i.nodeSelector || [],
    diskSelector: i.diskSelector || [],
    cloneMode: 'full-copy'
  }))
  const [tabIndex, setTabIndex] = useState(0)
  const [volumeConfigs, setVolumeConfigs] = useState(initConfigs)
  const [replicaDisabled, setReplicaDisabled] = useState(initConfigs[0].cloneMode === 'linked-clone')


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
    const currentConfig = {
      numberOfReplicas: getFieldValue('numberOfReplicas'),
      frontend: getFieldValue('frontend'),
      dataLocality: getFieldValue('dataLocality'),
      accessMode: getFieldValue('accessMode'),
      encrypted: getFieldValue('encrypted') || false,
      dataEngine: getFieldValue('dataEngine'),
      backupTargetName: getFieldValue('backupTargetName'),
      nodeSelector: getFieldValue('nodeSelector'),
      diskSelector: getFieldValue('diskSelector'),
      cloneMode: getFieldValue('cloneMode'),
    }

    setVolumeConfigs(prev => prev.map((config, index) => {
      if (index === tabIndex) return config

      const updated = { ...config }

      if (config.dataEngine === currentConfig.dataEngine) {
        updated.cloneMode = currentConfig.cloneMode
        updated.numberOfReplicas = currentConfig.cloneMode === 'linked-clone' ? 1 : currentConfig.numberOfReplicas
      }

      updated.frontend = currentConfig.frontend
      updated.dataLocality = currentConfig.dataLocality
      updated.accessMode = currentConfig.accessMode
      updated.encrypted = currentConfig.encrypted
      updated.backupTargetName = currentConfig.backupTargetName
      updated.nodeSelector = currentConfig.nodeSelector
      updated.diskSelector = currentConfig.diskSelector

      return updated
    }))

    setReplicaDisabled(currentConfig.cloneMode === 'linked-clone')

    message.success(
      t('bulkCloneVolumeModal.applySuccess', { volumeName: getFieldValue('name') }),
      5
    )
  }


  const tooltipTitle = t('bulkCloneVolumeModal.applyTooltip', { volumeName: getFieldValue('name') })
  const allFieldsError = { ...getFieldsError() }
  const hasFieldsError = Object.values(allFieldsError).some(fieldError => fieldError !== undefined) || false

  const handleTabClick = (key) => {
    validateFields((errors) => {
      if (errors) {
        message.error(t('bulkCloneVolumeModal.tabSwitchError'), 5)
        return
      }

      const newIndex = selectedRows.findIndex(i => i.id === key)
      if (newIndex === -1) return

      setTabIndex(newIndex)
      const current = volumeConfigs[newIndex]

      setFieldsValue({
        name: current.name,
        size: formatSize(current),
        numberOfReplicas: current.numberOfReplicas,
        frontend: current.frontend,
        dataLocality: current.dataLocality,
        accessMode: current.accessMode,
        backingImage: current.backingImage,
        encrypted: current.encrypted,
        dataEngine: current.dataEngine,
        backupTargetName: current.backupTargetName,
        nodeSelector: current.nodeSelector,
        diskSelector: current.diskSelector,
        cloneMode: current.cloneMode
      })

      setReplicaDisabled(current.cloneMode === 'linked-clone')
    })
  }

  const handleNameChange = (e) => updateVolumeConfig('name', e.target.value)
  const handleReplicasNumberChange = (newNumber) => updateVolumeConfig('numberOfReplicas', newNumber)
  const handleCloneModeChange = (value) => {
    updateVolumeConfig('cloneMode', value)

    if (value === 'linked-clone') {
      updateVolumeConfig('numberOfReplicas', 1)
      setFieldsValue({ numberOfReplicas: 1 })
    }

    setReplicaDisabled(value === 'linked-clone')
  }
  const handleFrontendChange = (value) => updateVolumeConfig('frontend', value)
  const handleDataLocalityChange = (value) => updateVolumeConfig('dataLocality', value)
  const handleAccessModeChange = (value) => updateVolumeConfig('accessMode', value)
  const handleBackupTargetNameChange = (value) => updateVolumeConfig('backupTargetName', value)
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
    title: t('bulkCloneVolumeModal.title'),
    visible,
    onCancel,
    width: 880,
    onOk: handleOk,
    footer: [
      <Button key="cancel" onClick={onCancel}>{t('common.cancel')}</Button>,
      <Tooltip key="applyAllTooltip" overlayStyle={{ width: 300 }} placement="top" title={tooltipTitle}>
        <Button key="applyAll" style={{ marginLeft: 8 }} onClick={handleApplyAll} disabled={hasFieldsError}> {t('bulkCloneVolumeModal.applyAll')} </Button>
      </Tooltip>,
      <Button key="submit" style={{ marginLeft: 8 }} type="success" onClick={handleOk} disabled={hasFieldsError}>
        {t('common.ok')}
      </Button>,
    ],
    style: { top: 0 },
  }

  const item = volumeConfigs[tabIndex] || {}
  const activeKey = item.id // use original volume id as key

  return (
    <ModalBlur {...modalOpts}>
      <Alert style={{ width: 'fit-content', margin: 'auto', marginBottom: 24 }} message={t('cloneVolume.infoMessage')} type="info" showIcon />
      <Tabs className="cloneVolumeTab" activeKey={activeKey} onTabClick={handleTabClick} type="card">
        {selectedRows.map(i => <TabPane tab={i.name} key={i.name} />)}
      </Tabs>
      <Form layout="horizontal">
        <FormItem label={t('common.name')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: t('createVolume.validation.nameRequired'),
              },
            ],
          })(<Input onChange={handleNameChange} />)}
        </FormItem>
        <div style={{ display: 'flex' }}>
          <FormItem label={t('columns.size')} style={{ flex: '1 0 65%', paddingLeft: 30 }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('size', {
              initialValue: formatSize(item),
              rules: [
                {
                  required: true,
                  message: t('common.validation.sizeRequired'),
                }, {
                  validator: (_rule, value, callback) => {
                    if (value === '' || typeof value !== 'number') {
                      callback()
                      return
                    }
                    if (value < 0 || value > 65536) {
                      callback(t('common.validation.valueBetween', { min: 0, max: 65536 }))
                    } else if (!/^\d+([.]\d{1,2})?$/.test(value)) {
                      callback(t('createVolume.validation.sizeDecimal'))
                    } else if (value < 10 && getFieldsValue().unit === 'Mi') {
                      callback(t('createVolume.validation.sizeMinMi'))
                    } else if (value % 1 !== 0 && getFieldsValue().unit === 'Mi') {
                      callback(t('createVolume.validation.sizeNoDecimalMi'))
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
            rules: [{ required: true, message: t('createVolume.validation.unitRequired') }],
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
        <FormItem label={t('columns.dataEngine')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataEngine', {
            initialValue: item.dataEngine || 'v1',
            rules: [
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
          })(<Select disabled>
            <Option key={'v1'} value={'v1'}>v1</Option>
            <Option key={'v2'} value={'v2'}>v2</Option>
          </Select>)}
        </FormItem>
        <FormItem label={t('cloneVolume.fields.cloneMode')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('cloneMode', { initialValue: 'full-copy' })(
            <Select
              disabled={item.dataEngine === 'v1'}
              onChange={handleCloneModeChange}
            >
              <Option key="full-copy" value="full-copy">full-copy</Option>
              {item.dataEngine === 'v2' && (
                <Option key="linked-clone" value="linked-clone">linked-clone</Option>
              )}
            </Select>
          )}
        </FormItem>
        <FormItem label={t('common.numberOfReplicas')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('numberOfReplicas', {
            initialValue: item.numberOfReplicas,
            rules: [
              {
                required: true,
                message: t('common.validation.replicasRequired'),
              },
              {
                validator: (_rule, value, callback) => {
                  if (value === '' || typeof value !== 'number') {
                    callback()
                    return
                  }
                  if (value < 1 || value > 10) {
                    callback(t('common.validation.valueBetween', { min: 1, max: 10 }))
                  } else if (!/^\d+$/.test(value)) {
                    callback(t('createVolume.validation.replicasInteger'))
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber onChange={handleReplicasNumberChange} disabled={replicaDisabled} />)}
        </FormItem>
        <FormItem label={t('common.frontend')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('frontend', {
            initialValue: item.frontend || frontends[0].value,
            rules: [
              {
                required: true,
                message: t('common.validation.frontendRequired'),
              },
            ],
          })(<Select onSelect={handleFrontendChange}>
          { frontends.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label={t('createVolume.fields.dataLocality')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataLocality', {
            initialValue: item.dataLocality || defaultDataLocalityValue,
          })(<Select onSelect={handleDataLocalityChange}>
          { defaultDataLocalityOption.map(value => <Option key={value} value={value}>{value}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label={t('columns.accessMode')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('accessMode', {
            initialValue: item.accessMode || 'rwo',
          })(<Select onSelect={handleAccessModeChange}>
            <Option key={'ReadWriteOnce'} value={'rwo'}>{t('accessModes.rwo')}</Option>
            <Option key={'ReadWriteOncePod'} value={'rwop'}>{t('accessModes.rwop')}</Option>
            <Option key={'ReadWriteMany'} value={'rwx'}>{t('accessModes.rwx')}</Option>
          </Select>)}
        </FormItem>
        <FormItem label={t('common.backingImage')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('backingImage', {
            initialValue: item.backingImage || '',
          })(<Select disabled>
            { backingImageOptions.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label={t('createVolume.fields.dataSource')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataSource', {
            initialValue: item.id || '',
          })(<Select disabled />)}
        </FormItem>
        <FormItem label={t('createVolume.fields.backupTarget')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('backupTargetName', {
            initialValue: item.backupTargetName || '',
          })(<Select allowClear onSelect={handleBackupTargetNameChange}>
            { backupTargets.map(bt => <Option key={bt.name} disabled={bt.available === false} value={bt.name}>{bt.name}</Option>)}
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
              initialValue: item.nodeSelector || [],
            })(<Select mode="tags" onSelect={handleNodeTagAdd} onDeselect={handleNodeTagRemove}>
            { nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label={t('common.diskTag')} hasFeedback {...formItemLayout}>
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
  backupTargets: PropTypes.array,
  defaultDataLocalityOption: PropTypes.array,
  defaultDataLocalityValue: PropTypes.string,
  tagsLoading: PropTypes.bool,
  v1DataEngineEnabled: PropTypes.bool,
  v2DataEngineEnabled: PropTypes.bool,
  backingImageOptions: PropTypes.array,
  t: PropTypes.func,
}

export default Form.create()(withTranslation()(modal))
