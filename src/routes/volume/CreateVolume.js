import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Spin,
  Collapse,
  Tooltip,
  Icon,
  Alert,
  Popover,
} from 'antd'
import { ModalBlur } from '../../components'
import { frontends } from './helper/index'
import { formatSize } from '../../utils/formatter'
import { formatDate, safeParseJSON } from '../../utils/formatDate'
import { sortByCreatedTime } from '../../utils/sort'
import { withTranslation } from 'react-i18next'

const FormItem = Form.Item
const { Panel } = Collapse
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 13,
  },
}

const formItemLayoutForAdvanced = {
  labelCol: {
    span: 9,
  },
  wrapperCol: {
    span: 14,
  },
}

const dataSourceOptions = ['Volume', 'Volume Snapshot']

const getDataSource = (getFieldValue) => {
  let dataSource = ''
  const dataSourceType = getFieldValue('dataSourceType') || ''
  const dataSourceVol = getFieldValue('dataSourceVolume') || ''
  const dataSourceSnapshot = getFieldValue('dataSourceSnapshot') || ''
  if (dataSourceType && dataSourceVol) {
    switch (dataSourceType) {
      case 'Volume':
        dataSource = `vol://${dataSourceVol}`
        break
      case 'Volume Snapshot':
        dataSource = dataSourceSnapshot ? `snap://${dataSourceVol}/${dataSourceSnapshot}` : ''
        break
      default:
    }
  }
  return dataSource
}

const getSize = (getFieldValue, volumeOptions) => {
  const dataSourceType = getFieldValue('dataSourceType') || ''
  const dataSourceVol = getFieldValue('dataSourceVolume') || ''
  const dataSourceSnapshot = getFieldValue('dataSourceSnapshot') || ''

  if (dataSourceType && dataSourceType === dataSourceOptions[0] && dataSourceVol) {
    const sourceVolSize = volumeOptions.find(vol => vol.name === dataSourceVol)?.size || 0
    return sourceVolSize
  }

  if (dataSourceType && dataSourceType === dataSourceOptions[1] && dataSourceVol && dataSourceSnapshot) {
    const sourceVolSize = volumeOptions.find(vol => vol.name === dataSourceVol)?.size || 0
    return sourceVolSize
  }

  return `${getFieldValue('size')}${getFieldValue('unit')}`
}

const genOkData = (getFieldsValue, getFieldValue, volumeOptions) => {
  const data = {
    ...getFieldsValue(),
    dataSource: getDataSource(getFieldValue),
    size: getSize(getFieldValue, volumeOptions),
    snapshotMaxSize: `${getFieldsValue().snapshotMaxSize}${getFieldsValue().snapshotSizeUnit}`,
  }
  if (data.dataSourceType) {
    delete data.dataSourceType
  }
  if (data.unit) {
    delete data.unit
  }
  return data
}


const modal = ({
  item,
  volumeOptions = [],
  snapshotsOptions = [],
  visible,
  onCancel,
  onOk,
  nodeTags,
  defaultDataLocalityOption,
  defaultDataLocalityValue,
  defaultRevisionCounterValue,
  defaultSnapshotDataIntegrityOption,
  diskTags,
  backingImageOptions,
  tagsLoading,
  backupTargets,
  v1DataEngineEnabled,
  v2DataEngineEnabled,
  getSnapshot,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    getFieldValue,
    setFieldsValue,
    resetFields
  },
  t,
}) => {
  const [filteredBackingImages, setFilteredBackingImages] = useState([])

  useEffect(() => {
    const dataEngine = getFieldValue('dataEngine')
    setFilteredBackingImages(backingImageOptions.filter(image => image.dataEngine === dataEngine))
  }, [])
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = genOkData(getFieldsValue, getFieldValue, volumeOptions)
      onOk(data)
    })
  }

  const modalOpts = {
    title: t('createVolume.title'),
    visible,
    onCancel,
    width: 880,
    onOk: handleOk,
    style: { top: 0 },
  }

  function unitChange(value) {
    let currentSize = getFieldsValue().size

    if (value === 'Gi') {
      currentSize /= 1024
    } else {
      currentSize *= 1024
    }
    setFieldsValue({
      ...getFieldsValue(),
      unit: value,
      size: currentSize,
    })
  }
  const displayDataSourceAlert = () => {
    const selectedVol = getFieldValue('dataSourceVolume')
    if (selectedVol === '' || selectedVol === undefined) {
      return false
    } else {
      return true
    }
  }

  const handleDataSourceTypeChange = () => {
    setFieldsValue({
      ...getFieldsValue(),
      dataSourceVolume: '',
      dataSourceSnapshot: ''
    })
  }

  const handleDataSourceVolumeChange = (value) => {
    const dataSourceVol = volumeOptions.find(vol => vol.name === value)

    if (getFieldValue('dataSourceType') === dataSourceOptions[1] && dataSourceVol) {
      getSnapshot(dataSourceVol)
    }

    setFieldsValue({
      ...getFieldsValue(),
      size: formatSize(dataSourceVol),
      dataSourceSnapshot: '',
    })
  }

  const dataSourceVolume = getFieldValue('dataSourceVolume')
  const volumeSnapshots = dataSourceVolume && snapshotsOptions?.length > 0
    ? snapshotsOptions.filter(snap => snap.name !== 'volume-head')
    : []
  sortByCreatedTime(volumeSnapshots)
  const dataSourceAlertMsg = t('createVolume.dataSourceAlert')

  const parsedReplicas = safeParseJSON(item.numberOfReplicas || '{}')
  const parsedUblkNumberOfQueue = safeParseJSON(item.ublkNumberOfQueue || '{}')
  const parsedUblkQueueDepth = safeParseJSON(item.ublkQueueDepth || '{}')

  const initialDataEngine = v1DataEngineEnabled ? 'v1' : 'v2'
  const initialReplicas = parseInt(parsedReplicas[initialDataEngine] ?? 3, 10)

  const currentDataEngine = getFieldValue('dataEngine')
  const initialUblkNumberOfQueue = Number(parsedUblkNumberOfQueue[currentDataEngine] ?? 0)
  const initialUblkQueueDepth = Number(parsedUblkQueueDepth[currentDataEngine] ?? 0)

  // filter options based on selected data engine version
  const handleDataEngineChange = (engine) => {
    const fields = getFieldsValue()
    const replicas = parseInt(parsedReplicas[engine] ?? 3, 10)

    // update filtered backing images
    setFilteredBackingImages(backingImageOptions.filter(image => image.dataEngine === engine))
    setFieldsValue({
      ...fields,
      numberOfReplicas: replicas, // update number of replicas
      backingImage: '',
      frontend: frontends[0].value,
      dataSourceVolume: '',
      dataSourceSnapshot: '',
    })

    if (engine === 'v2') {
      resetFields(['rebuildConcurrentSyncLimit'])
    }
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('common.name')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name || '',
            rules: [
              {
                required: true,
                message: t('createVolume.validation.nameRequired'),
              },
            ],
          })(<Input />)}
        </FormItem>
        <div style={{ display: 'flex' }}>
          <FormItem label={t('columns.size')} style={{ flex: '1 0 65%', paddingLeft: 30 }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('size', {
              initialValue: item.size,
              rules: [
                {
                  required: true,
                  message: t('common.validation.sizeRequired'),
                }, {
                  validator: (rule, value, callback) => {
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
            })(<InputNumber min={0} max={65535} style={{ width: '330px' }} />)}
          </FormItem>
          <FormItem style={{ flex: '1 0 30%' }}>
            {getFieldDecorator('unit', {
              initialValue: item.unit || 'Gi',
              rules: [{ required: true, message: t('createVolume.validation.unitRequired') }],
            })(
              <Select
                style={{ width: '100px' }}
                onChange={unitChange}
              >
                <Option value="Mi">Mi</Option>
                <Option value="Gi">Gi</Option>
              </Select>,
            )}
          </FormItem>
        </div>
        <FormItem label={t('columns.dataEngine')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataEngine', {
            initialValue: initialDataEngine,
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
          })(<Select onChange={handleDataEngineChange}>
            <Option key={'v1'} value={'v1'}>v1</Option>
            <Option key={'v2'} value={'v2'}>v2</Option>
          </Select>)}
        </FormItem>
        <FormItem label={t('common.numberOfReplicas')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('numberOfReplicas', {
            initialValue: initialReplicas,
            rules: [
              { required: true, message: t('common.validation.replicasRequired') },
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
          })(<InputNumber />)}
        </FormItem>
        <FormItem label={t('common.frontend')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('frontend', {
            initialValue: frontends[0].value,
            rules: [{ required: true, message: t('common.validation.frontendRequired') }],
          })(
            <Select>
              {frontends.map(({ value, label, dataEngine }) => {
                const selectedDataEngine = getFieldValue('dataEngine')
                return dataEngine.includes(selectedDataEngine) ? (
                  <Option key={value} value={value}>
                    {label}
                  </Option>
                ) : null
              })}
            </Select>
          )}
        </FormItem>
        {getFieldValue('frontend') === 'ublk' && (
          <>
            {['ublkNumberOfQueue', 'ublkQueueDepth'].map((field) => {
              const label = field === 'ublkNumberOfQueue'
                ? t('createVolume.fields.ublkNumberOfQueue')
                : t('createVolume.fields.ublkQueueDepth')

              const initialValue = field === 'ublkNumberOfQueue'
                ? initialUblkNumberOfQueue
                : initialUblkQueueDepth

              const requiredMessage = field === 'ublkNumberOfQueue'
                ? t('createVolume.validation.ublkNumberOfQueueRequired')
                : t('createVolume.validation.ublkQueueDepthRequired')

              return (
                <FormItem key={field} label={label} hasFeedback {...formItemLayout}>
                  {getFieldDecorator(field, {
                    initialValue,
                    rules: [{ required: true, message: requiredMessage }],
                  })(
                    <InputNumber
                      parser={(value) => Number(String(value).replace(/[^\d]/g, ''))}
                      min={0}
                    />
                  )}
                </FormItem>
              )
            })}
          </>
        )}
        <FormItem label={t('createVolume.fields.dataLocality')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataLocality', {
            initialValue: defaultDataLocalityValue,
          })(<Select>
          { defaultDataLocalityOption.map(value => <Option key={value} value={value}>{value}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label={t('columns.accessMode')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('accessMode', {
            initialValue: 'rwo',
          })(<Select>
            <Option key={'ReadWriteOnce'} value={'rwo'}>{t('accessModes.rwo')}</Option>
            <Option key={'ReadWriteOncePod'} value={'rwop'}>{t('accessModes.rwop')}</Option>
            <Option key={'ReadWriteMany'} value={'rwx'}>{t('accessModes.rwx')}</Option>
          </Select>)}
        </FormItem>
        <FormItem label={t('common.backingImage')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('backingImage', {
            initialValue: '',
          })(<Select allowClear>
              { filteredBackingImages.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
          </Select>)}
        </FormItem>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <FormItem label={
              <span>
                {t('createVolume.fields.dataSource')}
                <span style={{
                  marginLeft: 4,
                  marginRight: 4,
                }}>
                  <Tooltip
                    overlayStyle={{ width: 450 }}
                    title={t('createVolume.tooltips.dataSource')}
                  >
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              </span>}
            hasFeedback
            {...formItemLayout}>
            {getFieldDecorator('dataSourceType', { initialValue: '' })(
              <Select allowClear onChange={handleDataSourceTypeChange}>
                {dataSourceOptions.map(value => <Option key={value} value={value}>{t(`createVolume.dataSourceOptions.${value.replace(' ', '')}`)}</Option>) }
              </Select>
            )}
          </FormItem>
          {getFieldValue('dataSourceType') && (<Popover placement="right"
            visible={displayDataSourceAlert()}
            content={
              <div style={{ maxWidth: 300 }}>
                <Alert message={dataSourceAlertMsg} type="warning" />
              </div>
            }
          >
            <FormItem label={t('createVolume.fields.volume')} hasFeedback {...formItemLayout}>
              {getFieldDecorator('dataSourceVolume', { initialValue: '' })(
                (() => {
                  const selectedDataEngine = getFieldValue('dataEngine')
                  const filteredOptions = volumeOptions
                    .filter(vol => vol.dataEngine === selectedDataEngine)
                    .map(vol => (
                      <Option key={vol.name} value={vol.name}>
                        {vol.name}
                      </Option>
                    ))

                  return (
                    <Select allowClear onChange={handleDataSourceVolumeChange}>
                      {filteredOptions}
                    </Select>
                  )
                })()
              )}
            </FormItem>
          </Popover>
          )}
        </div>
        {getFieldValue('dataSourceType') === dataSourceOptions[1] && <FormItem label={t('createVolume.fields.snapshot')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataSourceSnapshot', { initialValue: '' })(
            <Select allowClear optionLabelProp="label" dropdownMenuStyle={{ width: `${volumeSnapshots.length > 0 ? 'fit-content' : 'auto'}` }}>
              {volumeSnapshots.map(snap => <Option key={snap.name} value={snap.name} label={snap.name}>{`${snap.name} (${t('createVolume.created')} ${formatDate(snap.created, false)})`}</Option>)}
            </Select>
          )}
          </FormItem>
        }
        <FormItem label={t('createVolume.fields.backupTarget')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('backupTargetName', {
            // init backup target is the default one
            initialValue: backupTargets.find(bt => bt.name === 'default')?.name || '',
          })(<Select allowClear>
            { backupTargets.map(bt => <Option key={bt.name} disabled={bt.available === false} value={bt.name}>{bt.name}</Option>)}
          </Select>)}
        </FormItem>
        <FormItem label={t('common.encrypted')} {...formItemLayout}>
          {getFieldDecorator('encrypted', {
            valuePropName: 'checked',
            initialValue: false,
          })(<Checkbox></Checkbox>)}
        </FormItem>
        <Spin spinning={tagsLoading}>
          <FormItem label={t('common.nodeTag')} hasFeedback {...formItemLayout}>
            {getFieldDecorator('nodeSelector', {
              initialValue: [],
            })(<Select mode="tags">
            { nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label={t('common.diskTag')} hasFeedback {...formItemLayout}>
            {getFieldDecorator('diskSelector', {
              initialValue: [],
            })(<Select mode="tags">
            { diskTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        {/* Advanced Configurations */}
        <Collapse>
          <Panel header={t('createVolume.advancedConfigurations')} key="1">
            <FormItem label={t('columns.backupBlockSize')} hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('backupBlockSize', { initialValue: '0' })(
                <Select>
                  <Option key={'ignored'} value={'0'}>{t('createVolume.options.ignored')}</Option>
                  <Option key={'2Mi'} value={'2097152'}>2 Mi</Option>
                  <Option key={'16Mi'} value={'16777216'}>16 Mi</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label={t('createVolume.fields.snapshotDataIntegrity')} hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('snapshotDataIntegrity', {
                initialValue: 'ignored',
              })(<Select>
              {defaultSnapshotDataIntegrityOption.map(option => <Option key={option.key} value={option.value}>{option.key}</Option>) }
              </Select>)}
            </FormItem>
            <FormItem label={
              <span>
                {t('createVolume.fields.snapshotMaxCount')}
                <span style={{
                  marginLeft: 4,
                  marginRight: 4,
                }}>
                  <Tooltip title={t('createVolume.tooltips.setInheritGlobal', { value: '0' })}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              </span>
            }
              {...formItemLayoutForAdvanced}
            >
              {getFieldDecorator('snapshotMaxCount', {
                initialValue: 0,
              })(<InputNumber style={{ width: '250px' }} />) }
            </FormItem>
              <FormItem
                label={
                <span>
                  {t('createVolume.fields.snapshotMaxSize')}
                  <span style={{
                    marginLeft: 4,
                    marginRight: 4,
                  }}>
                    <Tooltip title={t('createVolume.tooltips.snapshotMaxSize')}>
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                </span>}
                {...formItemLayoutForAdvanced}
              >
                <div style={{ display: 'flex', gap: 10 }}>
                  {getFieldDecorator('snapshotMaxSize', {
                    initialValue: '0',
                  })(<Input style={{ maxWidth: '250px' }} />)}
                  {getFieldDecorator('snapshotSizeUnit', {
                    initialValue: item.unit || 'Gi',
                    rules: [{ required: true, message: t('createVolume.validation.unitRequired') }],
                  })(
                    <Select
                      style={{ width: '100px' }}
                      onChange={unitChange}
                    >
                      <Option value="Mi">Mi</Option>
                      <Option value="Gi">Gi</Option>
                    </Select>,
                  )}
                </div>
              </FormItem>
              {getFieldValue('dataEngine') === 'v1' && (
                <FormItem
                  label={
                    <span>
                      {t('createVolume.fields.rebuildConcurrentSyncLimit')}
                      <span style={{ marginLeft: 4, marginRight: 4 }}>
                        <Tooltip title={t('createVolume.tooltips.setInheritGlobal', { value: '0' })}>
                          <Icon type="question-circle-o" />
                        </Tooltip>
                      </span>
                    </span>
                  }
                  {...formItemLayoutForAdvanced}
                >
                  {getFieldDecorator('rebuildConcurrentSyncLimit', {
                    initialValue: 0,
                    rules: [
                      { type: 'number', min: 0, max: 5, message: t('createVolume.validation.rebuildConcurrentSyncLimit') }
                    ],
                  })(
                    <InputNumber min={0} max={5} style={{ width: '250px' }} />
                  )}
                </FormItem>
              )}
            <FormItem label={t('createVolume.fields.replicasAutoBalance')} hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaAutoBalance', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'ignored'} value={'ignored'}>{t('createVolume.options.ignored')}</Option>
                <Option key={'disabled'} value={'disabled'}>{t('createVolume.options.disabled')}</Option>
                <Option key={'least-effort'} value={'least-effort'}>{t('createVolume.options.leastEffort')}</Option>
                <Option key={'best-effort'} value={'best-effort'}>{t('createVolume.options.bestEffort')}</Option>
              </Select>)}
            </FormItem>
            <FormItem label={t('createVolume.fields.allowSnapshotRemovalDuringTrim')} hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('unmapMarkSnapChainRemoved', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>{t('createVolume.options.enabled')}</Option>
                <Option key={'disabled'} value={'disabled'}>{t('createVolume.options.disabled')}</Option>
                <Option key={'ignored'} value={'ignored'}>{t('createVolume.options.ignored')}</Option>
              </Select>)}
            </FormItem>
            <FormItem label={t('createVolume.fields.replicaSoftAntiAffinity')} hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaSoftAntiAffinity', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>{t('createVolume.options.enabled')}</Option>
                <Option key={'disabled'} value={'disabled'}>{t('createVolume.options.disabled')}</Option>
                <Option key={'ignored'} value={'ignored'}>{t('createVolume.options.ignored')}</Option>
              </Select>)}
            </FormItem>
            <FormItem label={t('createVolume.fields.replicaZoneSoftAntiAffinity')} hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaZoneSoftAntiAffinity', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>{t('createVolume.options.enabled')}</Option>
                <Option key={'disabled'} value={'disabled'}>{t('createVolume.options.disabled')}</Option>
                <Option key={'ignored'} value={'ignored'}>{t('createVolume.options.ignored')}</Option>
              </Select>)}
            </FormItem>
            <FormItem label={t('createVolume.fields.replicaDiskSoftAntiAffinity')} hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaDiskSoftAntiAffinity', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>{t('createVolume.options.enabled')}</Option>
                <Option key={'disabled'} value={'disabled'}>{t('createVolume.options.disabled')}</Option>
                <Option key={'ignored'} value={'ignored'}>{t('createVolume.options.ignored')}</Option>
              </Select>)}
            </FormItem>
            <FormItem label={t('createVolume.fields.freezeFilesystemForSnapshot')} hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('freezeFilesystemForSnapshot', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>{t('createVolume.options.enabled')}</Option>
                <Option key={'disabled'} value={'disabled'}>{t('createVolume.options.disabled')}</Option>
                <Option key={'ignored'} value={'ignored'}>{t('createVolume.options.ignored')}</Option>
              </Select>)}
            </FormItem>
            <FormItem label={t('createVolume.fields.offlineRebuilding')} hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('offlineRebuilding', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>{t('createVolume.options.enabled')}</Option>
                <Option key={'disabled'} value={'disabled'}>{t('createVolume.options.disabled')}</Option>
                <Option key={'ignored'} value={'ignored'}>{t('createVolume.options.ignored')}</Option>
              </Select>)}
            </FormItem>
            {getFieldValue('dataEngine') === 'v2' && (
              <FormItem
                label={
                  <span>{t('createVolume.fields.replicaRebuildingBandwidthLimit')}
                    <span style={{ marginLeft: 4, marginRight: 4 }}>
                      <Tooltip title={t('createVolume.tooltips.setInheritGlobal', { value: '0' })}>
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  </span>
                }
                {...formItemLayoutForAdvanced}
              >
                {getFieldDecorator('replicaRebuildingBandwidthLimit', {
                  initialValue: 0,
                })(<InputNumber style={{ width: '250px' }} />) }
              </FormItem>
            )}
            <FormItem label={t('createVolume.fields.disableRevisionCounter')} {...formItemLayoutForAdvanced}>
              {getFieldDecorator('revisionCounterDisabled', {
                valuePropName: 'checked',
                initialValue: defaultRevisionCounterValue,
              })(<Checkbox></Checkbox>)}
            </FormItem>
          </Panel>
        </Collapse>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  volumeOptions: PropTypes.array,
  snapshotsOptions: PropTypes.array,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  getSnapshot: PropTypes.func,
  nodeTags: PropTypes.array,
  diskTags: PropTypes.array,
  defaultDataLocalityOption: PropTypes.array,
  defaultSnapshotDataIntegrityOption: PropTypes.array,
  tagsLoading: PropTypes.bool,
  backupTargets: PropTypes.array,
  defaultDataLocalityValue: PropTypes.string,
  defaultRevisionCounterValue: PropTypes.bool,
  v1DataEngineEnabled: PropTypes.bool,
  v2DataEngineEnabled: PropTypes.bool,
  backingImageOptions: PropTypes.array,
  t: PropTypes.func,
}

export default Form.create()(withTranslation()(modal))
