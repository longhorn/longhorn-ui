import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Checkbox, Spin, Select, Popover, Alert } from 'antd'
import { ModalBlur } from '../../components'
import { safeParseJSON } from '../../utils/formatDate'
import { withTranslation } from 'react-i18next'

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
  item = {},
  visible,
  onCancel,
  onOk,
  previousChecked,
  nodeTags,
  diskTags,
  tagsLoading,
  backingImages,
  backupVolumes,
  setPreviousChange,
  v1DataEngineEnabled,
  v2DataEngineEnabled,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    setFieldsValue,
  },
  t,
}) => {
  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      // use the backup target name from the original backupVolume
      const targetBackupVolume = backupVolumes.find(bkVol => bkVol.volumeName === item.volumeName) || {}
      const data = {
        ...getFieldsValue(),
        fromBackup: item.fromBackup,
        backupTargetName: targetBackupVolume?.backupTargetName || '',
        volumeName: getFieldsValue().name,
      }
      if (data.name && typeof data.name === 'string') {
        data.name = data.name.trimLeftAndRight()
      }
      onOk(data)
    })
  }

  const modalOpts = {
    title: t('restoreBackupModal.modal.title', { backupName: item.backupName }),
    visible,
    onCancel,
    onOk: handleOk,
    width: 700,
  }

  function onPreviousChange(value) {
    if (item.volumeName) {
      value.target.checked ? setFieldsValue({ name: item.volumeName }) : setFieldsValue({ name: '' })
    }
    setPreviousChange(value.target.checked)
  }

  const showWarning = backupVolumes?.some((backupVolume) => backupVolume.name === getFieldsValue().name)
  const message = t('restoreBackupModal.warning.sameNameMessage', { volumeName: getFieldsValue().name })
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
          content={<div style={{ maxWidth: 250 }}>
            <Alert message={message} type="warning" />
          </div>}>
          <FormItem label={t('common.name')} hasFeedback {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: item.name,
              rules: [
                {
                  required: true,
                  message: t('restoreBackupModal.form.name.validationMessage'),
                },
              ],
            })(<Input />)}
          </FormItem>
        </Popover>
        <FormItem label={t('restoreBackupModal.form.usePreviousName.label')} hasFeedback {...formItemLayout}>
          <Checkbox checked={previousChecked} disabled={!item.volumeName} onChange={onPreviousChange} />
        </FormItem>
        <FormItem label={t('columns.dataEngine')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('dataEngine', {
            initialValue: initialDataEngine,
            rules: [
              {
                required: true,
                message: t('restoreBackupModal.form.dataEngine.validationMessage'),
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
                message: t('restoreBackupModal.form.numberOfReplicas.validationMessage'),
              },
            ],
          })(<InputNumber min={1} />)}
        </FormItem>
        <FormItem label={t('columns.accessMode')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('accessMode', {
            initialValue: item.accessMode,
          })(<Select>
            <Option key={'ReadWriteOnce'} value={'rwo'}>{t('accessModes.rwo')}</Option>
            <Option key={'ReadWriteOncePod'} value={'rwop'}>{t('accessModes.rwop')}</Option>
            <Option key={'ReadWriteMany'} value={'rwx'}>{t('accessModes.rwx')}</Option>
          </Select>)}
        </FormItem>
        <FormItem label={t('common.backingImage')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('backingImage', {
            initialValue: item.backingImage,
          })(<Select allowClear={true} disabled>
            { backingImages.map(backingImage => <Option key={backingImage.name} value={backingImage.name}>{backingImage.name}</Option>) }
          </Select>)}
        </FormItem>
        <FormItem label={t('common.encrypted')} {...formItemLayout}>
        {getFieldDecorator('encrypted', {
          valuePropName: 'encrypted',
          initialValue: false,
        })(<Checkbox></Checkbox>)}
        </FormItem>
        <FormItem label={t('restoreBackupModal.form.restoreVolumeRecurringJob.label')} hasFeedback {...formItemLayout}>
          {getFieldDecorator('restoreVolumeRecurringJob', {
            initialValue: 'ignored',
          })(<Select>
            <Option key={'enabled'} value={'enabled'}>{t('restoreBackupModal.form.restoreVolumeRecurringJob.options.enabled')}</Option>
            <Option key={'disabled'} value={'disabled'}>{t('restoreBackupModal.form.restoreVolumeRecurringJob.options.disabled')}</Option>
            <Option key={'ignored'} value={'ignored'}>{t('restoreBackupModal.form.restoreVolumeRecurringJob.options.ignored')}</Option>
          </Select>)}
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
  item: PropTypes.object,
  visible: PropTypes.bool,
  previousChecked: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  setPreviousChange: PropTypes.func,
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
