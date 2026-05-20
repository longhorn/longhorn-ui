import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Select, Spin, Checkbox, Alert, Popover } from 'antd'
import { ModalBlur } from '../../components'
import { formatMib } from '../../utils/formatter'
import { safeParseJSON } from '../../utils/formatDate'
import { withTranslation } from 'react-i18next'

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
  item = {},
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
    setFieldsValue
  },
  t,
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      const data = {
        ...getFieldsValue(),
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: t('createStandbyVolumeModal.modal.title'),
    visible,
    onCancel,
    onOk: handleOk,
    width: 700,
  }

  const showWarning = backupVolumes?.some((backupVolume) => backupVolume.name === getFieldsValue().name)
  const message = t('createStandbyVolumeModal.warning.sameNameMessage', { volumeName: getFieldsValue().name })

  const parsedReplicas = safeParseJSON(item.numberOfReplicas)
  const initialDataEngine = v1DataEngineEnabled ? 'v1' : 'v2'
  const initialReplicas = parseInt(parsedReplicas[initialDataEngine] ?? 3, 10)

  // filter options based on selected data engine version
  const handleDataEngineChange = (engine) => {
    const replicas = parseInt(parsedReplicas[engine] ?? 3, 10)
    setFieldsValue({ ...getFieldsValue(), numberOfReplicas: replicas }) // update number of replicas
  }

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <Popover placement="right"
          visible={showWarning}
          content={<div style={{ maxWidth: 200 }}>
            <Alert message={message} type="warning" />
          </div>}>
          <FormItem label={t('common.name')} hasFeedback {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: item.name,
              rules: [
                {
                  required: true,
                  message: t('createStandbyVolumeModal.form.name.validationMessage'),
                },
              ],
            })(<Input />)}
          </FormItem>
        </Popover>
        <FormItem label={t('columns.size')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('size', {
            initialValue: formatMib(item.size),
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
                  if (value < 1 || value > 65536) {
                    callback(t('common.validation.valueBetween', { min: 1, max: 65536 }))
                  } else if (!/^\d+([.]\d{1,2})?$/.test(value)) {
                    callback(t('createStandbyVolumeModal.form.size.validator.decimalPlaces'))
                  } else {
                    callback()
                  }
                },
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
                validator: (rule, value, callback) => {
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
              {
                required: true,
                message: t('createStandbyVolumeModal.form.numberOfReplicas.validationMessage'),
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
                    callback(t('createStandbyVolumeModal.form.numberOfReplicas.validator.positiveInteger'))
                  } else {
                    callback()
                  }
                },
              },
            ],
          })(<InputNumber />)}
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
            initialValue: item.backingImage,
          })(<Select disabled>
            { backingImages.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label={t('common.encrypted')} {...formItemLayout}>
        {getFieldDecorator('encrypted', {
          valuePropName: 'encrypted',
          initialValue: false,
        })(<Checkbox />)}
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
        <FormItem label={t('columns.backupBlockSize')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('backupBlockSize', {
            initialValue: ['0', '2097152', '16777216'].includes(String(item.blockSize))
              ? String(item.blockSize)
              : '0',
          })(
            <Select disabled>
              <Option key="ignored" value="0">{t('createStandbyVolumeModal.form.backupBlockSize.options.ignored')}</Option>
              <Option key="2Mi" value="2097152">2 Mi</Option>
              <Option key="16Mi" value="16777216">16 Mi</Option>
            </Select>
          )}
        </FormItem>
        <div style={{ display: 'none' }}>
          <FormItem label={t('createStandbyVolumeModal.form.backupUrl.label')} hasFeedback {...formItemLayout}>
            {getFieldDecorator('fromBackup', {
              initialValue: item.fromBackup,
              rules: [
                {
                  required: true,
                  message: t('createStandbyVolumeModal.form.backupUrl.validationMessage'),
                },
              ],
            })(<Input disabled={true} />)}
          </FormItem>
        </div>
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
