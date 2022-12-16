import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Select, Checkbox, Spin, Collapse } from 'antd'
import { ModalBlur } from '../../components'
import { frontends } from './helper/index'
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

const modal = ({
  item,
  visible,
  onCancel,
  onOk,
  nodeTags,
  defaultDataLocalityOption,
  defaultDataLocalityValue,
  defaultRevisionCounterValue,
  defaultSnapshotDataIntegrityOption,
  diskTags,
  backingImages,
  tagsLoading,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    setFieldsValue,
  },
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
        size: `${getFieldsValue().size}${getFieldsValue().unit}`,
      }

      if (data.unit) {
        delete data.unit
      }

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

  return (
    <ModalBlur {...modalOpts}>
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
          })(<Input />)}
        </FormItem>
        <div style={{ display: 'flex' }}>
          <FormItem label="Size" style={{ flex: 0.6, paddingLeft: 75 }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
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
            })(<InputNumber style={{ width: '250px' }} />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('unit', {
              initialValue: item.unit,
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
          })(<Select allowClear={true}>
            { backingImages.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label="Encrypted" {...formItemLayout}>
          {getFieldDecorator('encrypted', {
            valuePropName: 'encrypted',
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
        <Collapse>
          <Panel header="Advanced Configurations" key="1">
            <FormItem label="Snapshot Data Integrity" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('snapshotDataIntegrity', {
                initialValue: 'ignored',
              })(<Select>
              { defaultSnapshotDataIntegrityOption.map(option => <Option key={option.key} value={option.value}>{option.key}</Option>) }
              </Select>)}
            </FormItem>
            <FormItem label="Replicas Auto Balance" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaAutoBalance', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'ignored'} value={'ignored'}>Ignored (Follow the global setting)</Option>
                <Option key={'disabled'} value={'disabled'}>Disabled</Option>
                <Option key={'least-effort'} value={'least-effort'}>Least-Effort</Option>
                <Option key={'best-effort'} value={'best-effort'}>Best-Effort</Option>
              </Select>)}
            </FormItem>
            <FormItem label="Allow Snapshot Removal During Trim" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('unmapMarkSnapChainRemoved', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>Enabled</Option>
                <Option key={'disabled'} value={'disabled'}>Disabled</Option>
                <Option key={'ignored'} value={'ignored'}>Ignored (Follow the global setting)</Option>
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
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  hosts: PropTypes.array,
  nodeTags: PropTypes.array,
  diskTags: PropTypes.array,
  defaultDataLocalityOption: PropTypes.array,
  defaultSnapshotDataIntegrityOption: PropTypes.array,
  tagsLoading: PropTypes.bool,
  defaultDataLocalityValue: PropTypes.string,
  defaultRevisionCounterValue: PropTypes.bool,
  backingImages: PropTypes.array,
}

export default Form.create()(modal)
