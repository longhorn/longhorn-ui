import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, InputNumber, Radio, Select, Icon, Alert, Table } from 'antd'
import { ModalBlur } from '../../components'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 },
}

class CreateSnapshotGroupModal extends React.Component {
  constructor(props) {
    super(props)
    const item = props.item || {}
    this.state = {
      selectionMode: item.volumeSelector ? 'selector' : 'volumes',
      labelRules: this.toKVList(item.labels),
      selectorRules: this.toKVList(item.volumeSelector?.matchLabels),
      selectorError: '',
    }
    this.previewTimer = null
  }

  componentDidMount() {
    // Recreate pre-fills a label selector; preview the matching volumes right away.
    if (this.state.selectionMode === 'selector') {
      this.triggerPreview()
    }
  }

  componentWillUnmount() {
    if (this.previewTimer) {
      clearTimeout(this.previewTimer)
    }
  }

  // Debounce the preview request so rapid selector edits fire a single call.
  schedulePreview = () => {
    if (this.previewTimer) {
      clearTimeout(this.previewTimer)
    }
    this.previewTimer = setTimeout(() => this.triggerPreview(), 1000)
  }

  toKVList = (obj) => {
    if (obj && Object.keys(obj).length > 0) {
      return Object.keys(obj).map(key => ({ key, value: obj[key] }))
    }
    return [{ key: '', value: '' }]
  }

  fromKVList = (list) => {
    const result = {}
    list.forEach(({ key, value }) => {
      if (key && key.trim()) {
        result[key.trim()] = (value || '').trim()
      }
    })
    return result
  }

  handleModeChange = (e) => {
    this.setState({ selectionMode: e.target.value })
  }

  updateKV = (listName, index, field, value) => {
    const list = [...this.state[listName]]
    list[index] = { ...list[index], [field]: value }
    this.setState({ [listName]: list, selectorError: '' }, () => {
      if (listName === 'selectorRules') {
        this.schedulePreview()
      }
    })
  }

  addKV = (listName) => {
    this.setState({ [listName]: [...this.state[listName], { key: '', value: '' }] })
  }

  removeKV = (listName, index) => {
    const list = this.state[listName].filter((_, i) => i !== index)
    this.setState({ [listName]: list.length ? list : [{ key: '', value: '' }] }, () => {
      if (listName === 'selectorRules') {
        this.schedulePreview()
      }
    })
  }

  triggerPreview = () => {
    const { onPreview, onClearPreview, form } = this.props
    if (this.state.selectionMode !== 'selector' || !onPreview) {
      return
    }
    // Only preview label rules where both key and value are filled.
    const matchLabels = {}
    this.state.selectorRules.forEach(({ key, value }) => {
      if (key && key.trim() && value && value.trim()) {
        matchLabels[key.trim()] = value.trim()
      }
    })
    if (Object.keys(matchLabels).length === 0) {
      onClearPreview?.()
      return
    }
    onPreview({
      name: form.getFieldValue('name'),
      volumeSelector: { matchLabels },
    })
  }

  buildPayload = () => {
    const { form } = this.props
    const values = form.getFieldsValue()
    const payload = {
      name: values.name?.trim(),
      deadlineSeconds: values.deadlineSeconds,
    }
    const labels = this.fromKVList(this.state.labelRules)
    if (Object.keys(labels).length > 0) {
      payload.labels = labels
    }
    if (this.state.selectionMode === 'volumes') {
      payload.volumes = values.volumes || []
    } else {
      payload.volumeSelector = { matchLabels: this.fromKVList(this.state.selectorRules) }
    }
    return payload
  }

  handleOk = () => {
    const { form, onOk } = this.props
    form.validateFields((errors) => {
      if (errors) {
        return
      }
      if (this.state.selectionMode === 'volumes') {
        const volumes = form.getFieldValue('volumes')
        if (!volumes || volumes.length === 0) {
          form.setFields({ volumes: { errors: [new Error('At least one volume is required')] } })
          return
        }
      } else {
        const matchLabels = {}
        this.state.selectorRules.forEach(({ key, value }) => {
          if (key && key.trim() && value && value.trim()) {
            matchLabels[key.trim()] = value.trim()
          }
        })
        if (Object.keys(matchLabels).length === 0) {
          this.setState({ selectorError: 'At least one label selector (key and value) is required' })
          return
        }
      }
      onOk(this.buildPayload())
    })
  }

  renderKVRules = (listName) => {
    return this.state[listName].map((rule, index) => (
      <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <Input
          placeholder="key"
          value={rule.key}
          style={{ width: 160, marginRight: 8 }}
          onChange={(e) => this.updateKV(listName, index, 'key', e.target.value)}
        />
        <Input
          placeholder="value"
          value={rule.value}
          style={{ width: 160, marginRight: 8 }}
          onChange={(e) => this.updateKV(listName, index, 'value', e.target.value)}
        />
        <Icon type="minus-circle-o" style={{ marginRight: 8, cursor: 'pointer' }} onClick={() => this.removeKV(listName, index)} />
        {index === this.state[listName].length - 1 && (
          <Icon type="plus-circle-o" style={{ cursor: 'pointer' }} onClick={() => this.addKV(listName)} />
        )}
      </div>
    ))
  }

  render() {
    const {
      item = {}, visible, onCancel, volumeOptions = [], previewData = [], previewLoading, errorMessage,
      form: { getFieldDecorator },
    } = this.props
    const { selectionMode } = this.state

    const selectedVolumes = this.props.form.getFieldValue('volumes') || []
    // volumes / label selector is required: disable OK when nothing resolves to a member.
    const okDisabled = selectionMode === 'volumes'
      ? selectedVolumes.length === 0
      : previewData.length === 0

    const modalOpts = {
      title: 'Create Snapshot Group',
      visible,
      onCancel,
      width: 800,
      okDisabled,
      onOk: this.handleOk,
    }

    const previewColumns = [
      { title: 'Volume', dataIndex: 'volumeName', key: 'volumeName' },
    ]

    return (
      <ModalBlur {...modalOpts}>
        <Form layout="horizontal">
          <FormItem label="Name" hasFeedback {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: item.name || '',
              rules: [
                { required: true, message: 'Snapshot group name is required' },
                { max: 54, message: 'Snapshot group name must be at most 54 characters' },
              ],
            })(<Input onChange={this.schedulePreview} />)}
          </FormItem>

          <FormItem label="Select members by" required {...formItemLayout}>
            <RadioGroup value={selectionMode} onChange={this.handleModeChange}>
              <Radio value="volumes">Volumes</Radio>
              <Radio value="selector">Label selector</Radio>
            </RadioGroup>
          </FormItem>

          {selectionMode === 'volumes' ? (
            <FormItem label="Volumes" hasFeedback={selectedVolumes.length > 0} {...formItemLayout}>
              {getFieldDecorator('volumes', {
                initialValue: item.volumes || [],
                rules: [
                  { required: true, message: 'At least one volume is required' },
                ],
              })(
                <Select mode="multiple" placeholder="Select volumes" filterOption={(input, option) => option.props.children.toLowerCase().includes(input.toLowerCase())}>
                  {volumeOptions.map(name => <Option key={name} value={name}>{name}</Option>)}
                </Select>
              )}
            </FormItem>
          ) : (
            <FormItem
              label="Label selector"
              required
              validateStatus={this.state.selectorError ? 'error' : ''}
              help={this.state.selectorError || ''}
              {...formItemLayout}
            >
              {this.renderKVRules('selectorRules')}
            </FormItem>
          )}

          <FormItem label="Engine snapshot labels" {...formItemLayout}>
            {this.renderKVRules('labelRules')}
          </FormItem>

          <FormItem label="Deadline seconds" {...formItemLayout}>
            {getFieldDecorator('deadlineSeconds', {
              initialValue: item.deadlineSeconds || 300,
            })(<InputNumber min={10} max={3600} />)}
          </FormItem>

          {selectionMode === 'selector' && (
            <div style={{ marginBottom: 16 }}>
              <Table
                size="small"
                columns={previewColumns}
                dataSource={previewData}
                loading={previewLoading}
                rowKey={record => record.volumeName}
                pagination={false}
                locale={{ emptyText: 'No matching volumes' }}
              />
            </div>
          )}

          {errorMessage && (
            <Alert type="error" message={errorMessage} style={{ marginTop: 8 }} />
          )}
        </Form>
      </ModalBlur>
    )
  }
}

CreateSnapshotGroupModal.propTypes = {
  item: PropTypes.object,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  onPreview: PropTypes.func,
  onClearPreview: PropTypes.func,
  volumeOptions: PropTypes.array,
  previewData: PropTypes.array,
  previewLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
  form: PropTypes.object.isRequired,
}

export default Form.create()(CreateSnapshotGroupModal)
