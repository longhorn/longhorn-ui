import React from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Spin,
  Alert,
} from 'antd'
import { ModalBlur } from '../../components'
import { frontends } from './helper/index'
import { formatSize } from '../../utils/formatter'

const FormItem = Form.Item
const { Option } = Select

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 13 },
}

const genOkData = (getFieldsValue, getFieldValue, volume, cloneType) => {
  const dataSourceResult = getFieldValue('dataSource')
  const dataSource = cloneType === 'volume' ? `vol://${dataSourceResult}` : `snap://${volume.name}/${dataSourceResult}`
  const data = {
    ...volume,
    ...getFieldsValue(),
    size: volume.size,
    dataSource,
  }
  if (data.unit) {
    delete data.unit
  }
  return data
}


const modal = ({
  cloneType = 'volume', // 'volume' or 'snapshot'
  volume = {},
  snapshot = {},
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
    getFieldsValue,
    getFieldValue,
  },
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = genOkData(getFieldsValue, getFieldValue, volume, cloneType)
      onOk(data)
    })
  }

  const modalOpts = {
    title: cloneType === 'volume' ? `Clone Volume from ${volume.name}` : `Clone Volume from ${volume.name} snapshot ${snapshot.name}`,
    visible,
    onCancel,
    width: 880,
    onOk: handleOk,
    style: { top: 0 },
  }

  return (
    <ModalBlur {...modalOpts}>
      <Alert style={{ width: 'fit-content', margin: 'auto', marginBottom: 24 }} message="Longhorn will auto attach the new volume, perform cloning from specified volume, and then detach it" type="info" showIcon />
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: `cloned-${volume.name}`,
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
              initialValue: formatSize(volume),
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
            initialValue: volume.unit || 'Gi',
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
            initialValue: volume.numberOfReplicas,
            rules: [
              {
                required: true,
                message: 'Please input the number of replicas',
              },
              {
                validator: (rule, value, callback) => {
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
            initialValue: volume.frontend || frontends[0].value,
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
            initialValue: volume.dataLocality || defaultDataLocalityValue,
          })(<Select>
          { defaultDataLocalityOption.map(value => <Option key={value} value={value}>{value}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label="Access Mode" hasFeedback {...formItemLayout}>
          {getFieldDecorator('accessMode', {
            initialValue: volume.accessMode || 'rwo',
          })(<Select>
            <Option key={'ReadWriteOnce'} value={'rwo'}>ReadWriteOnce</Option>
            <Option key={'ReadWriteMany'} value={'rwx'}>ReadWriteMany</Option>
          </Select>)}
        </FormItem>
        <FormItem label="Backing Image" hasFeedback {...formItemLayout}>
          {getFieldDecorator('backingImage', {
            initialValue: volume.backingImage || '',
          })(<Select disabled>
            { backingImageOptions.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label="Data Source" hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataSource', {
            initialValue: cloneType === 'volume' ? volume?.name : snapshot?.name,
          })(<Select disabled />)}
        </FormItem>
        <FormItem label="Data Engine" hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataEngine', {
            initialValue: volume.dataEngine || 'v1',
            rules: [
              {
                validator: (rule, value, callback) => {
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
            initialValue: volume.encrypted || false,
          })(<Checkbox></Checkbox>)}
        </FormItem>
        <Spin spinning={tagsLoading}>
          <FormItem label="Node Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('nodeSelector', {
              initialValue: volume.nodeSelector || [],
            })(<Select mode="tags">
            { nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label="Disk Tag" hasFeedback {...formItemLayout}>
            {getFieldDecorator('diskSelector', {
              initialValue: volume.diskSelector || [],
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
  cloneType: PropTypes.string,
  volume: PropTypes.object,
  snapshot: PropTypes.object,
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
