/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Select, Upload, Button, Icon, InputNumber, Spin } from 'antd'
import { ModalBlur } from '../../components'
import { hasReadyBackingDisk } from '../../utils/status'

const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 15,
  },
}

const allowDisplayTypes = (creationType, typeArray = []) => typeArray.includes(creationType)

const genDataFromType = (type, getFieldValue) => {
  const payload = {
    name: getFieldValue('name'),
    sourceType: getFieldValue('sourceType'),
    minNumberOfCopies: getFieldValue('minNumberOfCopies'),
    diskSelector: getFieldValue('diskSelector'),
    nodeSelector: getFieldValue('nodeSelector'),
  }

  switch (type) {
    case 'download':
      return {
        ...payload,
        parameters: {
          url: getFieldValue('url'),
        },
        expectedChecksum: getFieldValue('expectedChecksum'),
      }
    case 'upload':
      return {
        ...payload,
        parameters: {},
        fileContainer: getFieldValue('fileContainer'),
        expectedChecksum: getFieldValue('expectedChecksum'),
      }
    case 'volume':
      return {
        ...payload,
        parameters: {
          'volume-name': getFieldValue('volumeName'),
          'export-type': getFieldValue('exportType'),
        },
        sourceType: 'export-from-volume',
      }
    case 'clone':
      return {
        ...payload,
        parameters: {
          'backing-image': getFieldValue('sourceBackingImage'),
          encryption: getFieldValue('encryption'),
          secret: getFieldValue('secret'),
          'secret-namespace': getFieldValue('secretNamespace'),
        },
      }
    default:
  }
}

const modal = ({
  item,
  volumeNameOptions,
  tagsLoading,
  defaultNumberOfReplicas,
  nodeTags,
  diskTags,
  backingImageOptions = [],
  visible,
  onCancel,
  onOk,
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
      const data = genDataFromType(getFieldValue('sourceType'), getFieldValue)
      onOk(data)
    })
  }

  const modalOpts = {
    title: 'Create Backing Image',
    visible,
    onCancel,
    width: 1040,
    onOk: handleOk,
  }

  const uploadProps = {
    showUploadList: false,
    beforeUpload: (file) => {
      setFieldsValue({
        fileContainer: file,
      })
      return false
    },
  }

  const creationType = getFieldValue('sourceType')
  const availBackingImages = backingImageOptions?.filter(image => hasReadyBackingDisk(image)) || []

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: 'Please input backing image name',
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="Created From" {...formItemLayout}>
          {getFieldDecorator('sourceType', {
            valuePropName: 'sourceType',
            initialValue: 'download',
            rules: [
              {
                required: true,
              },
            ],
          })(<Select defaultValue={'download'} onChange={() => {}}>
            <Option value={'download'}>Download From URL</Option>
            <Option value={'upload'}>Upload From Local</Option>
            <Option value={'volume'}>Export From a Longhorn Volume</Option>
            <Option value={'clone'}>Clone From Existing Backing Image</Option>
          </Select>)}
        </FormItem>
        {/* Display when select type = volume */}
        {allowDisplayTypes(creationType, ['volume']) && (
          <>
            <FormItem label="Volume Name" {...formItemLayout}>
              {getFieldDecorator('volumeName', {
                initialValue: '',
                rules: [
                  {
                    required: creationType === 'volume',
                    message: 'Please select an existing volume',
                  },
                ],
              })(<Select>
            {volumeNameOptions.map(vol => <Option key={vol} value={vol}>{vol}</Option>)}
          </Select>)}
            </FormItem>
            <FormItem label="Exported Backing Image Type" {...formItemLayout}>
              {getFieldDecorator('exportType', {
                valuePropName: 'exportType',
                initialValue: 'raw',
                rules: [
                  {
                    required: true,
                  },
                ],
              })(<Select defaultValue={'raw'}>
                <Option value={'raw'}>raw</Option>
                <Option value={'qcow2'}>qcow2</Option>
              </Select>)}
            </FormItem>
          </>
        )}
        {/* Display when select type = download */}
        {allowDisplayTypes(creationType, ['download']) && (
          <FormItem label="URL" {...formItemLayout}>
          {getFieldDecorator('url', {
            initialValue: item.url,
            rules: [
              {
                required: creationType === 'download',
                message: 'Please input backing image url',
              },
            ],
          })(<Input disabled={!(creationType === 'download')} />)}
          </FormItem>
        )}
        {/* Display when select type = upload */}
        {allowDisplayTypes(creationType, ['upload']) && (
          <FormItem label="File" {...formItemLayout}>
          {getFieldDecorator('fileContainer', {
            valuePropName: 'fileContainer',
            initialValue: null,
            rules: [
              {
                required: creationType === 'upload',
                message: 'Please upload backing image file',
              },
              {
                validator: (_rule, value, callback) => {
                  if (creationType === 'upload') {
                    let size = 0
                    if (value && value.size) {
                      size = value.size
                    }
                    if (size % 512 === 0) {
                      callback()
                    } else {
                      callback('Must be a multiple of 512 bytes')
                    }
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<Upload {...uploadProps}>
            <Button disabled={!(creationType === 'upload')}>
              <Icon type="upload" /> Upload
            </Button>
          </Upload>)}
          <span style={{ marginLeft: 10 }}>{ getFieldsValue().fileContainer && getFieldsValue().fileContainer.file ? getFieldsValue().fileContainer.file.name : ''}</span>
          </FormItem>
        )}
        {allowDisplayTypes(creationType, ['download', 'upload']) && (
          <FormItem label="Expected Checksum" {...formItemLayout}>
            {getFieldDecorator('expectedChecksum', {
              initialValue: '',
              rules: [
                {
                  required: false,
                },
              ],
            })(<Input placeholder="Ask Longhorn to validate the SHA512 checksum if it is specified here." />)}
          </FormItem>
        )}

        {/* Display when select type = clone */}
        {allowDisplayTypes(creationType, ['clone']) && (
          <>
            <FormItem label="Source Backing Image" {...formItemLayout}>
            {getFieldDecorator('sourceBackingImage', {
              valuePropName: 'sourceBackingImage',
              initialValue: availBackingImages[0]?.name || '',
              rules: [
                {
                  required: creationType === 'clone',
                },
              ],
            })(<Select defaultValue={availBackingImages[0]?.name || ''}>
              {availBackingImages.map(image => <Option key={image.name} value={image.name}>{image.name}</Option>)}
            </Select>)}
            </FormItem>
            <FormItem label="Encryption" {...formItemLayout}>
              {getFieldDecorator('encryption', {
                valuePropName: 'encryption',
                initialValue: 'encrypt',
                rules: [
                  {
                    required: creationType === 'clone',
                  },
                ],
              })(<Select defaultValue="encrypt">
                  <Option key="encrypt" value="encrypt">encrypt</Option>
                  <Option key="decrypt" value="decrypt">decrypt</Option>
                  <Option key="ignore" value="ignore">ignore (simply copy the backing image)</Option>
              </Select>)}
            </FormItem>
            <FormItem label="Secret" hasFeedback {...formItemLayout}>
              {getFieldDecorator('secret', {
                initialValue: '',
                rules: [
                  {
                    required: creationType === 'clone' && ['encrypt', 'decrypt'].includes(getFieldValue('encryption')),
                    message: 'Please input secret name',
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem label="Secret Namespace" hasFeedback {...formItemLayout}>
              {getFieldDecorator('secretNamespace', {
                initialValue: item.name,
                rules: [
                  {
                    required: creationType === 'clone' && ['encrypt', 'decrypt'].includes(getFieldValue('encryption')),
                    message: 'Please input secret namespace',
                  },
                ],
              })(<Input />)}
            </FormItem>
          </>
        )}
        <FormItem label="Minimum Number of Copies" {...formItemLayout}>
          {getFieldDecorator('minNumberOfCopies', {
            initialValue: defaultNumberOfReplicas,
            rules: [
              {
                required: true,
                message: 'Please input the min number of copies',
              },
            ],
          })(<InputNumber min={1} />)}
        </FormItem>
        <Spin spinning={tagsLoading}>
          <FormItem label="Node Tag" {...formItemLayout}>
            {getFieldDecorator('nodeSelector', {
              initialValue: [],
            })(<Select mode="multiple">
            { nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label="Disk Tag" {...formItemLayout}>
            {getFieldDecorator('diskSelector', {
              initialValue: [],
            })(<Select mode="multiple">
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
  item: PropTypes.object,
  onOk: PropTypes.func,
  tagsLoading: PropTypes.bool,
  volumeNameOptions: PropTypes.array,
  defaultNumberOfReplicas: PropTypes.number,
  nodeTags: PropTypes.array,
  diskTags: PropTypes.array,
  backingImageOptions: PropTypes.array,
}

export default Form.create()(modal)
