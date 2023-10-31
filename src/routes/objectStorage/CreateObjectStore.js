import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Collapse, Select, Spin, Checkbox } from 'antd'
import { ModalBlur, SizeInput, EndpointInput } from '../../components'

const FormItem = Form.Item
const Panel = Collapse.Panel
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 17,
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
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    setFieldsValue,
  },
  item,
  visible,
  tagsLoading,
  onCancel,
  onOk,
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) { return }

      const data = {
        ...getFieldsValue(),
        size: `${getFieldsValue().size}${getFieldsValue().unit}`,
        staleReplicaTimeout: 2880,
      }

      if (data.unit) { delete data.unit }

      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Create Object Store',
    visible,
    onCancel,
    width: 800,
    onOk: handleOk,
    style: { top: 0 },
  }

  const sizeInputProps = {
    state: item,
    getFieldDecorator,
    getFieldsValue,
    setFieldsValue,
  }

  const endpointInputProps = {
    state: item,
    tlsSecrets: item.tlsSecrets,
    getFieldDecorator,
    getFieldsValue,
    setFieldsValue,
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
                message: 'Please input the object store name',
              },
            ],
          })(<Input />)}
        </FormItem>

        <div style={{ paddingLeft: 35 }}>
          <SizeInput {...sizeInputProps}>
          </SizeInput>
        </div>

        <FormItem label="Access Key" hasFeedback {...formItemLayout}>
          {getFieldDecorator('accesskey', {
            initialValue: item.accesskey,
            rules: [
              {
                required: true,
                message: 'Please input an access key',
              },
              {
                pattern: /^[\w]+/,
                message: 'The access key contains invalid characters',
              },
              {
                min: 16,
                message: 'Minimum length is 16 characters',
              },
              {
                max: 128,
                message: 'Maximum length is 128 characters',
              },
            ],
          })(<Input />)}
        </FormItem>

        <FormItem label="Secret Key" hasFeedback {...formItemLayout}>
          {getFieldDecorator('secretkey', {
            initialValue: item.secretkey,
            rules: [
              {
                required: true,
                message: 'Please input a secret key',
              },
              {
                min: 16,
                message: 'Minimum length is 16 characters',
              },
            ],
          })(<Input.Password />)}
        </FormItem>

        <Collapse>
          <Panel header="Endpoints" key="1">
            <EndpointInput {...endpointInputProps}>
            </EndpointInput>
          </Panel>
        </Collapse>

        <Collapse>
          <Panel header="Data Placement" key="2">
            <FormItem label="Number of Replicas" hasFeedback {...formItemLayoutForAdvanced}>
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

            <Spin spinning={tagsLoading}>
              <FormItem label="Node Tag" hasFeedback {...formItemLayoutForAdvanced}>
                {getFieldDecorator('nodeSelector', {
                  initialValue: item.nodeTags,
                })(<Select mode="tags">
                { item.nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
                </Select>)}
              </FormItem>
            </Spin>

            <Spin spinning={tagsLoading}>
              <FormItem label="Disk Tag" hasFeedback {...formItemLayoutForAdvanced}>
                {getFieldDecorator('diskSelector', {
                  initialValue: item.diskTags,
                })(<Select mode="tags">
                { item.diskTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
                </Select>)}
              </FormItem>
            </Spin>

            <FormItem label="Replica Soft Anti Affinity" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaSoftAntiAffinity', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>Enabled</Option>
                <Option key={'disabled'} value={'disabled'}>Disabled</Option>
                <Option key={'ignored'} value={'ignored'}>Ignored (Follow the global setting)</Option>
              </Select>)}
            </FormItem>

            <FormItem label="Replica Zone Soft Anti Affinity" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaZoneSoftAntiAffinity', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>Enabled</Option>
                <Option key={'disabled'} value={'disabled'}>Disabled</Option>
                <Option key={'ignored'} value={'ignored'}>Ignored (Follow the global setting)</Option>
              </Select>)}
            </FormItem>

            <FormItem label="Replica Disk Soft Anti Affinity" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('replicaDiskSoftAntiAffinity', {
                initialValue: 'ignored',
              })(<Select>
                <Option key={'enabled'} value={'enabled'}>Enabled</Option>
                <Option key={'disabled'} value={'disabled'}>Disabled</Option>
                <Option key={'ignored'} value={'ignored'}>Ignored (Follow the global setting)</Option>
              </Select>)}
            </FormItem>

            <FormItem label="Data Locality" hasFeedback {...formItemLayout}>
              {getFieldDecorator('dataLocality', {
                initialValue: item.defaultDataLocalityValue,
              })(<Select>
              { item.defaultDataLocalityOption.map(value => <Option key={value} value={value}>{value}</Option>) }
              </Select>)}
            </FormItem>
          </Panel>
        </Collapse>

        <Collapse>
          <Panel header="Advanced Configurations" key="3">
            <FormItem label="Backend Data Engine" hasFeedback {...formItemLayoutForAdvanced}>
              {getFieldDecorator('backendStoreDriver', {
                initialValue: 'v1',
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if (value === 'v2' && !item.enableSPDKDataEngineValue) {
                        callback('SPDK data engine is not enabled')
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

            <FormItem label="Disable Revision Counter" {...formItemLayoutForAdvanced}>
              {getFieldDecorator('revisionCounterDisabled', {
                valuePropName: 'checked',
                initialValue: item.defaultRevisionCounterValue,
              })(<Checkbox></Checkbox>)}
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
          </Panel>
        </Collapse>
      </Form>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  item: PropTypes.object,
  visible: PropTypes.bool,
  tagsLoading: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
}

export default Form.create()(modal)
