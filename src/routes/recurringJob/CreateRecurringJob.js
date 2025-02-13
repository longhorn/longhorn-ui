import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Icon, Button, Select, InputNumber, Checkbox, Tooltip } from 'antd'
import { ModalBlur, ReactCron } from '../../components'

const Option = Select.Option
const FormItem = Form.Item

let id = 1

const formItemLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 17,
  },
}

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    span: 17,
    offset: 4,
  },
}

const formItemForAddLabels = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 18,
  },
}

const formItemLayoutWithOutForAddLabels = {
  wrapperCol: {
    span: 17,
    offset: 5,
  },
}

const noRetain = (val) => {
  return val === 'snapshot-cleanup' || val === 'filesystem-trim'
}

const modal = ({
  item,
  visible,
  isEdit,
  onCancel,
  onOk,
  cronProps,
  addForVolume = false,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
    getFieldValue,
    setFieldsValue,
  },
}) => {
  const isSystemBackup = getFieldValue('task') === 'system-backup'

  function handleOk() {
    validateFields((errors) => {
      if (errors) {
        return
      }
      // TODO: extract below logic to getData function
      const data = {
        ...getFieldsValue(),
      }
      if (data.forceCreate) {
        if (data.task === 'snapshot') {
          data.task = 'snapshot-force-create'
        }
        if (data.task === 'backup') {
          data.task = 'backup-force-create'
        }
      }
      if (data.groups) {
        data.groups = data.groups.filter((group) => group)
        data.groups = data.groups && new Set(data.groups)
      } else {
        // If groups is null change it to empty array
        data.groups = []
      }
      if (data.labels) {
        const labels = data.labels.filter((label) => label)
        if (labels && labels.length > 0) {
          let obj = {}
          data.labels = labels.forEach(label => {
            if (label.key && label.value) {
              obj[label.key] = label.value
            }
          })
          data.labels = obj
        }
      }
      if (data.keys) {
        delete data.keys
      }
      if (data.keysForlabels) {
        delete data.keysForlabels
      }
      delete data.defaultGroup
      if (data.parametersKey && data.parametersValue?.toString()) {
        data.parameters = {}
        data.parameters[data.parametersKey] = data.parametersValue.toString()
      }
      delete data.parametersKey
      delete data.parametersValue
      onOk(data)
    })
  }

  const modalOpts = {
    title: `${isEdit ? 'Edit' : 'Create'} Recurring Job`,
    visible,
    onCancel,
    width: 800,
    onOk: handleOk,
    style: { top: 0 },
  }
  const remove = k => {
    const keys = getFieldValue('keys')
    if (keys.length === 1) {
      return
    }
    setFieldsValue({
      keys: keys.filter(key => key.index !== k.index),
    })
  }
  const add = () => {
    const currentKeys = getFieldValue('keys')
    const nextKeys = currentKeys.concat({ index: id++, initialValue: '' })
    setFieldsValue({
      keys: nextKeys,
    })
  }
  const addDefaultGroup = () => {
    let groups = getFieldValue('groups')
    let currentId = groups ? groups.length - 1 : 0
    if (getFieldValue('groups')[currentId]) {
      const currentKeys = getFieldValue('keys')
      const nextKeys = currentKeys.concat({ index: id++, initialValue: 'default' })
      setFieldsValue({
        keys: nextKeys,
      })
    } else {
      groups[currentId] = 'default'
      setFieldsValue({
        groups,
      })
    }
  }

  const handleParameterChange = (value) => {
    // clear parametersValue if parametersKey is cleared
    if (value === undefined) {
      setFieldsValue({
        parametersValue: '',
      })
    }
  }

  const onCronOk = () => {
    // CronProps.cron changed by the parent component and passed on to the current component.
    setFieldsValue({
      cron: cronProps.cron,
    })
    cronProps.onCronCancel()
  }

  const onChangeTask = (val) => {
    if (noRetain(val)) {
      setFieldsValue({
        retain: 0,
      })
    } else if (getFieldValue('retain') === 0) {
      setFieldsValue({
        retain: 1,
      })
    }

    // set initial parameter values when the task changes
    if (val === 'backup') {
      setFieldsValue({
        parametersKey: '',
        parametersValue: '',
      })
    } else if (val === 'system-backup') {
      setFieldsValue({
        parametersKey: 'volume-backup-policy',
        parametersValue: 'if-not-present',
      })
    }
  }
  const showForceCreateCheckbox = () => {
    return getFieldValue('task') === 'backup' || getFieldValue('task') === 'snapshot'
  }


  // init params
  getFieldDecorator('keys', { initialValue: isEdit && item.groups && item.groups.length > 0 ? item.groups.map((group, index) => { return { initialValue: group, index } }) : [{ index: 0, initialValue: '' }] })
  getFieldDecorator('keysForlabels', { initialValue: isEdit && item.labels ? Object.keys(item.labels).map((_, index) => index) : [0] })

  const keys = getFieldValue('keys')
  const formGroups = keys.map((k, index) => (
    <Form.Item
      {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
      label={index === 0 ? 'Groups' : ''}
      key={k.index}
    >
      {getFieldDecorator(`groups[${k.index}]`, {
        initialValue: k.initialValue,
        validateTrigger: ['onChange', 'onBlur'],
        rules: [
          {
            required: false,
            whitespace: true,
            message: 'Please input Group Name',
          },
        ],
      })(<Input placeholder="Group name" style={{ width: '80%', marginRight: 8 }} />)}
      {keys.length > 1 ? (
        <Icon
          className="dynamic-delete-button"
          type="minus-circle-o"
          onClick={() => remove(k)}
        />
      ) : null}
    </Form.Item>
  ))
  const removeLabel = k => {
    const currentKeys = getFieldValue('keysForlabels')
    if (currentKeys.length === 1) {
      return
    }
    setFieldsValue({
      keysForlabels: currentKeys.filter(key => key !== k),
    })
  }
  const addLabel = () => {
    const currentKeys = getFieldValue('keysForlabels')
    const nextKeys = currentKeys.concat(id++)
    setFieldsValue({
      keysForlabels: nextKeys,
    })
  }
  const keysForlabels = getFieldValue('keysForlabels')
  const formLabels = keysForlabels.map((k, index) => (
    <div key={`${k}-label`} style={{ display: 'flex' }}>
      <div style={{ width: '45%', paddingLeft: '67px' }}>
        <Form.Item
          {...(index === 0 ? formItemForAddLabels : formItemLayoutWithOutForAddLabels)}
          label={index === 0 ? 'Labels' : ''}
          key={`${k}-key`}
        >
          {getFieldDecorator(`labels[${k}].key`, {
            initialValue: isEdit && item.labels ? Object.keys(item.labels)[k] : '',
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: false,
              },
            ],
          })(<Input placeholder="key" style={{ width: '95%', marginRight: 8 }} />)}
        </Form.Item>
      </div>
      <div style={{ flex: 1 }}>
        <Form.Item
          wrapperCol={{ span: 17, offset: 0 }}
          label={''}
          key={`${k}-value`}
        >
          {getFieldDecorator(`labels[${k}].value`, {
            initialValue: isEdit && item.labels ? item.labels[Object.keys(item.labels)[k]] : '',
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                required: false,
              },
            ],
          })(<Input placeholder="value" style={{ width: '72%', marginRight: 8 }} />)}
          {keysForlabels.length > 1 ? (
            <Icon
              className="dynamic-delete-button"
              type="minus-circle-o"
              onClick={() => removeLabel(k)}
            />
          ) : null}
        </Form.Item>
      </div>
    </div>
  ))
  const nameGeneration = getFieldValue('name') ? getFieldValue('name') : `c-${Math.random().toString(36).substr(2, 6)}`
  const disableAddDefaultGroup = getFieldValue('keys').some((k) => getFieldValue('groups')[k.index] === 'default')
  const isParametersValueRequired = !!getFieldValue('parametersKey')
  const showParametersField = getFieldValue('task') === 'backup' || getFieldValue('task') === 'backup-force-create' || isSystemBackup
  const showConcurrency = !isSystemBackup
  const showGroup = !isSystemBackup
  const showLabels = !isSystemBackup
  const systemBackupParameterOptions = ['if-not-present', 'always', 'disabled']

  return (
    <ModalBlur {...modalOpts}>
      <Form layout="horizontal">
        <FormItem label="Name" hasFeedback {...formItemLayout}>
          {getFieldDecorator('name', {
            initialValue: isEdit ? item.name : nameGeneration,
            rules: [
              {
                required: true,
                message: 'Please input Recurring Job name',
              },
            ],
          })(<Input disabled={isEdit || addForVolume} style={{ width: '80%' }} />)}
        </FormItem>
        <div style={{ display: 'flex' }}>
          <FormItem label="Task" style={{ flex: 1 }} hasFeedback labelCol={{ span: showForceCreateCheckbox() ? 7 : 4 }} wrapperCol={{ span: 17 }}>
            {getFieldDecorator('task', {
              initialValue: isEdit ? item.task : 'snapshot',
              rules: [
                {
                  required: true,
                },
              ],
            })(<Select disabled={isEdit} style={{ width: '80%' }} onChange={onChangeTask}>
                <Option value="backup">Backup</Option>
                <Option value="snapshot">Snapshot</Option>
                <Option value="snapshot-delete">Snapshot Delete</Option>
                <Option value="snapshot-cleanup">Snapshot Cleanup</Option>
                <Option value="system-backup">System Backup</Option>
                <Option value="filesystem-trim">Filesystem Trim</Option>
            </Select>)}
          </FormItem>
          {showForceCreateCheckbox() && <Tooltip
            placement="topLeft"
            title={`Create ${getFieldValue('task') === 'backup' ? 'backups' : 'snapshots'} periodically, even if expired ${getFieldValue('task') === 'backup' ? 'backups' : 'snapshots'} cannot be cleaned up.`}>
              <FormItem label="Force Create" style={{ width: 325 }} labelCol={{ span: 8 }} wrapperCol={{ span: 4 }}>
                {getFieldDecorator('forceCreate', {
                  valuePropName: 'checked',
                  initialValue: false,
                })(<Checkbox></Checkbox>)}
              </FormItem>
          </Tooltip>}
        </div>
        <FormItem label="Retain" hasFeedback {...formItemLayout}>
          {getFieldDecorator('retain', {
            initialValue: isEdit ? item.retain : 1,
            rules: [
              {
                required: true,
              },
            ],
          })(<InputNumber disabled={noRetain(getFieldValue('task'))} style={{ width: '80%' }} min={0} />)}
        </FormItem>
        {showConcurrency && (
          <FormItem label="Concurrency" hasFeedback {...formItemLayout}>
            {getFieldDecorator('concurrency', {
              initialValue: isEdit ? item.concurrency : 1,
              rules: [
                {
                  required: true,
                },
              ],
            })(<InputNumber style={{ width: '80%' }} min={1} />)}
          </FormItem>
        )}
        <FormItem label="Cron" {...formItemLayout}>
          {getFieldDecorator('cron', {
            initialValue: cronProps.cron,
            rules: [
              {
                required: true,
                message: 'Please edit cron expressions',
              },
            ],
          })(<Input style={{ width: '80%' }} />)}
          <Button style={{ marginLeft: 5 }} onClick={cronProps.openCronModal}>Edit</Button>
        </FormItem>
        {showParametersField && (
          <div style={{ display: 'flex' }}>
            <FormItem label="Parameters" style={{ flex: '1 50%' }} labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
              {isSystemBackup
                ? getFieldDecorator('parametersKey', {
                  initialValue: isEdit && item?.parameters && Object.keys(item.parameters)[0]
                    ? Object.keys(item.parameters)[0]
                    : 'volume-backup-policy',
                  rules: [{ required: true }]
                })(
                  <Select style={{ width: '100%' }}>
                    <Option value="volume-backup-policy">volume-backup-policy</Option>
                  </Select>
                )
                : getFieldDecorator('parametersKey', {
                  initialValue: isEdit && item?.parameters && Object.keys(item.parameters)[0]
                    ? Object.keys(item.parameters)[0]
                    : ''
                })(
                    <Select style={{ width: '100%' }} allowClear onChange={handleParameterChange}>
                      <Option value="full-backup-interval">full-backup-interval</Option>
                  </Select>
                )
              }
            </FormItem>
            <FormItem style={{ flex: '1 50%' }} {...formItemLayout}>
              {isSystemBackup
                ? getFieldDecorator('parametersValue', {
                  initialValue: isEdit && item?.parameters && Object.keys(item.parameters)[0]
                    ? Object.values(item.parameters)[0]
                    : systemBackupParameterOptions[0],
                })(
                  <Select style={{ width: '66%' }}>
                    {systemBackupParameterOptions.map(option => (
                      <Option key={option} value={option}>{option}</Option>
                    ))}
                  </Select>
                )
                : getFieldDecorator('parametersValue', {
                  initialValue: isEdit && item?.parameters && Object.keys(item.parameters)[0]
                    ? Object.values(item.parameters)[0]
                    : '',
                  rules: [
                    {
                      required: isParametersValueRequired,
                      message: 'Value is required',
                    },
                  ],
                })(
                  <InputNumber min={0} style={{ width: '66%' }} />
                )
              }
            </FormItem>
          </div>
        )}
        { showGroup && (
          <>
            {formGroups}
            <Form.Item {...formItemLayoutWithOutLabel}>
              <span style={{ width: '38%', display: 'inline-block', marginRight: 10 }}>
                <Button type="dashed" style={{ width: '100%' }} onClick={add}>
                  <Icon type="plus" /> Add Group
                </Button>
              </span>
              <span style={{ width: '38%', display: 'inline-block', marginLeft: 10 }}>
                <Tooltip title={'Volume with no recurring jobs or groups will automatically apply to the recurring jobs in the default group.'}>
                  <Button type="dashed" style={{ width: '100%' }} disabled={disableAddDefaultGroup} onClick={addDefaultGroup}>
                    <Icon type="plus" /> Add to default group
                  </Button>
                </Tooltip>
              </span>
            </Form.Item>
          </>
        )}
        { showLabels && (
          <>
            {formLabels}
            <Form.Item {...formItemLayoutWithOutLabel}>
              <Button type="dashed" onClick={addLabel} style={{ width: '80%' }}>
                <Icon type="plus" /> Add Label
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
      <ModalBlur disabled={cronProps.modulerCronDisabled} {...cronProps.modalCronOpts} width={880} onCancel={() => { cronProps.onCronCancel() }} onOk={() => { onCronOk() }}>
        <ReactCron cron={cronProps.cron} key={cronProps.ReactCronKey} saveDisabled={cronProps.saveDisabled} changeCron={cronProps.changeCron} />
      </ModalBlur>
    </ModalBlur>
  )
}

modal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  item: PropTypes.object,
  onOk: PropTypes.func,
  cronProps: PropTypes.object,
  isEdit: PropTypes.bool,
  addForVolume: PropTypes.bool,
}

export default Form.create()(modal)
