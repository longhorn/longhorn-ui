import React from 'react'
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
import { formatDate } from '../../utils/formatDate'
import { sortByCreatedTime } from '../../utils/sort'

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
    span: 8,
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
  v1DataEngineEnabled,
  v2DataEngineEnabled,
  getSnapshot,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    getFieldValue,
    setFieldsValue,
  },
}) => {
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
    title: 'Create Volume',
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
    })
  }

  const handleDataSourceVolumeChange = (value) => {
    const dataSourceVol = volumeOptions.find(vol => vol.name === value)
    if (getFieldValue('dataSourceType') === dataSourceOptions[1] && dataSourceVol) {
      getSnapshot(dataSourceVol)
      setFieldsValue({
        ...getFieldsValue(),
        size: formatSize(dataSourceVol), // set size field according to the selected data source
        dataSourceSnapshot: '',
      })
    } else {
      setFieldsValue({
        ...getFieldsValue(),
        size: formatSize(dataSourceVol),
      })
    }
  }

  const volumeSnapshots = snapshotsOptions?.length > 0 ? snapshotsOptions.filter(d => d.name !== 'volume-head') : []// no include volume-head
  sortByCreatedTime(volumeSnapshots)
  const dataSourceAlertMsg = 'The volume size is set to the selected volume size. Mismatched size will cause create volume failed.'
  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name || '',
            rules: [
              {
                required: true,
                message: 'Please input volume name',
              },
            ],
          })(<Input />)}
        </FormItem>
        <div style={{ display: 'flex' }}>
        <FormItem label="Size" style={{ flex: '1 0 65%', paddingLeft: 30 }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
          {getFieldDecorator('size', {
            initialValue: item.size,
            rules: [
              {
                required: true,
                message: 'Please input volume size',
              }, {
                validator: (rule, value, callback) => {
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
          })(<InputNumber min={0} max={65535} style={{ width: '330px' }} />)}
        </FormItem>
        <FormItem style={{ flex: '1 0 30%' }}>
          {getFieldDecorator('unit', {
            initialValue: item.unit || 'Gi',
            rules: [{ required: true, message: 'Please select your unit!' }],
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
          })(<InputNumber />)}
        </FormItem>
        <FormItem label="Frontend" hasFeedback {...formItemLayout}>
          {getFieldDecorator('frontend', {
            initialValue: frontends[0].value,
            rules: [
              {
                required: true,
                message: 'Please select a frontend',
              },
            ],
          })(<Select>
          { frontends.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label="Data Locality" hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataLocality', {
            initialValue: defaultDataLocalityValue,
          })(<Select>
          { defaultDataLocalityOption.map(value => <Option key={value} value={value}>{value}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label="Access Mode" hasFeedback {...formItemLayout}>
          {getFieldDecorator('accessMode', {
            initialValue: 'rwo',
          })(<Select>
            <Option key={'ReadWriteOnce'} value={'rwo'}>ReadWriteOnce</Option>
            <Option key={'ReadWriteMany'} value={'rwx'}>ReadWriteMany</Option>
          </Select>)}
        </FormItem>
        <FormItem label="Backing Image" hasFeedback {...formItemLayout}>
          {getFieldDecorator('backingImage', {
            initialValue: '',
          })(<Select allowClear>
            { backingImageOptions.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
          </Select>)}
        </FormItem>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <FormItem label={
              <span>
                Data Source
                <span style={{
                  marginLeft: 4,
                  marginRight: 4,
                }}>
                  <Tooltip
                    overlayStyle={{ width: 450 }}
                    title="Choose data source from existing volume or snapshot. Longhorn will clone the volume data from selected data source"
                  >
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              </span>}
            hasFeedback
            {...formItemLayout}>
            {getFieldDecorator('dataSourceType', { initialValue: '' })(
              <Select allowClear onChange={handleDataSourceTypeChange}>
                {dataSourceOptions.map(value => <Option key={value} value={value}>{value}</Option>) }
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
            <FormItem label="Volume" hasFeedback {...formItemLayout}>
              {getFieldDecorator('dataSourceVolume', { initialValue: '' })(
                <Select allowClear onChange={handleDataSourceVolumeChange}>
                  {volumeOptions.map(vol => <Option key={vol.name} value={vol.name}>{vol.name}</Option>) }
                </Select>
              )}
            </FormItem>
          </Popover>
          )}
        </div>
        {getFieldValue('dataSourceType') === dataSourceOptions[1] && <FormItem label="Snapshot" hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataSourceSnapshot', { initialValue: '' })(
            <Select allowClear optionLabelProp="label" dropdownMenuStyle={{ width: `${volumeSnapshots.length > 0 ? 'fit-content' : 'auto'}` }}>
              {volumeSnapshots.map(snap => <Option key={snap.name} value={snap.name} label={snap.name}>{`${snap.name} (created ${formatDate(snap.created, false)})`}</Option>)}
            </Select>
          )}
          </FormItem>
        }
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
          })(<Select>
            <Option key={'v1'} value={'v1'}>v1</Option>
            <Option key={'v2'} value={'v2'}>v2</Option>
          </Select>)}
        </FormItem>
        <FormItem label="Encrypted" {...formItemLayout}>
          {getFieldDecorator('encrypted', {
            valuePropName: 'checked',
            initialValue: false,
          })(<Checkbox></Checkbox>)}
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
        {/* Advanced Configurations */}
        <Collapse>
          <Panel header="Advanced Configurations" key="1">
            <FormItem label="Snapshot Data Integrity" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('snapshotDataIntegrity', {
                initialValue: 'ignored',
              })(<Select>
              {defaultSnapshotDataIntegrityOption.map(option => <Option key={option.key} value={option.value}>{option.key}</Option>) }
              </Select>)}
            </FormItem>
            <FormItem label={
              <span>
                Snapshot Max Count
                <span style={{
                  marginLeft: 4,
                  marginRight: 4,
                }}>
                  <Tooltip title="Set '0' to inherit global settings">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              </span>
            }
              style={{ flex: 0.6 }}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}>
              {getFieldDecorator('snapshotMaxCount', {
                initialValue: 0,
              })(<InputNumber style={{ width: '250px' }} />) }
            </FormItem>
            <div style={{ display: 'flex', gap: 10 }}>
              <FormItem
                label={
                <span>
                  Snapshot Max Size
                  <span style={{
                    marginLeft: 4,
                    marginRight: 4,
                  }}>
                    <Tooltip title="Set '0' for unrestricted size or at least twice volume size">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                </span>}
                style={{ paddingLeft: 93 }}
                labelCol={{ span: 12 }}
                wrapperCol={{ span: 12 }}
              >
                {getFieldDecorator('snapshotMaxSize', {
                  initialValue: '0',
                })(<Input style={{ maxWidth: '250px' }} />)}
              </FormItem>

               <FormItem>
                {getFieldDecorator('snapshotSizeUnit', {
                  initialValue: item.unit || 'Gi',
                  rules: [{ required: true, message: 'Please select your unit!' }],
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
            <FormItem label="Replicas Auto Balance" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaAutoBalance', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'ignored'} value={'ignored'}>ignored (follow the global setting)</Option>
                <Option key={'disabled'} value={'disabled'}>disabled</Option>
                <Option key={'least-effort'} value={'least-effort'}>least-effort</Option>
                <Option key={'best-effort'} value={'best-effort'}>best-effort</Option>
              </Select>)}
            </FormItem>
            <FormItem label="Allow Snapshot Removal During Trim" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('unmapMarkSnapChainRemoved', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>enabled</Option>
                <Option key={'disabled'} value={'disabled'}>disabled</Option>
                <Option key={'ignored'} value={'ignored'}>ignored (follow the global setting)</Option>
              </Select>)}
            </FormItem>
            <FormItem label="Replica Soft Anti Affinity" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaSoftAntiAffinity', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>enabled</Option>
                <Option key={'disabled'} value={'disabled'}>disabled</Option>
                <Option key={'ignored'} value={'ignored'}>ignored (follow the global setting)</Option>
              </Select>)}
            </FormItem>
            <FormItem label="Replica Zone Soft Anti Affinity" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaZoneSoftAntiAffinity', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>enabled</Option>
                <Option key={'disabled'} value={'disabled'}>disabled</Option>
                <Option key={'ignored'} value={'ignored'}>ignored (follow the global setting)</Option>
              </Select>)}
            </FormItem>
            <FormItem label="Replica Disk Soft Anti Affinity" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaDiskSoftAntiAffinity', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>enabled</Option>
                <Option key={'disabled'} value={'disabled'}>disabled</Option>
                <Option key={'ignored'} value={'ignored'}>ignored (follow the global setting)</Option>
              </Select>)}
            </FormItem>
            <FormItem label="Freeze Filesystem For Snapshot" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('freezeFilesystemForSnapshot', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>enabled</Option>
                <Option key={'disabled'} value={'disabled'}>disabled</Option>
                <Option key={'ignored'} value={'ignored'}>ignored (follow the global setting)</Option>
              </Select>)}
            </FormItem>
            <FormItem label="Disable Revision Counter" {...formItemLayoutForAdvanced}>
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
  defaultDataLocalityValue: PropTypes.string,
  defaultRevisionCounterValue: PropTypes.bool,
  v1DataEngineEnabled: PropTypes.bool,
  v2DataEngineEnabled: PropTypes.bool,
  backingImageOptions: PropTypes.array,
}

export default Form.create()(modal)
