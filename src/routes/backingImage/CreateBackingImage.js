/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Select, Upload, Button, Icon, InputNumber, Spin } from 'antd'
import { ModalBlur } from '../../components'
import { hasReadyBackingDisk } from '../../utils/status'
import { safeParseJSON } from '../../utils/formatDate'
import { withTranslation } from 'react-i18next'

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
    dataEngine: getFieldValue('dataEngine'),
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
  v1DataEngineEnabled = true,
  v2DataEngineEnabled = false,
  t,
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
    title: t('createBackingImage.title'),
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
  const parsedReplicas = safeParseJSON(defaultNumberOfReplicas)
  const initialDataEngine = v1DataEngineEnabled ? 'v1' : 'v2'
  const initialReplicas = parseInt(parsedReplicas[initialDataEngine] ?? 3, 10)

  // filter options based on selected data engine version
  const handleDataEngineChange = (engine) => {
    const replicas = parseInt(parsedReplicas[engine] ?? 3, 10)
    setFieldsValue({ ...getFieldsValue(), minNumberOfCopies: replicas }) // update number of replicas
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label={t('common.name')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: t('createBackingImage.form.name.rules.required'),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label={t('createBackingImage.form.createdFrom.label')} {...formItemLayout}>
          {getFieldDecorator('sourceType', {
            valuePropName: 'sourceType',
            initialValue: 'download',
            rules: [
              {
                required: true,
              },
            ],
          })(<Select defaultValue={'download'} onChange={() => {}}>
            <Option value={'download'}>{t('createBackingImage.form.createdFrom.options.download')}</Option>
            <Option value={'upload'}>{t('createBackingImage.form.createdFrom.options.upload')}</Option>
            <Option value={'volume'}>{t('createBackingImage.form.createdFrom.options.volume')}</Option>
            <Option value={'clone'}>{t('createBackingImage.form.createdFrom.options.clone')}</Option>
          </Select>)}
        </FormItem>
        {/* Display when select type = volume */}
        {allowDisplayTypes(creationType, ['volume']) && (
          <>
            <FormItem label={t('createBackingImage.form.volumeName.label')} {...formItemLayout}>
              {getFieldDecorator('volumeName', {
                initialValue: '',
                rules: [
                  {
                    required: creationType === 'volume',
                    message: t('createBackingImage.form.volumeName.rules.required'),
                  },
                ],
              })(<Select>
            {volumeNameOptions.map(vol => <Option key={vol} value={vol}>{vol}</Option>)}
          </Select>)}
            </FormItem>
            <FormItem label={t('createBackingImage.form.exportedBackingImageType.label')} {...formItemLayout}>
              {getFieldDecorator('exportType', {
                valuePropName: 'exportType',
                initialValue: 'raw',
                rules: [
                  {
                    required: true,
                  },
                ],
              })(<Select defaultValue={'raw'}>
                <Option value={'raw'}>{t('createBackingImage.form.exportedBackingImageType.options.raw')}</Option>
                <Option value={'qcow2'}>{t('createBackingImage.form.exportedBackingImageType.options.qcow2')}</Option>
              </Select>)}
            </FormItem>
          </>
        )}
        {/* Display when select type = download */}
        {allowDisplayTypes(creationType, ['download']) && (
          <FormItem label={t('createBackingImage.form.url.label')} {...formItemLayout}>
          {getFieldDecorator('url', {
            initialValue: item.url,
            rules: [
              {
                required: creationType === 'download',
                message: t('createBackingImage.form.url.rules.required'),
              },
            ],
          })(<Input disabled={!(creationType === 'download')} />)}
          </FormItem>
        )}
        {/* Display when select type = upload */}
        {allowDisplayTypes(creationType, ['upload']) && (
          <FormItem label={t('createBackingImage.form.file.label')} {...formItemLayout}>
          {getFieldDecorator('fileContainer', {
            valuePropName: 'fileContainer',
            initialValue: null,
            rules: [
              {
                required: creationType === 'upload',
                message: t('createBackingImage.form.file.rules.required'),
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
                      callback(t('createBackingImage.form.file.rules.multipleOf512'))
                    }
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<Upload {...uploadProps}>
            <Button disabled={!(creationType === 'upload')}>
              <Icon type="upload" /> {t('createBackingImage.form.file.uploadButton')}
            </Button>
          </Upload>)}
          <span style={{ marginLeft: 10 }}>{ getFieldsValue().fileContainer && getFieldsValue().fileContainer.file ? getFieldsValue().fileContainer.file.name : ''}</span>
          </FormItem>
        )}
        {allowDisplayTypes(creationType, ['download', 'upload']) && (
          <FormItem label={t('createBackingImage.form.expectedChecksum.label')} {...formItemLayout}>
            {getFieldDecorator('expectedChecksum', {
              initialValue: '',
              rules: [
                {
                  required: false,
                },
              ],
            })(<Input placeholder={t('createBackingImage.form.expectedChecksum.placeholder')} />)}
          </FormItem>
        )}

        {/* Display when select type = clone */}
        {allowDisplayTypes(creationType, ['clone']) && (
          <>
            <FormItem label={t('createBackingImage.form.sourceBackingImage.label')} {...formItemLayout}>
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
            <FormItem label={t('createBackingImage.form.encryption.label')} {...formItemLayout}>
              {getFieldDecorator('encryption', {
                valuePropName: 'encryption',
                initialValue: 'encrypt',
                rules: [
                  {
                    required: creationType === 'clone',
                  },
                ],
              })(<Select defaultValue="encrypt">
                  <Option key="encrypt" value="encrypt">{t('createBackingImage.form.encryption.options.encrypt')}</Option>
                  <Option key="decrypt" value="decrypt">{t('createBackingImage.form.encryption.options.decrypt')}</Option>
                  <Option key="ignore" value="ignore">{t('createBackingImage.form.encryption.options.ignore')}</Option>
              </Select>)}
            </FormItem>
            <FormItem label={t('createBackingImage.form.secret.label')} hasFeedback {...formItemLayout}>
              {getFieldDecorator('secret', {
                initialValue: '',
                rules: [
                  {
                    required: creationType === 'clone' && ['encrypt', 'decrypt'].includes(getFieldValue('encryption')),
                    message: t('createBackingImage.form.secret.rules.required'),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem label={t('createBackingImage.form.secretNamespace.label')} hasFeedback {...formItemLayout}>
              {getFieldDecorator('secretNamespace', {
                initialValue: item.name,
                rules: [
                  {
                    required: creationType === 'clone' && ['encrypt', 'decrypt'].includes(getFieldValue('encryption')),
                    message: t('createBackingImage.form.secretNamespace.rules.required'),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </>
        )}
        <FormItem label={t('createBackingImage.form.minNumberOfCopies.label')} {...formItemLayout}>
          {getFieldDecorator('minNumberOfCopies', {
            initialValue: initialReplicas,
            rules: [
              {
                required: true,
                message: t('createBackingImage.form.minNumberOfCopies.rules.required'),
              },
            ],
          })(<InputNumber min={1} />)}
        </FormItem>
        <FormItem label={t('columns.dataEngine')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataEngine', {
            initialValue: initialDataEngine,
            rules: [
              {
                validator: (_rule, value, callback) => {
                  if ((value === 'v1' && !v1DataEngineEnabled) || (value === 'v2' && !v2DataEngineEnabled)) {
                    callback(t('createBackingImage.form.dataEngine.rules.notEnabled', { value }))
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(
            <Select onChange={handleDataEngineChange}>
              <Option value="v1">{t('createBackingImage.form.dataEngine.options.v1')}</Option>
              <Option value="v2">{t('createBackingImage.form.dataEngine.options.v2')}</Option>
            </Select>
          )}
        </FormItem>
        <Spin spinning={tagsLoading}>
          <FormItem label={t('common.nodeTag')} {...formItemLayout}>
            {getFieldDecorator('nodeSelector', {
              initialValue: [],
            })(<Select mode="multiple">
            { nodeTags.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>) }
            </Select>)}
          </FormItem>
        </Spin>
        <Spin spinning={tagsLoading}>
          <FormItem label={t('common.diskTag')} {...formItemLayout}>
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
  v1DataEngineEnabled: PropTypes.bool,
  v2DataEngineEnabled: PropTypes.bool,
  t: PropTypes.func,
}

export default withTranslation()(Form.create()(modal))
